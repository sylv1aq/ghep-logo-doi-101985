/**
 * Watermark Studio Pro - Core Rendering Engine
 * Lightroom-Style Precision Calculations & Canvas Rendering
 */

const WatermarkEngine = {
  /**
   * Calculate dimensions and position of watermark on target image
   * @param {number} targetW - Target image width (full-res or preview)
   * @param {number} targetH - Target image height
   * @param {Object} config - Watermark configuration
   * @param {HTMLImageElement|CanvasImageSource} [logoImg] - Preloaded logo if type is image
   * @returns {Object} Calculated metrics { x, y, width, height, angle }
   */
  calculateMetrics(targetW, targetH, config, logoImg = null) {
    let wmWidth = 0;
    let wmHeight = 0;

    // 1. Determine natural aspect ratio of watermark
    let naturalAspect = 1;
    if (config.type === 'image' && logoImg && logoImg.width && logoImg.height) {
      naturalAspect = logoImg.width / logoImg.height;
    } else if (config.type === 'text') {
      // Approximate or pre-calculated text aspect
      const textDim = this.measureTextDimensions(config, targetW);
      naturalAspect = textDim.width / textDim.height;
      wmWidth = textDim.width;
      wmHeight = textDim.height;
    }

    // 2. Calculate Size based on Scale Mode
    if (config.type === 'image') {
      const scalePct = (config.scale || 15) / 100;
      if (config.scaleMode === 'proportional') {
        // Lightroom standard: proportional to the photo's width (or smaller dimension)
        const baseDim = Math.min(targetW, targetH);
        wmWidth = baseDim * scalePct;
        wmHeight = wmWidth / naturalAspect;
      } else if (config.scaleMode === 'fit') {
        const maxW = targetW * 0.9;
        const maxH = targetH * 0.9;
        if (maxW / naturalAspect <= maxH) {
          wmWidth = maxW;
          wmHeight = maxW / naturalAspect;
        } else {
          wmHeight = maxH;
          wmWidth = maxH * naturalAspect;
        }
      } else if (config.scaleMode === 'fill') {
        wmWidth = targetW;
        wmHeight = targetH;
      } else if (config.scaleMode === 'fixed') {
        wmWidth = (logoImg ? logoImg.width : 200) * (scalePct / 0.15);
        wmHeight = wmWidth / naturalAspect;
      }
    } else {
      // Text proportional scale
      const scalePct = (config.scale || 15) / 100;
      const baseDim = Math.min(targetW, targetH);
      const textDim = this.measureTextDimensions(config, targetW, baseDim * scalePct);
      wmWidth = textDim.width;
      wmHeight = textDim.height;
    }

    // 3. Calculate Position based on 9-point Anchor Grid
    // Anchors: 'tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'
    let x = 0;
    let y = 0;
    const anchor = config.anchor || 'br';

    // Horizontal alignment
    if (anchor.includes('l')) {
      x = 0;
    } else if (anchor.includes('c') || anchor === 'mc') {
      x = (targetW - wmWidth) / 2;
    } else if (anchor.includes('r')) {
      x = targetW - wmWidth;
    }

    // Vertical alignment
    if (anchor.startsWith('t')) {
      y = 0;
    } else if (anchor.startsWith('m') || anchor === 'mc') {
      y = (targetH - wmHeight) / 2;
    } else if (anchor.startsWith('b')) {
      y = targetH - wmHeight;
    }

    // 4. Apply Inset / Margins (% of canvas size)
    const insetXPct = (config.insetX !== undefined ? config.insetX : 3) / 100;
    const insetYPct = (config.insetY !== undefined ? config.insetY : 3) / 100;
    const marginX = targetW * insetXPct;
    const marginY = targetH * insetYPct;

    if (anchor.includes('l')) {
      x += marginX;
    } else if (anchor.includes('r')) {
      x -= marginX;
    } else {
      // center anchor can use insetX as horizontal offset
      x += marginX - (targetW * 0.03); 
    }

    if (anchor.startsWith('t')) {
      y += marginY;
    } else if (anchor.startsWith('b')) {
      y -= marginY;
    } else {
      // middle anchor can use insetY as vertical offset
      y += marginY - (targetH * 0.03);
    }

    // If manual custom offset was dragged:
    if (config.customOffset && config.customOffset.enabled) {
      x = targetW * config.customOffset.xRatio;
      y = targetH * config.customOffset.yRatio;
    }

    return {
      x,
      y,
      width: wmWidth,
      height: wmHeight,
      rotation: (config.rotation || 0) * (Math.PI / 180)
    };
  },

  /**
   * Measure text dimensions accurately
   */
  measureTextDimensions(config, targetW, forcedWidth = null) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Scale font relative to target image width (e.g. 5% of target width default)
    let fontSize = config.fontSize || Math.max(16, targetW * 0.035);
    if (forcedWidth) {
      fontSize = forcedWidth * 0.18;
    }

    const fontStyle = `${config.italic ? 'italic ' : ''}${config.bold ? 'bold ' : ''}${fontSize}px "${config.fontFamily || 'Inter'}", sans-serif`;
    ctx.font = fontStyle;

    const lines = (config.text || '© WATERMARK').split('\n');
    let maxWidth = 0;
    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      if (metrics.width > maxWidth) maxWidth = metrics.width;
    });

    const lineHeight = fontSize * 1.25;
    const totalHeight = lineHeight * lines.length;

    // Add padding if background box is enabled
    const pad = config.bgBox && config.bgBox.enabled ? fontSize * 0.4 : 0;

    return {
      width: maxWidth + pad * 2,
      height: totalHeight + pad * 2,
      fontSize,
      fontStyle,
      lineHeight,
      padding: pad,
      lines
    };
  },

  /**
   * Render watermark onto given Canvas Context
   * @param {CanvasRenderingContext2D} ctx - Target 2D rendering context
   * @param {number} targetW - Target width
   * @param {number} targetH - Target height
   * @param {Object} config - Watermark settings
   * @param {HTMLImageElement} [logoImg] - Preloaded logo image
   */
  renderWatermark(ctx, targetW, targetH, config, logoImg = null) {
    if (!config) return;

    ctx.save();

    // Check if Tiled / Repeated pattern mode is on
    if (config.tiled && config.tiled.enabled) {
      this.renderTiledWatermark(ctx, targetW, targetH, config, logoImg);
      ctx.restore();
      return;
    }

    const metrics = this.calculateMetrics(targetW, targetH, config, logoImg);
    const { x, y, width, height, rotation } = metrics;

    // Setup Transparency & Blending
    ctx.globalAlpha = Math.max(0, Math.min(1, (config.opacity !== undefined ? config.opacity : 85) / 100));
    ctx.globalCompositeOperation = config.blendMode || 'source-over';

    // Move to center of watermark for rotation
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.translate(centerX, centerY);

    if (rotation !== 0) {
      ctx.rotate(rotation);
    }

    // Setup Shadow if enabled
    if (config.shadow && config.shadow.enabled) {
      const shadowScale = targetW / 1000;
      ctx.shadowColor = config.shadow.color || 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = (config.shadow.blur || 6) * shadowScale;
      ctx.shadowOffsetX = (config.shadow.offsetX || 2) * shadowScale;
      ctx.shadowOffsetY = (config.shadow.offsetY || 3) * shadowScale;
    } else {
      ctx.shadowColor = 'transparent';
    }

    // Render depending on Type
    if (config.type === 'image') {
      if (logoImg && logoImg.complete && logoImg.naturalWidth !== 0) {
        this.renderLogoImage(ctx, -width / 2, -height / 2, width, height, logoImg, config);
      }
    } else {
      this.renderTextWatermark(ctx, -width / 2, -height / 2, width, height, config, targetW);
    }

    ctx.restore();
    return metrics;
  },

  /**
   * Render Logo Image with optional color transformations (monochrome white, monochrome black, tint)
   */
  renderLogoImage(ctx, drawX, drawY, width, height, logoImg, config) {
    const filter = config.colorFilter || 'original';

    if (filter === 'original') {
      ctx.drawImage(logoImg, drawX, drawY, width, height);
      return;
    }

    // If monochrome white, black, or custom tint:
    // Create an offscreen buffer to apply composite mask
    const buf = document.createElement('canvas');
    buf.width = Math.ceil(width);
    buf.height = Math.ceil(height);
    const bCtx = buf.getContext('2d');

    // 1. Draw original logo to buffer
    bCtx.drawImage(logoImg, 0, 0, width, height);

    // 2. Apply solid color overlay masked by logo alpha
    bCtx.globalCompositeOperation = 'source-in';
    if (filter === 'white') {
      bCtx.fillStyle = '#ffffff';
    } else if (filter === 'black') {
      bCtx.fillStyle = '#000000';
    } else if (filter === 'tint') {
      bCtx.fillStyle = config.tintColor || '#3b82f6';
    }
    bCtx.fillRect(0, 0, width, height);

    // 3. Draw colored buffer onto main canvas
    ctx.drawImage(buf, drawX, drawY);
  },

  /**
   * Render Text Watermark with typography styling, background box, and stroke
   */
  renderTextWatermark(ctx, drawX, drawY, width, height, config, targetW) {
    const textDim = this.measureTextDimensions(config, targetW);
    const { fontSize, fontStyle, lineHeight, padding, lines } = textDim;

    // Render background badge / box if enabled
    if (config.bgBox && config.bgBox.enabled) {
      ctx.save();
      ctx.shadowColor = 'transparent'; // prevent double shadow
      ctx.fillStyle = config.bgBox.color || 'rgba(0,0,0,0.5)';
      const radius = (config.bgBox.radius !== undefined ? config.bgBox.radius : 6) * (targetW / 1000);
      this.drawRoundedRect(ctx, drawX, drawY, width, height, Math.max(2, radius));
      ctx.fill();
      ctx.restore();
    }

    ctx.font = fontStyle;
    ctx.textAlign = config.textAlign || 'center';
    ctx.textBaseline = 'middle';

    const startX = config.textAlign === 'left' ? drawX + padding : 
                   config.textAlign === 'right' ? drawX + width - padding : 0;
    
    let currentY = drawY + padding + lineHeight / 2;

    lines.forEach(line => {
      // Draw stroke/outline if enabled
      if (config.stroke && config.stroke.enabled) {
        ctx.strokeStyle = config.stroke.color || '#000000';
        ctx.lineWidth = Math.max(1, (config.stroke.width || 2) * (targetW / 1000));
        ctx.lineJoin = 'round';
        ctx.strokeText(line, startX, currentY);
      }

      // Draw text fill
      ctx.fillStyle = config.textColor || '#ffffff';
      ctx.fillText(line, startX, currentY);

      currentY += lineHeight;
    });
  },

  /**
   * Render Tiled / Repeated pattern diagonally across entire canvas
   */
  renderTiledWatermark(ctx, targetW, targetH, config, logoImg) {
    const spacingRatio = (config.tiled.spacing || 20) / 100;
    const baseDim = Math.min(targetW, targetH);
    const step = Math.max(120, baseDim * spacingRatio);
    const angle = (config.tiled.angle !== undefined ? config.tiled.angle : -30) * (Math.PI / 180);

    ctx.globalAlpha = Math.max(0, Math.min(1, (config.opacity || 30) / 100));
    ctx.globalCompositeOperation = config.blendMode || 'source-over';

    const diag = Math.sqrt(targetW * targetW + targetH * targetH);
    const numX = Math.ceil(diag / step) + 2;
    const numY = Math.ceil(diag / step) + 2;

    ctx.save();
    ctx.translate(targetW / 2, targetH / 2);
    ctx.rotate(angle);

    const logoW = step * 0.45;
    const aspect = (config.type === 'image' && logoImg && logoImg.width) 
      ? logoImg.width / logoImg.height 
      : 3;
    const logoH = logoW / aspect;

    const startX = -diag / 2 - step;
    const startY = -diag / 2 - step;

    for (let i = 0; i < numX; i++) {
      for (let j = 0; j < numY; j++) {
        const x = startX + i * step + ((j % 2) * step * 0.4);
        const y = startY + j * step;

        if (config.type === 'image' && logoImg && logoImg.complete) {
          this.renderLogoImage(ctx, x - logoW / 2, y - logoH / 2, logoW, logoH, logoImg, config);
        } else {
          ctx.font = `600 ${Math.max(12, step * 0.16)}px "${config.fontFamily || 'Inter'}", sans-serif`;
          ctx.fillStyle = config.textColor || '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(config.text || '© WATERMARK', x, y);
        }
      }
    }

    ctx.restore();
  },

  /**
   * Helper: Draw rounded rectangle path
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
};
