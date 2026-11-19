/**
 * Đội Tình nguyện 10/1985 Hội Sinh viên - Watermark Studio Engine
 * Bộ máy tính toán và render logo sắc nét ở độ phân giải gốc
 * Hỗ trợ cả Logo tròn lẫn Dải Banner / Khung ảnh tràn viền 100%
 */

const WatermarkEngine = {
  /**
   * Tính toán kích thước và vị trí của logo / banner trên ảnh
   * ĐÃ BỎ HẾT GIỚI HẠN SCALE SIZE: hỗ trợ từ logo nhỏ đến dải banner 100% tràn viền
   */
  calculateMetrics(targetW, targetH, config, logoImg = null) {
    let wmWidth = 0;
    let wmHeight = 0;

    let naturalAspect = 1;
    if (logoImg && (logoImg.naturalWidth || logoImg.width) && (logoImg.naturalHeight || logoImg.height)) {
      const nw = logoImg.naturalWidth || logoImg.width;
      const nh = logoImg.naturalHeight || logoImg.height;
      naturalAspect = nw / nh;
    }

    // 1. Tính kích thước theo % chiều rộng ảnh (targetW)
    // Cho phép thoải mái từ 5% đến 120%+ (không còn giới hạn 45% hay ép min)
    const scale = (config.scale !== undefined ? config.scale : 18);
    const scalePct = scale / 100;

    if (config.lockAspect === false && config.scaleH) {
      // Tùy chỉnh tự do cả rộng và cao
      wmWidth = targetW * scalePct;
      wmHeight = targetH * (config.scaleH / 100);
    } else {
      // Giữ tỉ lệ tự nhiên của logo / banner
      wmWidth = targetW * scalePct;
      wmHeight = wmWidth / naturalAspect;
    }

    // 2. Tính toạ độ theo 9 điểm neo
    const anchor = config.anchor || 'tc';
    const insetXPct = (config.insetX !== undefined ? config.insetX : 0) / 100;
    
    // Nếu là banner tràn ngang (>=90%) hoặc preset đặc biệt, mặc định lề = 0
    let defaultInsetY = 0;
    if (anchor === 'tc' && scale < 80) {
      defaultInsetY = 3.5;
    }
    const insetYPct = (config.insetY !== undefined ? config.insetY : defaultInsetY) / 100;

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
      rotation: (config.rotation || 0) * (Math.PI / 180),
      naturalAspect
    };
  },

  /**
   * Vẽ logo/banner lên Canvas (Độ nét cao 100%, không mờ, không bóng, màu sắc trung thực)
   */
  renderWatermark(ctx, targetW, targetH, config, logoImg = null) {
    if (!logoImg || (logoImg.naturalWidth === 0 && logoImg.width === 0)) return null;

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

    // Vẽ logo / banner
    ctx.drawImage(logoImg, -width / 2, -height / 2, width, height);

    ctx.restore();
    return metrics;
  }
};
