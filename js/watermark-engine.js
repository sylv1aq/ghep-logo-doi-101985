/**
 * Đội Tình Nguyện 10/1985 - Watermark Studio Engine
 * Bộ máy tính toán và render logo sắc nét ở độ phân giải gốc
 */

const WatermarkEngine = {
  /**
   * Tính toán kích thước và vị trí của logo trên ảnh
   */
  calculateMetrics(targetW, targetH, config, logoImg = null) {
    let wmWidth = 0;
    let wmHeight = 0;

    // Aspect ratio của logo (306x307 ~ 1.0)
    let naturalAspect = 1;
    if (logoImg && logoImg.width && logoImg.height) {
      naturalAspect = logoImg.width / logoImg.height;
    }

    // 1. Tính kích thước theo slider % (Proportional)
    const scalePct = (config.scale || 18) / 100;
    const baseDim = Math.min(targetW, targetH);
    wmWidth = baseDim * scalePct;
    wmHeight = wmWidth / naturalAspect;

    // 2. Tính toạ độ theo 9 điểm neo (Mặc định: 'tc' - Giữa Trên Cùng)
    const anchor = config.anchor || 'tc';
    const insetXPct = (config.insetX !== undefined ? config.insetX : 0) / 100;
    const insetYPct = (config.insetY !== undefined ? config.insetY : 3.5) / 100;

    const marginX = targetW * insetXPct;
    const marginY = targetH * insetYPct;

    let x = 0;
    let y = 0;

    // Toạ độ ngang (X)
    if (anchor.includes('l')) {
      x = marginX;
    } else if (anchor.includes('c') || anchor === 'mc') {
      x = (targetW - wmWidth) / 2 + marginX;
    } else if (anchor.includes('r')) {
      x = targetW - wmWidth - marginX;
    }

    // Toạ độ dọc (Y)
    if (anchor.startsWith('t')) {
      y = marginY;
    } else if (anchor.startsWith('m') || anchor === 'mc') {
      y = (targetH - wmHeight) / 2 + marginY;
    } else if (anchor.startsWith('b')) {
      y = targetH - wmHeight - marginY;
    }

    // Nếu người dùng kéo thả trực tiếp trên ảnh
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
   * Vẽ logo lên Canvas (Độ nét cao 100%, không mờ, không bóng, màu sắc trung thực)
   */
  renderWatermark(ctx, targetW, targetH, config, logoImg = null) {
    if (!logoImg || !logoImg.complete || logoImg.naturalWidth === 0) return null;

    const metrics = this.calculateMetrics(targetW, targetH, config, logoImg);
    const { x, y, width, height, rotation } = metrics;

    ctx.save();

    // Luôn hiển thị 100% rõ nét, màu sắc chuẩn của Đội
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';

    // Xoay quanh tâm logo
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.translate(centerX, centerY);

    if (rotation !== 0) {
      ctx.rotate(rotation);
    }

    // Vẽ logo tròn
    ctx.drawImage(logoImg, -width / 2, -height / 2, width, height);

    ctx.restore();
    return metrics;
  }
};
