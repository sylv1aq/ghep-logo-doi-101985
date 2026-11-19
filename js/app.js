/**
 * Đội Tình nguyện 10/1985 Hội Sinh viên - Watermark Studio App Logic
 * Xử lý hình ảnh hàng loạt trực tiếp trên trình duyệt máy tính & điện thoại
 * ĐÃ BỎ TOÀN BỘ GIỚI HẠN SCALE SIZE: hỗ trợ cả Logo tròn lẫn Dải Banner sóng tràn ngang 100%
 */

(function () {
  'use strict';

  // --- Initial State ---
  const state = {
    photos: [],
    currentIndex: 0,
    showOriginal: false,
    isExporting: false,
    logoImg: null,
    currentWatermarkType: 'logo', // 'logo' hoặc 'banner'
    
    // Cấu hình watermark chuẩn của Đội Tình nguyện 10/1985 Hội Sinh viên
    watermark: {
      scale: 18, // 18% kích thước chiều rộng ảnh
      lockAspect: true,
      scaleH: 18,
      anchor: 'tc', // ⭐ Ở giữa, trên cùng
      insetX: 0,
      insetY: 3.5, // 3.5% khoảng cách từ mép trên
      rotation: 0,
      customOffset: {
        enabled: false,
        xRatio: 0,
        yRatio: 0
      }
    },

    // Cấu hình xuất ảnh
    exportSettings: {
      format: 'image/jpeg',
      quality: 92,
      resizeMode: 'original',
      maxEdge: 2048,
      scalePct: 80,
      namingPattern: '{name}_doi1085'
    },

    presets: []
  };

  // --- Mẫu thiết lập sẵn cho Đội Tình nguyện 10/1985 Hội Sinh viên ---
  const defaultPresets = [
    {
      id: 'default-banner',
      name: '🌊 Dải Banner Sóng Xanh (Tràn ngang 100%)',
      config: { anchor: 'tc', scale: 100, insetX: 0, insetY: 0, rotation: 0, watermarkType: 'banner' }
    },
    {
      id: 'default-tc',
      name: '⭐ Logo Tròn Chuẩn Đội: Giữa - Trên (18%)',
      config: { anchor: 'tc', scale: 18, insetX: 0, insetY: 3.5, rotation: 0, watermarkType: 'logo' }
    },
    {
      id: 'default-br',
      name: 'Logo Tròn - Góc Dưới Phải (16%)',
      config: { anchor: 'br', scale: 16, insetX: 3, insetY: 3, rotation: 0, watermarkType: 'logo' }
    },
    {
      id: 'default-bl',
      name: 'Logo Tròn - Góc Dưới Trái (16%)',
      config: { anchor: 'bl', scale: 16, insetX: 3, insetY: 3, rotation: 0, watermarkType: 'logo' }
    },
    {
      id: 'default-tr',
      name: 'Logo Tròn - Góc Trên Phải (16%)',
      config: { anchor: 'tr', scale: 16, insetX: 3, insetY: 3, rotation: 0, watermarkType: 'logo' }
    },
    {
      id: 'default-center',
      name: 'Logo Tròn - Lớn Chính Giữa (30%)',
      config: { anchor: 'mc', scale: 30, insetX: 0, insetY: 0, rotation: 0, watermarkType: 'logo' }
    }
  ];

  // --- DOM Elements Cache ---
  const DOM = {};

  function initDOMElements() {
    DOM.viewportArea = document.getElementById('viewport-area');
    DOM.emptyState = document.getElementById('empty-state');
    DOM.canvasContainer = document.getElementById('canvas-container');
    DOM.canvasWrapper = document.getElementById('canvas-wrapper');
    DOM.previewCanvas = document.getElementById('preview-canvas');
    DOM.interactiveBox = document.getElementById('watermark-interactive-box');
    DOM.filmstripContainer = document.getElementById('filmstrip-container');
    DOM.filmstripItems = document.getElementById('filmstrip-items');

    // Header & Toolbars
    DOM.currentFilename = document.getElementById('current-filename');
    DOM.currentDim = document.getElementById('current-dim');
    DOM.photoCountBadge = document.getElementById('photo-count-badge');
    DOM.btnPrevPhoto = document.getElementById('btn-prev-photo');
    DOM.btnNextPhoto = document.getElementById('btn-next-photo');
    DOM.btnBeforeAfter = document.getElementById('btn-before-after');
    DOM.btnPickPhotos = document.getElementById('btn-pick-photos');
    DOM.btnLoadDemo = document.getElementById('btn-load-demo');

    // Preset Picker
    DOM.presetSelect = document.getElementById('preset-select');
    DOM.btnSavePreset = document.getElementById('btn-save-preset');

    // Logo & Banner elements
    DOM.logoThumbImg = document.getElementById('logo-thumb-img');
    DOM.logoDim = document.getElementById('logo-dim');
    DOM.logoInput = document.getElementById('logo-input');
    DOM.btnTriggerLogoInput = document.getElementById('btn-trigger-logo-input');
    DOM.btnResetDefaultLogo = document.getElementById('btn-reset-default-logo');
    DOM.btnSwitchLogo = document.getElementById('btn-switch-logo');
    DOM.btnSwitchBanner = document.getElementById('btn-switch-banner');
    DOM.toggleTrimTransparent = document.getElementById('toggle-trim-transparent');

    // Size Slider & Quick buttons (Hoàn toàn tự do không giới hạn)
    DOM.sliderScale = document.getElementById('slider-scale');
    DOM.valScaleBadge = document.getElementById('val-scale-badge');
    DOM.inputScaleNum = document.getElementById('input-scale-num');
    DOM.toggleLockAspect = document.getElementById('toggle-lock-aspect');
    DOM.heightScaleWrap = document.getElementById('height-scale-wrap');
    DOM.sliderScaleH = document.getElementById('slider-scale-h');
    DOM.inputScaleHNum = document.getElementById('input-scale-h-num');
    DOM.quickScaleBtns = document.querySelectorAll('.quick-btn');

    // Position controls
    DOM.anchorCells = document.querySelectorAll('.anchor-cell');
    DOM.posPills = document.querySelectorAll('.pos-pill');
    DOM.sliderInsetY = document.getElementById('slider-inset-y');
    DOM.valInsetYBadge = document.getElementById('val-inset-y-badge');
    DOM.sliderInsetX = document.getElementById('slider-inset-x');
    DOM.valInsetXBadge = document.getElementById('val-inset-x-badge');

    // Rotation
    DOM.sliderRotation = document.getElementById('slider-rotation');
    DOM.valRotationBadge = document.getElementById('val-rotation-badge');
    DOM.rotBtns = document.querySelectorAll('.rot-btn');

    // Photos file input
    DOM.photosInput = document.getElementById('photos-input');
    DOM.btnAddPhotos = document.getElementById('btn-add-photos');
    DOM.btnClearPhotos = document.getElementById('btn-clear-photos');

    // Export Modals & Buttons
    DOM.btnExportBatch = document.getElementById('btn-export-batch');
    DOM.btnExportCurrent = document.getElementById('btn-export-current');
    DOM.exportModal = document.getElementById('export-modal');
    DOM.btnCancelExportModal = document.getElementById('btn-cancel-export-modal');
    DOM.btnStartExport = document.getElementById('btn-start-export');
    DOM.exportFormat = document.getElementById('export-format');
    DOM.exportQuality = document.getElementById('export-quality');
    DOM.valQuality = document.getElementById('val-quality');
    DOM.qualityRow = document.getElementById('quality-row');
    DOM.exportResize = document.getElementById('export-resize');
    DOM.exportNaming = document.getElementById('export-naming');

    // Progress Modal
    DOM.progressModal = document.getElementById('progress-modal');
    DOM.progressBarFill = document.getElementById('progress-bar-fill');
    DOM.progressText = document.getElementById('progress-text');
    DOM.progressDetail = document.getElementById('progress-detail');
    DOM.btnCancelProgress = document.getElementById('btn-cancel-progress');
  }

  // --- App Initialization ---
  function init() {
    initDOMElements();
    loadPresets();
    loadDefaultTeamLogo();
    bindEvents();
    renderPresetDropdown();
    updateUIFromConfig();
    updatePhotoQueueState();
  }

  // --- Load Team Logo (Dùng Base64 data URI tránh Tainted Canvas khi chạy offline) ---
  function loadDefaultTeamLogo() {
    state.currentWatermarkType = 'logo';
    const logoSrc = (typeof DEFAULT_TEAM_LOGO !== 'undefined' && DEFAULT_TEAM_LOGO) 
      ? DEFAULT_TEAM_LOGO 
      : 'assets/logo-doi.png';

    const img = new Image();
    img.onload = () => {
      state.logoImg = img;
      if (DOM.logoThumbImg) DOM.logoThumbImg.src = logoSrc;
      if (DOM.logoDim) DOM.logoDim.textContent = `${img.naturalWidth} × ${img.naturalHeight}px (Logo tròn chuẩn)`;
      if (DOM.btnSwitchLogo) DOM.btnSwitchLogo.classList.add('active');
      if (DOM.btnSwitchBanner) DOM.btnSwitchBanner.classList.remove('active');
      renderPreview();
    };
    img.onerror = () => {
      if (img.src !== 'assets/logo-doi.png') {
        img.src = 'assets/logo-doi.png';
      }
    };
    img.src = logoSrc;
  }

  // --- Load Team Wave Banner (Dải Banner Sóng Xanh 100% Tràn Ngang) ---
  function loadDefaultTeamBanner() {
    state.currentWatermarkType = 'banner';
    const bannerSrc = (typeof DEFAULT_TEAM_BANNER !== 'undefined' && DEFAULT_TEAM_BANNER) 
      ? DEFAULT_TEAM_BANNER 
      : 'assets/banner-doi.png';

    const img = new Image();
    img.onload = () => {
      state.logoImg = img;
      if (DOM.logoThumbImg) DOM.logoThumbImg.src = bannerSrc;
      if (DOM.logoDim) DOM.logoDim.textContent = `${img.naturalWidth} × ${img.naturalHeight}px (Dải banner sóng)`;
      if (DOM.btnSwitchBanner) DOM.btnSwitchBanner.classList.add('active');
      if (DOM.btnSwitchLogo) DOM.btnSwitchLogo.classList.remove('active');
      renderPreview();
    };
    img.onerror = () => {
      if (img.src !== 'assets/banner-doi.png') {
        img.src = 'assets/banner-doi.png';
      }
    };
    img.src = bannerSrc;
  }

  // --- Cắt khoảng trống trong suốt xung quanh hình ảnh (Auto-Trim) ---
  function trimImageCanvas(img) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return img;

    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      let minX = w, maxX = 0, minY = h, maxY = 0;
      let hasContent = false;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const alpha = data[(y * w + x) * 4 + 3];
          if (alpha > 8) {
            hasContent = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (!hasContent) return img;

      // Nếu ảnh đã sát viền sẵn rồi thì giữ nguyên
      if (minX === 0 && minY === 0 && maxX === w - 1 && maxY === h - 1) {
        return img;
      }

      const cropW = maxX - minX + 1;
      const cropH = maxY - minY + 1;
      const cropC = document.createElement('canvas');
      cropC.width = cropW;
      cropC.height = cropH;
      cropC.getContext('2d').drawImage(c, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

      const trimmedImg = new Image();
      trimmedImg.src = cropC.toDataURL('image/png');
      return trimmedImg;
    } catch (e) {
      console.warn('Trim canvas error:', e);
      return img;
    }
  }

  // --- Presets Management ---
  function loadPresets() {
    const saved = localStorage.getItem('doi1085_presets');
    if (saved) {
      try {
        state.presets = JSON.parse(saved);
      } catch (e) {
        state.presets = [...defaultPresets];
      }
    } else {
      state.presets = [...defaultPresets];
      savePresetsToStorage();
    }
  }

  function savePresetsToStorage() {
    localStorage.setItem('doi1085_presets', JSON.stringify(state.presets));
  }

  function renderPresetDropdown() {
    DOM.presetSelect.innerHTML = '';
    state.presets.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      DOM.presetSelect.appendChild(opt);
    });
  }

  function applyPreset(presetId) {
    const found = state.presets.find(p => p.id === presetId);
    if (!found) return;

    if (found.config.watermarkType === 'banner') {
      loadDefaultTeamBanner();
    } else if (found.config.watermarkType === 'logo') {
      loadDefaultTeamLogo();
    }

    state.watermark = {
      ...state.watermark,
      ...JSON.parse(JSON.stringify(found.config)),
      customOffset: { enabled: false, xRatio: 0, yRatio: 0 }
    };

    updateUIFromConfig();
    renderPreview();
  }

  function saveCurrentAsPreset() {
    const name = prompt('Nhập tên cho mẫu thiết lập mới của Đội Tình nguyện 10/1985 Hội Sinh viên:', `Mẫu của tôi ${state.presets.length + 1}`);
    if (!name || !name.trim()) return;

    const newPreset = {
      id: 'custom-' + Date.now(),
      name: name.trim(),
      config: JSON.parse(JSON.stringify(state.watermark))
    };

    state.presets.push(newPreset);
    savePresetsToStorage();
    renderPresetDropdown();
    DOM.presetSelect.value = newPreset.id;
  }

  // --- Update UI Controls from State ---
  function updateUIFromConfig() {
    const wm = state.watermark;

    // Scale slider, input box & badge (Hoàn toàn tự do)
    if (DOM.sliderScale) DOM.sliderScale.value = Math.min(300, wm.scale);
    if (DOM.valScaleBadge) DOM.valScaleBadge.textContent = `${wm.scale}%`;
    if (DOM.inputScaleNum) DOM.inputScaleNum.value = wm.scale;

    // Lock aspect & Height scale
    const isLocked = (wm.lockAspect !== false);
    if (DOM.toggleLockAspect) DOM.toggleLockAspect.checked = isLocked;
    if (DOM.heightScaleWrap) {
      DOM.heightScaleWrap.style.display = isLocked ? 'none' : 'block';
    }
    const scaleH = wm.scaleH !== undefined ? wm.scaleH : wm.scale;
    if (DOM.sliderScaleH) DOM.sliderScaleH.value = Math.min(300, scaleH);
    if (DOM.inputScaleHNum) DOM.inputScaleHNum.value = scaleH;

    DOM.quickScaleBtns.forEach(btn => {
      const s = parseInt(btn.dataset.scale, 10);
      btn.classList.toggle('active', s === wm.scale);
    });

    // Anchor Grid Cells & Quick Pills
    DOM.anchorCells.forEach(cell => {
      cell.classList.toggle('active', cell.dataset.anchor === wm.anchor);
    });

    DOM.posPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.anchor === wm.anchor);
    });

    // Insets
    DOM.sliderInsetY.value = wm.insetY;
    DOM.valInsetYBadge.textContent = `${wm.insetY}%`;
    DOM.sliderInsetX.value = wm.insetX;
    DOM.valInsetXBadge.textContent = `${wm.insetX}%`;

    // Rotation
    DOM.sliderRotation.value = wm.rotation;
    DOM.valRotationBadge.textContent = `${wm.rotation}°`;
  }

  // --- Photo Queue Management ---
  function addFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter(f => {
      if (f.type && f.type.toLowerCase().startsWith('image/')) return true;
      return /\.(jpe?g|png|webp|bmp|gif|tiff?|avif|heic)$/i.test(f.name);
    });

    if (validFiles.length === 0) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP, ...).');
      return;
    }

    const startIdx = state.photos.length;

    validFiles.forEach((file, i) => {
      const photoIdx = startIdx + i;
      const photoObj = {
        id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6) + '-' + photoIdx,
        file: file,
        name: file.name,
        size: file.size,
        dataUrl: URL.createObjectURL(file),
        img: null,
        width: 0,
        height: 0
      };

      const img = new Image();
      img.onload = () => {
        photoObj.img = img;
        photoObj.width = img.naturalWidth || img.width;
        photoObj.height = img.naturalHeight || img.height;
        if (state.currentIndex === photoIdx) {
          updateHeaderInfo();
          renderPreview();
        }
      };
      img.onerror = () => {
        console.warn('Không thể nạp trước ảnh:', file.name);
      };
      img.src = photoObj.dataUrl;

      state.photos.push(photoObj);
    });

    updatePhotoQueueState();
    renderFilmstrip();

    if (startIdx === 0 && state.photos.length > 0) {
      selectPhoto(0);
    }
  }

  function updatePhotoQueueState() {
    const hasPhotos = state.photos.length > 0;
    if (hasPhotos) {
      DOM.emptyState.style.display = 'none';
      DOM.canvasContainer.style.display = 'flex';
      DOM.filmstripContainer.style.display = 'flex';
      DOM.btnExportBatch.disabled = false;
      DOM.btnExportCurrent.disabled = false;
    } else {
      DOM.emptyState.style.display = 'flex';
      DOM.canvasContainer.style.display = 'none';
      DOM.filmstripContainer.style.display = 'none';
      DOM.btnExportBatch.disabled = true;
      DOM.btnExportCurrent.disabled = true;
      DOM.currentFilename.textContent = 'Chưa chọn ảnh nào';
      DOM.currentDim.textContent = '';
      DOM.photoCountBadge.textContent = '0 ảnh';
    }
  }

  function selectPhoto(index) {
    if (index < 0 || index >= state.photos.length) return;
    state.currentIndex = index;
    updateHeaderInfo();
    renderFilmstripActiveState();
    renderPreview();
  }

  function removePhoto(index, event) {
    if (event) event.stopPropagation();
    if (index < 0 || index >= state.photos.length) return;

    URL.revokeObjectURL(state.photos[index].dataUrl);
    state.photos.splice(index, 1);

    if (state.currentIndex >= state.photos.length) {
      state.currentIndex = Math.max(0, state.photos.length - 1);
    }

    updatePhotoQueueState();
    renderFilmstrip();
    if (state.photos.length > 0) {
      selectPhoto(state.currentIndex);
    }
  }

  function clearAllPhotos() {
    if (state.photos.length === 0) return;
    if (confirm('Bạn có muốn xóa toàn bộ danh sách ảnh này không?')) {
      state.photos.forEach(p => URL.revokeObjectURL(p.dataUrl));
      state.photos = [];
      state.currentIndex = 0;
      updatePhotoQueueState();
      renderFilmstrip();
    }
  }

  function updateHeaderInfo() {
    const current = state.photos[state.currentIndex];
    if (current) {
      DOM.currentFilename.textContent = current.name;
      DOM.currentDim.textContent = current.width ? `${current.width} × ${current.height}px` : 'Đang đọc...';
      DOM.photoCountBadge.textContent = `${state.currentIndex + 1} / ${state.photos.length} ảnh`;
    }
  }

  // --- Filmstrip Rendering ---
  function renderFilmstrip() {
    DOM.filmstripItems.innerHTML = '';

    const addBtn = document.createElement('button');
    addBtn.className = 'add-thumb-btn';
    addBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>Thêm</span>
    `;
    addBtn.onclick = () => DOM.photosInput.click();
    DOM.filmstripItems.appendChild(addBtn);

    state.photos.forEach((photo, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `filmstrip-thumb ${idx === state.currentIndex ? 'active' : ''}`;
      thumb.dataset.index = idx;

      const img = document.createElement('img');
      img.src = photo.dataUrl;
      img.loading = 'lazy';

      const idxBadge = document.createElement('span');
      idxBadge.className = 'thumb-idx';
      idxBadge.textContent = idx + 1;

      const delBtn = document.createElement('button');
      delBtn.className = 'thumb-delete';
      delBtn.innerHTML = '✕';
      delBtn.onclick = (e) => removePhoto(idx, e);

      thumb.appendChild(img);
      thumb.appendChild(idxBadge);
      thumb.appendChild(delBtn);

      thumb.onclick = () => selectPhoto(idx);

      DOM.filmstripItems.appendChild(thumb);
    });

    renderFilmstripActiveState();
  }

  function renderFilmstripActiveState() {
    const thumbs = DOM.filmstripItems.querySelectorAll('.filmstrip-thumb');
    thumbs.forEach(t => {
      const idx = parseInt(t.dataset.index, 10);
      if (idx === state.currentIndex) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        t.classList.remove('active');
      }
    });
  }

  // --- Live Canvas Preview ---
  let animationFrameId = null;

  function renderPreview() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(doRenderPreview);
  }

  function doRenderPreview() {
    const photo = state.photos[state.currentIndex];
    if (!photo) return;

    const img = photo.img;
    if (!img || !img.complete || (img.naturalWidth === 0 && img.width === 0)) return;

    const canvas = DOM.previewCanvas;
    const ctx = canvas.getContext('2d');

    const containerW = DOM.canvasContainer.clientWidth - 40;
    const containerH = DOM.canvasContainer.clientHeight - 40;

    let targetW = photo.width || img.naturalWidth || img.width;
    let targetH = photo.height || img.naturalHeight || img.height;

    const scale = Math.min(containerW / targetW, containerH / targetH, 1);
    const displayW = Math.round(targetW * scale);
    const displayH = Math.round(targetH * scale);

    canvas.width = displayW;
    canvas.height = displayH;

    // Vẽ ảnh nền
    ctx.drawImage(img, 0, 0, displayW, displayH);

    // Nếu người dùng đang giữ phím Space xem ảnh gốc
    if (state.showOriginal) {
      DOM.interactiveBox.style.display = 'none';
      return;
    }

    // Vẽ logo / banner của Đội Tình nguyện 10/1985 Hội Sinh viên
    const metrics = WatermarkEngine.renderWatermark(
      ctx,
      displayW,
      displayH,
      state.watermark,
      state.logoImg
    );

    // Cập nhật khung viền tương tác
    if (metrics) {
      updateInteractiveBox(metrics, displayW, displayH);
    } else {
      DOM.interactiveBox.style.display = 'none';
    }
  }

  function updateInteractiveBox(metrics, canvasW, canvasH) {
    const box = DOM.interactiveBox;
    box.style.display = 'block';
    box.style.left = `${metrics.x}px`;
    box.style.top = `${metrics.y}px`;
    box.style.width = `${metrics.width}px`;
    box.style.height = `${metrics.height}px`;
    box.style.transform = `rotate(${state.watermark.rotation}deg)`;

    // Tự động bo viền: tròn nếu là logo vuông/tròn, bo chữ nhật nếu là dải banner ngang
    const aspect = metrics.naturalAspect || 1;
    box.style.borderRadius = (aspect > 2.2) ? '8px' : '50%';
  }

  // --- Batch Export Engine ---
  async function startBatchExport(onlyCurrent = false) {
    if (state.photos.length === 0) {
      alert('Vui lòng chọn ít nhất một hình ảnh để xuất!');
      return;
    }

    state.isExporting = true;
    const listToExport = onlyCurrent ? [state.photos[state.currentIndex]] : state.photos;
    const total = listToExport.length;

    DOM.progressModal.classList.add('active');
    DOM.progressBarFill.style.width = '0%';
    DOM.progressText.textContent = `0 / ${total} ảnh`;
    DOM.progressDetail.textContent = 'Đang chuẩn bị...';

    try {
      const zip = new JSZip();

      for (let i = 0; i < total; i++) {
        if (!state.isExporting) break;

        const item = listToExport[i];
        DOM.progressDetail.textContent = `Đang xử lý: ${item.name}`;
        DOM.progressText.textContent = `${i + 1} / ${total} ảnh (${Math.round(((i + 1) / total) * 100)}%)`;
        DOM.progressBarFill.style.width = `${((i + 1) / total) * 100}%`;

        // Xử lý ở độ phân giải gốc
        const blob = await processFullResImage(item);
        if (!blob) {
          console.warn('Bỏ qua ảnh lỗi:', item.name);
          continue;
        }

        const outName = formatOutputName(item.name, i + 1, state.exportSettings.format);

        if (total === 1) {
          downloadBlob(blob, outName);
        } else {
          zip.file(outName, blob);
        }

        await new Promise(r => setTimeout(r, 20));
      }

      if (state.isExporting && total > 1) {
        DOM.progressDetail.textContent = 'Đang đóng gói file ZIP...';
        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'STORE'
        });
        const zipName = `anh_doi1085_${Date.now()}.zip`;
        downloadBlob(zipBlob, zipName);
      }
    } catch (err) {
      console.error('Lỗi khi xuất ảnh:', err);
      alert('Có lỗi xảy ra khi tạo file ảnh: ' + err.message);
    } finally {
      setTimeout(() => {
        DOM.progressModal.classList.remove('active');
        state.isExporting = false;
      }, 500);
    }
  }

  // --- Xử lý render ảnh ở độ phân giải gốc ---
  async function processFullResImage(photo) {
    return new Promise((resolve) => {
      const onImageReady = (img) => {
        try {
          let finalW = img.naturalWidth || img.width || 1920;
          let finalH = img.naturalHeight || img.height || 1080;

          if (state.exportSettings.resizeMode === 'max_edge') {
            const maxEdge = state.exportSettings.maxEdge || 2048;
            if (finalW > maxEdge || finalH > maxEdge) {
              if (finalW >= finalH) {
                finalH = Math.round((finalH * maxEdge) / finalW);
                finalW = maxEdge;
              } else {
                finalW = Math.round((finalW * maxEdge) / finalH);
                finalH = maxEdge;
              }
            }
          } else if (state.exportSettings.resizeMode === 'scale_pct') {
            const pct = (state.exportSettings.scalePct || 80) / 100;
            finalW = Math.round(finalW * pct);
            finalH = Math.round(finalH * pct);
          }

          const offCanvas = document.createElement('canvas');
          offCanvas.width = finalW;
          offCanvas.height = finalH;
          const offCtx = offCanvas.getContext('2d');

          // Vẽ ảnh gốc sắc nét
          offCtx.drawImage(img, 0, 0, finalW, finalH);

          // Vẽ logo / banner chuẩn
          WatermarkEngine.renderWatermark(
            offCtx,
            finalW,
            finalH,
            state.watermark,
            state.logoImg
          );

          let mime = state.exportSettings.format;
          if (mime === 'original') {
            mime = (photo.file && photo.file.type) ? photo.file.type : 'image/jpeg';
          }
          if (!mime || mime === 'original') mime = 'image/jpeg';

          const quality = (state.exportSettings.quality || 92) / 100;

          canvasToBlobSafe(offCanvas, mime, quality).then(blob => {
            resolve(blob);
          });
        } catch (e) {
          console.error('Lỗi canvas render:', e);
          resolve(null);
        }
      };

      if (photo.img && photo.img.complete && (photo.img.naturalWidth > 0 || photo.img.width > 0)) {
        onImageReady(photo.img);
      } else {
        const tempImg = new Image();
        tempImg.onload = () => onImageReady(tempImg);
        tempImg.onerror = () => {
          console.error('Không thể đọc ảnh nguồn:', photo.name);
          resolve(null);
        };
        tempImg.src = photo.dataUrl;

        setTimeout(() => {
          if (!tempImg.complete) {
            console.warn('Timeout tải ảnh:', photo.name);
            resolve(null);
          }
        }, 10000);
      }
    });
  }

  // --- Chuyển đổi Canvas sang Blob an toàn ---
  function canvasToBlobSafe(canvas, mime, quality) {
    return new Promise((resolve) => {
      try {
        if (canvas.toBlob) {
          canvas.toBlob(blob => {
            if (blob) {
              resolve(blob);
            } else {
              tryFallbackDataURL(canvas, mime, quality, resolve);
            }
          }, mime, quality);
        } else {
          tryFallbackDataURL(canvas, mime, quality, resolve);
        }
      } catch (err) {
        tryFallbackDataURL(canvas, mime, quality, resolve);
      }
    });
  }

  function tryFallbackDataURL(canvas, mime, quality, resolve) {
    try {
      const dataUrl = canvas.toDataURL(mime, quality);
      resolve(dataURItoBlob(dataUrl));
    } catch (e1) {
      try {
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(dataURItoBlob(jpegUrl));
      } catch (e2) {
        console.error('Không thể xuất blob từ canvas:', e2);
        resolve(null);
      }
    }
  }

  function dataURItoBlob(dataURI) {
    try {
      const parts = dataURI.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (e) {
      console.error('dataURItoBlob error:', e);
      return null;
    }
  }

  function formatOutputName(originalName, index, format) {
    const lastDot = originalName.lastIndexOf('.');
    const baseName = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
    let ext = lastDot !== -1 ? originalName.substring(lastDot + 1).toLowerCase() : 'jpg';

    if (format === 'image/jpeg') ext = 'jpg';
    else if (format === 'image/png') ext = 'png';
    else if (format === 'image/webp') ext = 'webp';

    const pattern = state.exportSettings.namingPattern || '{name}_doi1085';
    const formatted = pattern
      .replace('{name}', baseName)
      .replace('{index}', String(index).padStart(3, '0'));

    return `${formatted}.${ext}`;
  }

  function downloadBlob(blob, filename) {
    if (!blob) {
      alert('Không thể tạo file ảnh tải về. Vui lòng thử lại!');
      return;
    }

    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (e) {
      console.error('downloadBlob error:', e);
      alert('Trình duyệt chặn tải xuống: ' + e.message);
    }
  }

  // --- Demo Photography (Ảnh mẫu sự kiện của Đội) ---
  function loadDemoPhotos() {
    const demos = [
      { name: 'Hoat_Dong_Tinh_Nguyen_Camp.jpg', w: 3000, h: 2000, type: 'event' },
      { name: 'Tap_The_Doi_1085_Portrait.jpg', w: 2000, h: 3000, type: 'portrait' }
    ];

    demos.forEach(d => {
      const c = document.createElement('canvas');
      c.width = d.w;
      c.height = d.h;
      const ctx = c.getContext('2d');

      if (d.type === 'event') {
        const grad = ctx.createLinearGradient(0, 0, 0, d.h);
        grad.addColorStop(0, '#2b70c9');
        grad.addColorStop(0.5, '#7bb4f7');
        grad.addColorStop(0.75, '#fde68a');
        grad.addColorStop(1, '#15803d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, d.w, d.h);

        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(0, d.h * 0.75);
        ctx.quadraticCurveTo(d.w * 0.35, d.h * 0.65, d.w * 0.7, d.h * 0.8);
        ctx.lineTo(d.w, d.h * 0.72);
        ctx.lineTo(d.w, d.h);
        ctx.lineTo(0, d.h);
        ctx.closePath();
        ctx.fill();
      } else {
        const grad = ctx.createRadialGradient(d.w * 0.5, d.h * 0.4, 200, d.w * 0.5, d.h * 0.5, d.h * 0.8);
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(0.6, '#1e3a8a');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, d.w, d.h);
      }

      canvasToBlobSafe(c, 'image/jpeg', 0.95).then(blob => {
        if (!blob) return;
        const fakeFile = {
          name: d.name,
          size: blob.size,
          type: 'image/jpeg'
        };
        const photoObj = {
          id: 'demo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
          file: fakeFile,
          name: d.name,
          size: blob.size,
          dataUrl: URL.createObjectURL(blob),
          img: null,
          width: d.w,
          height: d.h
        };

        const img = new Image();
        img.onload = () => {
          photoObj.img = img;
          renderPreview();
        };
        img.src = photoObj.dataUrl;

        state.photos.push(photoObj);
        updatePhotoQueueState();
        renderFilmstrip();
        if (state.photos.length === 1) selectPhoto(0);
      });
    });
  }

  // --- Event Bindings ---
  function bindEvents() {
    window.addEventListener('resize', () => renderPreview());

    // Presets
    DOM.presetSelect.addEventListener('change', (e) => applyPreset(e.target.value));
    DOM.btnSavePreset.addEventListener('click', saveCurrentAsPreset);

    // Photos Input
    DOM.photosInput.addEventListener('change', (e) => {
      addFiles(e.target.files);
      e.target.value = '';
    });

    if (DOM.btnPickPhotos) {
      DOM.btnPickPhotos.addEventListener('click', (e) => {
        e.stopPropagation();
        DOM.photosInput.click();
      });
    }

    DOM.btnAddPhotos.addEventListener('click', () => DOM.photosInput.click());
    DOM.emptyState.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      DOM.photosInput.click();
    });

    DOM.btnClearPhotos.addEventListener('click', clearAllPhotos);
    if (DOM.btnLoadDemo) {
      DOM.btnLoadDemo.addEventListener('click', (e) => {
        e.stopPropagation();
        loadDemoPhotos();
      });
    }

    // Drag & Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
      document.body.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    document.body.addEventListener('dragover', (e) => {
      if (!e.dataTransfer.types.includes('Files')) return;
      DOM.emptyState.classList.add('drag-over');
    });

    document.body.addEventListener('dragleave', () => DOM.emptyState.classList.remove('drag-over'));
    document.body.addEventListener('drop', (e) => {
      DOM.emptyState.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    });

    // Nút chuyển đổi nhanh giữa Logo Tròn và Dải Banner Sóng
    if (DOM.btnSwitchLogo) {
      DOM.btnSwitchLogo.addEventListener('click', () => {
        loadDefaultTeamLogo();
        state.watermark.scale = 18;
        state.watermark.anchor = 'tc';
        state.watermark.insetY = 3.5;
        state.watermark.insetX = 0;
        updateUIFromConfig();
        renderPreview();
      });
    }

    if (DOM.btnSwitchBanner) {
      DOM.btnSwitchBanner.addEventListener('click', () => {
        loadDefaultTeamBanner();
        // Tự động đặt tràn ngang 100% ở trên cùng
        state.watermark.scale = 100;
        state.watermark.anchor = 'tc';
        state.watermark.insetY = 0;
        state.watermark.insetX = 0;
        updateUIFromConfig();
        renderPreview();
      });
    }

    // Logo change & reset
    if (DOM.btnTriggerLogoInput) {
      DOM.btnTriggerLogoInput.addEventListener('click', () => DOM.logoInput.click());
    }

    DOM.logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const tempImg = new Image();
        tempImg.onload = () => {
          let finalImg = tempImg;
          // Tự động cắt khoảng trống trong suốt nếu bật toggle
          if (DOM.toggleTrimTransparent && DOM.toggleTrimTransparent.checked) {
            finalImg = trimImageCanvas(tempImg);
          }

          state.logoImg = finalImg;
          DOM.logoThumbImg.src = finalImg.src;
          const nw = finalImg.naturalWidth || finalImg.width;
          const nh = finalImg.naturalHeight || finalImg.height;
          DOM.logoDim.textContent = `${nw} × ${nh}px (Tùy chọn)`;

          // Nếu ảnh là dạng banner ngang (aspect > 2.2), tự động đặt 100% tràn viền trên
          const aspect = nw / nh;
          if (aspect > 2.2) {
            state.watermark.scale = 100;
            state.watermark.anchor = 'tc';
            state.watermark.insetY = 0;
            state.watermark.insetX = 0;
            updateUIFromConfig();
          }

          if (DOM.btnSwitchLogo) DOM.btnSwitchLogo.classList.remove('active');
          if (DOM.btnSwitchBanner) DOM.btnSwitchBanner.classList.remove('active');
          renderPreview();
        };
        tempImg.src = url;
      }
      e.target.value = '';
    });

    DOM.btnResetDefaultLogo.addEventListener('click', () => {
      loadDefaultTeamLogo();
      state.watermark.scale = 18;
      state.watermark.anchor = 'tc';
      state.watermark.insetY = 3.5;
      state.watermark.insetX = 0;
      updateUIFromConfig();
    });

    // Size Controls - HOÀN TOÀN TỰ DO, KHÔNG GIỚI HẠN (1% đến 500%+)
    DOM.sliderScale.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.watermark.scale = val;
      if (state.watermark.lockAspect !== false) {
        state.watermark.scaleH = val;
      }
      updateUIFromConfig();
      renderPreview();
    });

    if (DOM.inputScaleNum) {
      DOM.inputScaleNum.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1) {
          val = Math.min(1000, val);
          state.watermark.scale = val;
          if (state.watermark.lockAspect !== false) {
            state.watermark.scaleH = val;
          }
          updateUIFromConfig();
          renderPreview();
        }
      });
    }

    if (DOM.toggleLockAspect) {
      DOM.toggleLockAspect.addEventListener('change', (e) => {
        state.watermark.lockAspect = e.target.checked;
        if (!state.watermark.lockAspect && !state.watermark.scaleH) {
          state.watermark.scaleH = state.watermark.scale;
        }
        updateUIFromConfig();
        renderPreview();
      });
    }

    if (DOM.sliderScaleH) {
      DOM.sliderScaleH.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.watermark.scaleH = val;
        updateUIFromConfig();
        renderPreview();
      });
    }

    if (DOM.inputScaleHNum) {
      DOM.inputScaleHNum.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1) {
          val = Math.min(1000, val);
          state.watermark.scaleH = val;
          updateUIFromConfig();
          renderPreview();
        }
      });
    }

    // Quick Size Buttons
    DOM.quickScaleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const s = parseInt(btn.dataset.scale, 10);
        state.watermark.scale = s;
        if (state.watermark.lockAspect !== false) {
          state.watermark.scaleH = s;
        }
        
        // Nếu chọn 100% tràn ngang, tự động đưa lề về 0 nếu đang ở viền trên
        if (s >= 95 && state.watermark.anchor === 'tc') {
          state.watermark.insetY = 0;
          DOM.sliderInsetY.value = 0;
          DOM.valInsetYBadge.textContent = '0%';
        }

        updateUIFromConfig();
        renderPreview();
      });
    });

    // 9-Point Anchor Grid
    DOM.anchorCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const anchor = cell.dataset.anchor;
        setAnchor(anchor);
      });
    });

    // Quick Position Pills
    DOM.posPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const anchor = pill.dataset.anchor;
        setAnchor(anchor);
      });
    });

    function setAnchor(anchor) {
      state.watermark.anchor = anchor;
      state.watermark.customOffset.enabled = false;
      DOM.anchorCells.forEach(c => c.classList.toggle('active', c.dataset.anchor === anchor));
      DOM.posPills.forEach(p => p.classList.toggle('active', p.dataset.anchor === anchor));
      renderPreview();
    }

    // Inset Sliders
    DOM.sliderInsetY.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.watermark.insetY = val;
      DOM.valInsetYBadge.textContent = `${val}%`;
      state.watermark.customOffset.enabled = false;
      renderPreview();
    });

    DOM.sliderInsetX.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.watermark.insetX = val;
      DOM.valInsetXBadge.textContent = `${val}%`;
      state.watermark.customOffset.enabled = false;
      renderPreview();
    });

    // Rotation
    DOM.sliderRotation.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.watermark.rotation = val;
      DOM.valRotationBadge.textContent = `${val}°`;
      renderPreview();
    });

    DOM.rotBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const r = parseInt(btn.dataset.rot, 10);
        state.watermark.rotation = r;
        DOM.sliderRotation.value = r;
        DOM.valRotationBadge.textContent = `${r}°`;
        renderPreview();
      });
    });

    // Navigation & Preview controls
    DOM.btnPrevPhoto.addEventListener('click', () => selectPhoto(state.currentIndex - 1));
    DOM.btnNextPhoto.addEventListener('click', () => selectPhoto(state.currentIndex + 1));

    DOM.btnBeforeAfter.addEventListener('mousedown', () => {
      state.showOriginal = true;
      renderPreview();
    });
    window.addEventListener('mouseup', () => {
      if (state.showOriginal) {
        state.showOriginal = false;
        renderPreview();
      }
    });

    // Interactive Drag on Canvas
    setupInteractiveDrag();

    // Export Action
    DOM.btnExportBatch.addEventListener('click', () => DOM.exportModal.classList.add('active'));
    DOM.btnExportCurrent.addEventListener('click', () => startBatchExport(true));
    DOM.btnCancelExportModal.addEventListener('click', () => DOM.exportModal.classList.remove('active'));

    DOM.btnStartExport.addEventListener('click', () => {
      state.exportSettings.format = DOM.exportFormat.value;
      state.exportSettings.quality = parseInt(DOM.exportQuality.value, 10);
      state.exportSettings.resizeMode = DOM.exportResize.value;
      state.exportSettings.namingPattern = DOM.exportNaming.value || '{name}_doi1085';

      DOM.exportModal.classList.remove('active');
      startBatchExport(false);
    });

    DOM.exportFormat.addEventListener('change', (e) => {
      const isJpg = e.target.value === 'image/jpeg' || e.target.value === 'image/webp';
      DOM.qualityRow.style.display = isJpg ? 'flex' : 'none';
    });

    DOM.exportQuality.addEventListener('input', (e) => {
      DOM.valQuality.textContent = `${e.target.value}%`;
    });

    DOM.btnCancelProgress.addEventListener('click', () => {
      state.isExporting = false;
      DOM.progressModal.classList.remove('active');
    });

    // Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'ArrowLeft') selectPhoto(state.currentIndex - 1);
      else if (e.code === 'ArrowRight') selectPhoto(state.currentIndex + 1);
      else if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        state.showOriginal = true;
        renderPreview();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        state.showOriginal = false;
        renderPreview();
      }
    });
  }

  // --- Interactive Drag on Canvas (Tự do 100%, không giới hạn, hỗ trợ 8 tay cầm & cảm ứng điện thoại) ---
  function setupInteractiveDrag() {
    const box = DOM.interactiveBox;
    let isDragging = false;
    let isResizing = false;
    let resizeHandle = null;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;
    let initialScale = 18, initialScaleH = 18;

    function getPointerPos(e) {
      if (e.touches && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
      return { clientX: e.clientX, clientY: e.clientY };
    }

    function onPointerDown(e) {
      const pos = getPointerPos(e);
      startX = pos.clientX;
      startY = pos.clientY;

      initialLeft = parseFloat(box.style.left) || 0;
      initialTop = parseFloat(box.style.top) || 0;
      initialScale = state.watermark.scale || 18;
      initialScaleH = state.watermark.scaleH !== undefined ? state.watermark.scaleH : initialScale;

      if (e.target.classList.contains('resize-handle')) {
        isResizing = true;
        resizeHandle = e.target.dataset.handle || 'se';
      } else {
        isDragging = true;
      }

      e.stopPropagation();
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging && !isResizing) return;
      const canvas = DOM.previewCanvas;
      if (!canvas) return;

      const pos = getPointerPos(e);
      const dx = pos.clientX - startX;
      const dy = pos.clientY - startY;

      if (isDragging) {
        const newX = initialLeft + dx;
        const newY = initialTop + dy;

        state.watermark.customOffset = {
          enabled: true,
          xRatio: newX / canvas.width,
          yRatio: newY / canvas.height
        };
        renderPreview();
      } else if (isResizing) {
        const deltaPctX = (dx / canvas.width) * 100;
        const deltaPctY = (dy / canvas.height) * 100;

        let newScale = initialScale;
        let newScaleH = initialScaleH;

        if (resizeHandle === 'se') {
          const delta = Math.abs(deltaPctX) > Math.abs(deltaPctY) ? deltaPctX : deltaPctY;
          newScale = Math.round(initialScale + delta);
          newScaleH = Math.round(initialScaleH + deltaPctY);
        } else if (resizeHandle === 'nw') {
          const delta = Math.abs(deltaPctX) > Math.abs(deltaPctY) ? -deltaPctX : -deltaPctY;
          newScale = Math.round(initialScale + delta);
          newScaleH = Math.round(initialScaleH - deltaPctY);
        } else if (resizeHandle === 'ne') {
          const delta = Math.abs(deltaPctX) > Math.abs(deltaPctY) ? deltaPctX : -deltaPctY;
          newScale = Math.round(initialScale + delta);
          newScaleH = Math.round(initialScaleH - deltaPctY);
        } else if (resizeHandle === 'sw') {
          const delta = Math.abs(deltaPctX) > Math.abs(deltaPctY) ? -deltaPctX : deltaPctY;
          newScale = Math.round(initialScale + delta);
          newScaleH = Math.round(initialScaleH + deltaPctY);
        } else if (resizeHandle === 'e') {
          newScale = Math.round(initialScale + deltaPctX);
        } else if (resizeHandle === 'w') {
          newScale = Math.round(initialScale - deltaPctX);
        } else if (resizeHandle === 's') {
          if (state.watermark.lockAspect !== false) {
            newScale = Math.round(initialScale + deltaPctY);
          } else {
            newScaleH = Math.round(initialScaleH + deltaPctY);
          }
        } else if (resizeHandle === 'n') {
          if (state.watermark.lockAspect !== false) {
            newScale = Math.round(initialScale - deltaPctY);
          } else {
            newScaleH = Math.round(initialScaleH - deltaPctY);
          }
        }

        // TỰ DO VÔ TƯ: Không giới hạn trần, cho phép kéo thoải mái từ 1% tới 500%+
        newScale = Math.max(1, Math.min(500, newScale));
        newScaleH = Math.max(1, Math.min(500, newScaleH));

        state.watermark.scale = newScale;
        if (state.watermark.lockAspect !== false) {
          state.watermark.scaleH = newScale;
        } else {
          state.watermark.scaleH = newScaleH;
        }

        updateUIFromConfig();
        renderPreview();
      }
    }

    function onPointerUp() {
      isDragging = false;
      isResizing = false;
      resizeHandle = null;
    }

    // Chuột trên PC
    box.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Cảm ứng trên Điện thoại & Tablet
    box.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
