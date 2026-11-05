/**
 * Watermark Studio Pro - Main Application Logic
 * Fast, Client-Side, High-Performance Batch Processing
 */

(function () {
  'use strict';

  // --- Initial State ---
  const state = {
    photos: [],
    currentIndex: 0,
    zoom: 'fit', // 'fit' or number e.g. 1
    showOriginal: false,
    isExporting: false,
    
    // Logo image instance
    logoImg: null,
    
    // Watermark configuration
    watermark: {
      type: 'image', // 'image' or 'text'
      colorFilter: 'original', // 'original', 'white', 'black', 'tint'
      tintColor: '#ffffff',
      scaleMode: 'proportional', // 'proportional', 'fit', 'fill', 'fixed'
      scale: 16, // % of photo width
      anchor: 'br', // 'tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'
      insetX: 3, // % inset
      insetY: 3, // % inset
      opacity: 85, // 0 - 100
      rotation: 0, // -180 to 180
      blendMode: 'source-over',
      shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.65)',
        blur: 5,
        offsetX: 2,
        offsetY: 2
      },
      tiled: {
        enabled: false,
        spacing: 22,
        angle: -30
      },
      customOffset: {
        enabled: false,
        xRatio: 0,
        yRatio: 0
      },
      // Text options
      text: '© PHOTOGRAPHY STUDIO',
      fontFamily: 'Inter',
      bold: true,
      italic: false,
      textColor: '#ffffff',
      stroke: {
        enabled: true,
        color: '#000000',
        width: 2
      },
      bgBox: {
        enabled: false,
        color: 'rgba(0, 0, 0, 0.55)',
        radius: 6
      }
    },

    // Export options
    exportSettings: {
      format: 'image/jpeg',
      quality: 92,
      resizeMode: 'original', // 'original', 'max_edge', 'scale_pct'
      maxEdge: 2048,
      scalePct: 80,
      namingPattern: '{name}_watermarked'
    },

    // Presets list
    presets: []
  };

  // --- Default Presets ---
  const defaultPresets = [
    {
      id: 'default-br',
      name: 'Góc Dưới Phải (Chuẩn Lightroom)',
      config: {
        type: 'image',
        anchor: 'br',
        scale: 16,
        insetX: 3,
        insetY: 3,
        opacity: 85,
        rotation: 0,
        colorFilter: 'original',
        blendMode: 'source-over',
        tiled: { enabled: false },
        shadow: { enabled: true, color: 'rgba(0,0,0,0.65)', blur: 5, offsetX: 2, offsetY: 2 }
      }
    },
    {
      id: 'default-bl',
      name: 'Góc Dưới Trái (Logo Trắng)',
      config: {
        type: 'image',
        anchor: 'bl',
        scale: 15,
        insetX: 3,
        insetY: 3,
        opacity: 90,
        rotation: 0,
        colorFilter: 'white',
        blendMode: 'source-over',
        tiled: { enabled: false },
        shadow: { enabled: true, color: 'rgba(0,0,0,0.7)', blur: 6, offsetX: 2, offsetY: 2 }
      }
    },
    {
      id: 'default-center',
      name: 'Chính Giữa Chống Trộm (Mờ 35%)',
      config: {
        type: 'image',
        anchor: 'mc',
        scale: 35,
        insetX: 0,
        insetY: 0,
        opacity: 35,
        rotation: 0,
        colorFilter: 'original',
        blendMode: 'source-over',
        tiled: { enabled: false },
        shadow: { enabled: false }
      }
    },
    {
      id: 'default-tile',
      name: 'Lưới Caro Toàn Màn Hình (Tiled Protection)',
      config: {
        type: 'image',
        anchor: 'mc',
        scale: 15,
        opacity: 25,
        rotation: 0,
        colorFilter: 'white',
        blendMode: 'source-over',
        tiled: { enabled: true, spacing: 22, angle: -30 },
        shadow: { enabled: false }
      }
    },
    {
      id: 'default-signature',
      name: 'Chữ Ký Nghệ Thuật (Signature Text)',
      config: {
        type: 'text',
        text: 'Photography by Minh',
        fontFamily: 'Playfair Display',
        bold: false,
        italic: true,
        textColor: '#f3f4f6',
        anchor: 'br',
        scale: 18,
        insetX: 4,
        insetY: 4,
        opacity: 90,
        rotation: 0,
        stroke: { enabled: true, color: '#111111', width: 2 },
        bgBox: { enabled: false },
        tiled: { enabled: false },
        shadow: { enabled: true, color: 'rgba(0,0,0,0.6)', blur: 6, offsetX: 2, offsetY: 2 }
      }
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
    
    // Toolbars & Status
    DOM.currentFilename = document.getElementById('current-filename');
    DOM.currentDim = document.getElementById('current-dim');
    DOM.photoCountBadge = document.getElementById('photo-count-badge');
    DOM.zoomLevelBadge = document.getElementById('zoom-level-badge');
    DOM.btnLoadDemo = document.getElementById('btn-load-demo');
    DOM.btnZoomIn = document.getElementById('btn-zoom-in');
    DOM.btnZoomOut = document.getElementById('btn-zoom-out');
    DOM.btnZoomFit = document.getElementById('btn-zoom-fit');
    DOM.btnBeforeAfter = document.getElementById('btn-before-after');
    DOM.btnPrevPhoto = document.getElementById('btn-prev-photo');
    DOM.btnNextPhoto = document.getElementById('btn-next-photo');

    // Preset dropdown
    DOM.presetSelect = document.getElementById('preset-select');
    DOM.btnSavePreset = document.getElementById('btn-save-preset');
    DOM.btnDeletePreset = document.getElementById('btn-delete-preset');

    // Logo & Type controls
    DOM.btnTabImage = document.getElementById('btn-tab-image');
    DOM.btnTabText = document.getElementById('btn-tab-text');
    DOM.groupImageControls = document.getElementById('group-image-controls');
    DOM.groupTextControls = document.getElementById('group-text-controls');
    DOM.logoInput = document.getElementById('logo-input');
    DOM.logoDropzone = document.getElementById('logo-dropzone');
    DOM.logoThumbImg = document.getElementById('logo-thumb-img');
    DOM.logoName = document.getElementById('logo-name');
    DOM.logoDim = document.getElementById('logo-dim');
    DOM.logoFilterSelect = document.getElementById('logo-filter-select');
    DOM.tintColorRow = document.getElementById('tint-color-row');
    DOM.tintColorPicker = document.getElementById('tint-color-picker');

    // Text controls
    DOM.textInput = document.getElementById('text-input');
    DOM.fontSelect = document.getElementById('font-select');
    DOM.btnFontBold = document.getElementById('btn-font-bold');
    DOM.btnFontItalic = document.getElementById('btn-font-italic');
    DOM.textColorPicker = document.getElementById('text-color-picker');
    DOM.toggleStroke = document.getElementById('toggle-stroke');
    DOM.toggleBgBox = document.getElementById('toggle-bg-box');

    // Sliders & Values
    DOM.sliderScale = document.getElementById('slider-scale');
    DOM.valScale = document.getElementById('val-scale');
    DOM.sliderOpacity = document.getElementById('slider-opacity');
    DOM.valOpacity = document.getElementById('val-opacity');
    DOM.sliderInsetX = document.getElementById('slider-inset-x');
    DOM.valInsetX = document.getElementById('val-inset-x');
    DOM.sliderInsetY = document.getElementById('slider-inset-y');
    DOM.valInsetY = document.getElementById('val-inset-y');
    DOM.sliderRotation = document.getElementById('slider-rotation');
    DOM.valRotation = document.getElementById('val-rotation');
    DOM.scaleModeSelect = document.getElementById('scale-mode-select');
    DOM.blendModeSelect = document.getElementById('blend-mode-select');
    DOM.toggleShadow = document.getElementById('toggle-shadow');
    DOM.toggleTiled = document.getElementById('toggle-tiled');
    DOM.groupTiledControls = document.getElementById('group-tiled-controls');
    DOM.sliderTiledSpacing = document.getElementById('slider-tiled-spacing');
    DOM.valTiledSpacing = document.getElementById('val-tiled-spacing');

    // Anchor Grid Cells
    DOM.anchorCells = document.querySelectorAll('.anchor-cell');

    // File Inputs
    DOM.photosInput = document.getElementById('photos-input');
    DOM.btnAddPhotos = document.getElementById('btn-add-photos');
    DOM.btnClearPhotos = document.getElementById('btn-clear-photos');

    // Export Buttons & Modals
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
    DOM.exportResizeMaxEdge = document.getElementById('export-resize-maxedge');
    DOM.maxEdgeRow = document.getElementById('max-edge-row');
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
    generateDefaultSampleLogo();
    bindEvents();
    renderPresetDropdown();
    updateUIFromConfig();
    updatePhotoQueueState();
  }

  // --- Built-in Sample Logo Generator (Vector Camera + Studio Badge) ---
  function generateDefaultSampleLogo() {
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Modern Camera Icon
    const cx = 70;
    const cy = 80;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Camera body
    WatermarkEngine.drawRoundedRect(ctx, cx - 44, cy - 30, 88, 62, 10);
    ctx.stroke();

    // Camera top lens bump
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 30);
    ctx.lineTo(cx - 10, cy - 42);
    ctx.lineTo(cx + 10, cy - 42);
    ctx.lineTo(cx + 16, cy - 30);
    ctx.stroke();

    // Lens circle
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 22, 0, Math.PI * 2);
    ctx.stroke();

    // Inner aperture
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 9, 0, Math.PI * 2);
    ctx.fill();

    // Small flash dot
    ctx.beginPath();
    ctx.arc(cx + 26, cy - 16, 3, 0, Math.PI * 2);
    ctx.fill();

    // Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px "Inter", sans-serif';
    ctx.fillText('PHOTOGRAPHY', 145, 68);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '500 13px "Inter", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('STUDIO & GALLERY', 146, 96);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(145, 78);
    ctx.lineTo(380, 78);
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      state.logoImg = img;
      if (DOM.logoThumbImg) DOM.logoThumbImg.src = dataUrl;
      if (DOM.logoName) DOM.logoName.textContent = 'Mẫu Logo Mặc Định (Studio)';
      if (DOM.logoDim) DOM.logoDim.textContent = `${img.naturalWidth} × ${img.naturalHeight}px`;
      renderPreview();
    };
  }

  // --- Preset System ---
  function loadPresets() {
    const saved = localStorage.getItem('lightmark_presets');
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
    localStorage.setItem('lightmark_presets', JSON.stringify(state.presets));
  }

  function renderPresetDropdown() {
    DOM.presetSelect.innerHTML = '';
    const groupDefault = document.createElement('optgroup');
    groupDefault.label = 'Mẫu Mặc Định';
    const groupCustom = document.createElement('optgroup');
    groupCustom.label = 'Mẫu Đã Lưu Của Bạn';

    state.presets.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id.startsWith('default-')) {
        groupDefault.appendChild(opt);
      } else {
        groupCustom.appendChild(opt);
      }
    });

    DOM.presetSelect.appendChild(groupDefault);
    if (groupCustom.children.length > 0) {
      DOM.presetSelect.appendChild(groupCustom);
    }
  }

  function applyPreset(presetId) {
    const found = state.presets.find(p => p.id === presetId);
    if (!found) return;

    // Deep merge configuration
    state.watermark = {
      ...state.watermark,
      ...JSON.parse(JSON.stringify(found.config))
    };

    updateUIFromConfig();
    renderPreview();
  }

  function saveCurrentAsPreset() {
    const name = prompt('Nhập tên cho mẫu Watermark mới:', `Mẫu thiết lập ${state.presets.length + 1}`);
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

  function deleteCurrentPreset() {
    const currentId = DOM.presetSelect.value;
    if (currentId.startsWith('default-')) {
      alert('Không thể xóa mẫu mặc định của hệ thống.');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa mẫu này?')) {
      state.presets = state.presets.filter(p => p.id !== currentId);
      savePresetsToStorage();
      renderPresetDropdown();
      applyPreset(state.presets[0].id);
    }
  }

  // --- Synchronize UI Elements with Config State ---
  function updateUIFromConfig() {
    const wm = state.watermark;

    // Type tab
    if (wm.type === 'image') {
      DOM.btnTabImage.classList.add('active');
      DOM.btnTabText.classList.remove('active');
      DOM.groupImageControls.style.display = 'flex';
      DOM.groupTextControls.style.display = 'none';
    } else {
      DOM.btnTabImage.classList.remove('active');
      DOM.btnTabText.classList.add('active');
      DOM.groupImageControls.style.display = 'none';
      DOM.groupTextControls.style.display = 'flex';
    }

    // Logo filter
    DOM.logoFilterSelect.value = wm.colorFilter || 'original';
    DOM.tintColorRow.style.display = wm.colorFilter === 'tint' ? 'flex' : 'none';
    if (wm.tintColor) DOM.tintColorPicker.value = wm.tintColor;

    // Text inputs
    DOM.textInput.value = wm.text;
    DOM.fontSelect.value = wm.fontFamily;
    DOM.btnFontBold.style.backgroundColor = wm.bold ? 'var(--accent)' : 'var(--bg-input)';
    DOM.btnFontItalic.style.backgroundColor = wm.italic ? 'var(--accent)' : 'var(--bg-input)';
    DOM.textColorPicker.value = wm.textColor;
    DOM.toggleStroke.checked = wm.stroke.enabled;
    DOM.toggleBgBox.checked = wm.bgBox.enabled;

    // Sliders
    DOM.sliderScale.value = wm.scale;
    DOM.valScale.value = wm.scale;
    DOM.sliderOpacity.value = wm.opacity;
    DOM.valOpacity.value = wm.opacity;
    DOM.sliderInsetX.value = wm.insetX;
    DOM.valInsetX.value = wm.insetX;
    DOM.sliderInsetY.value = wm.insetY;
    DOM.valInsetY.value = wm.insetY;
    DOM.sliderRotation.value = wm.rotation;
    DOM.valRotation.value = wm.rotation;

    DOM.scaleModeSelect.value = wm.scaleMode;
    DOM.blendModeSelect.value = wm.blendMode;
    DOM.toggleShadow.checked = wm.shadow.enabled;

    // Tiled
    DOM.toggleTiled.checked = wm.tiled.enabled;
    DOM.groupTiledControls.style.display = wm.tiled.enabled ? 'flex' : 'none';
    DOM.sliderTiledSpacing.value = wm.tiled.spacing;
    DOM.valTiledSpacing.value = wm.tiled.spacing;

    // 9-Point Anchor cells
    DOM.anchorCells.forEach(cell => {
      if (cell.dataset.anchor === wm.anchor) {
        cell.classList.add('active');
      } else {
        cell.classList.remove('active');
      }
    });
  }

  // --- Photo Queue Management ---
  function addFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }

    const startIdx = state.photos.length;

    validFiles.forEach((file, i) => {
      const photoObj = {
        id: 'photo-' + Date.now() + '-' + (startIdx + i),
        file: file,
        name: file.name,
        size: file.size,
        dataUrl: URL.createObjectURL(file),
        img: null,
        width: 0,
        height: 0
      };

      const img = new Image();
      img.src = photoObj.dataUrl;
      img.onload = () => {
        photoObj.img = img;
        photoObj.width = img.naturalWidth;
        photoObj.height = img.naturalHeight;
        if (state.currentIndex === (startIdx + i)) {
          updateHeaderInfo();
          renderPreview();
        }
      };

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
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ ảnh trong danh sách?')) {
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
      DOM.currentDim.textContent = current.width ? `${current.width} × ${current.height}px` : 'Đang tải...';
      DOM.photoCountBadge.textContent = `${state.currentIndex + 1} / ${state.photos.length} ảnh`;
    }
  }

  // --- Filmstrip Rendering ---
  function renderFilmstrip() {
    DOM.filmstripItems.innerHTML = '';

    // Add Photos Button inside strip
    const addBtn = document.createElement('button');
    addBtn.className = 'add-thumb-btn';
    addBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

  // --- Live Preview Canvas Rendering ---
  let animationFrameId = null;

  function renderPreview() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(doRenderPreview);
  }

  function doRenderPreview() {
    const photo = state.photos[state.currentIndex];
    if (!photo || !photo.img || !photo.img.complete) return;

    const canvas = DOM.previewCanvas;
    const ctx = canvas.getContext('2d');

    // Calculate display dimensions based on viewport
    const containerW = DOM.canvasContainer.clientWidth - 40;
    const containerH = DOM.canvasContainer.clientHeight - 40;

    let targetW = photo.width;
    let targetH = photo.height;

    // Scale canvas to fit viewport comfortably
    const scale = Math.min(containerW / targetW, containerH / targetH, 1);
    const displayW = Math.round(targetW * scale);
    const displayH = Math.round(targetH * scale);

    canvas.width = displayW;
    canvas.height = displayH;

    // Draw background photo
    ctx.drawImage(photo.img, 0, 0, displayW, displayH);

    // If Before/After is held to "Show Original", stop here!
    if (state.showOriginal) {
      DOM.interactiveBox.style.display = 'none';
      return;
    }

    // Render Watermark on top
    const metrics = WatermarkEngine.renderWatermark(
      ctx,
      displayW,
      displayH,
      state.watermark,
      state.logoImg
    );

    // Position interactive bounding box on top of canvas for direct drag & resize
    if (metrics && !state.watermark.tiled.enabled) {
      updateInteractiveBox(metrics, displayW, displayH);
    } else {
      DOM.interactiveBox.style.display = 'none';
    }
  }

  // --- Interactive On-Canvas Watermark Bounding Box ---
  function updateInteractiveBox(metrics, canvasW, canvasH) {
    const box = DOM.interactiveBox;
    box.style.display = 'block';
    box.style.left = `${metrics.x}px`;
    box.style.top = `${metrics.y}px`;
    box.style.width = `${metrics.width}px`;
    box.style.height = `${metrics.height}px`;
    box.style.transform = `rotate(${state.watermark.rotation}deg)`;
  }

  // --- Batch Export Engine ---
  async function startBatchExport(onlyCurrent = false) {
    if (state.photos.length === 0) return;
    state.isExporting = true;

    const listToExport = onlyCurrent ? [state.photos[state.currentIndex]] : state.photos;
    const total = listToExport.length;

    // Open progress modal
    DOM.progressModal.classList.add('active');
    DOM.progressBarFill.style.width = '0%';
    DOM.progressText.textContent = `0 / ${total} ảnh`;
    DOM.progressDetail.textContent = 'Đang chuẩn bị...';

    const zip = new JSZip();
    const startTime = Date.now();

    for (let i = 0; i < total; i++) {
      if (!state.isExporting) break; // User cancelled

      const item = listToExport[i];
      DOM.progressDetail.textContent = `Đang xử lý: ${item.name} (${item.width} × ${item.height}px)`;
      DOM.progressText.textContent = `${i + 1} / ${total} ảnh (${Math.round(((i + 1) / total) * 100)}%)`;
      DOM.progressBarFill.style.width = `${((i + 1) / total) * 100}%`;

      // 1. Process at FULL ORIGINAL RESOLUTION
      const blob = await processFullResImage(item);

      // 2. Generate Output Filename
      const outName = formatOutputName(item.name, i + 1, state.exportSettings.format);

      if (total === 1) {
        // Direct download single file
        downloadBlob(blob, outName);
      } else {
        // Add to ZIP (store mode is lightning fast for JPEGs)
        zip.file(outName, blob);
      }

      // Small async yield so UI remains silky smooth
      await new Promise(r => setTimeout(r, 15));
    }

    if (state.isExporting && total > 1) {
      DOM.progressDetail.textContent = 'Đang đóng gói file ZIP...';
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'STORE'
      });
      const zipName = `watermark_photos_${Date.now()}.zip`;
      downloadBlob(zipBlob, zipName);
    }

    // Done
    setTimeout(() => {
      DOM.progressModal.classList.remove('active');
      state.isExporting = false;
    }, 500);
  }

  /**
   * Process a single photo at FULL original resolution
   */
  async function processFullResImage(photo) {
    return new Promise(resolve => {
      // Ensure image is loaded
      const img = new Image();
      img.src = photo.dataUrl;
      img.onload = () => {
        let finalW = img.naturalWidth;
        let finalH = img.naturalHeight;

        // Check if resize mode is active
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

        // Draw original photo crisply
        offCtx.drawImage(img, 0, 0, finalW, finalH);

        // Render Watermark with exact mathematical proportionality
        WatermarkEngine.renderWatermark(
          offCtx,
          finalW,
          finalH,
          state.watermark,
          state.logoImg
        );

        // Convert to selected format and quality
        let mime = state.exportSettings.format;
        if (mime === 'original') {
          mime = photo.file.type || 'image/jpeg';
        }

        const quality = (state.exportSettings.quality || 92) / 100;

        offCanvas.toBlob(blob => {
          resolve(blob);
        }, mime, quality);
      };
    });
  }

  function formatOutputName(originalName, index, format) {
    const lastDot = originalName.lastIndexOf('.');
    const baseName = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
    let ext = lastDot !== -1 ? originalName.substring(lastDot + 1).toLowerCase() : 'jpg';

    if (format === 'image/jpeg') ext = 'jpg';
    else if (format === 'image/png') ext = 'png';
    else if (format === 'image/webp') ext = 'webp';

    const pattern = state.exportSettings.namingPattern || '{name}_watermarked';
    const formatted = pattern
      .replace('{name}', baseName)
      .replace('{index}', String(index).padStart(3, '0'));

    return `${formatted}.${ext}`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // --- Event Bindings ---
  function bindEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      renderPreview();
    });

    // Preset Selection
    DOM.presetSelect.addEventListener('change', (e) => {
      applyPreset(e.target.value);
    });

    DOM.btnSavePreset.addEventListener('click', saveCurrentAsPreset);
    DOM.btnDeletePreset.addEventListener('click', deleteCurrentPreset);

    // Photos Input
    DOM.photosInput.addEventListener('change', (e) => {
      addFiles(e.target.files);
      e.target.value = '';
    });

    if (DOM.btnLoadDemo) {
      DOM.btnLoadDemo.addEventListener('click', loadDemoPhotos);
    }

    DOM.btnAddPhotos.addEventListener('click', () => DOM.photosInput.click());
    DOM.emptyState.addEventListener('click', () => DOM.photosInput.click());
    DOM.btnClearPhotos.addEventListener('click', clearAllPhotos);

    // Global Drag & Drop for Photos
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

    document.body.addEventListener('dragleave', (e) => {
      DOM.emptyState.classList.remove('drag-over');
    });

    document.body.addEventListener('drop', (e) => {
      DOM.emptyState.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        addFiles(files);
      }
    });

    // Logo Dropzone & Input
    DOM.logoDropzone.addEventListener('click', () => DOM.logoInput.click());
    DOM.logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        loadCustomLogo(file);
      }
      e.target.value = '';
    });

    DOM.logoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      DOM.logoDropzone.classList.add('drag-over');
    });

    DOM.logoDropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      DOM.logoDropzone.classList.remove('drag-over');
    });

    DOM.logoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      DOM.logoDropzone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        loadCustomLogo(file);
      }
    });

    // Watermark Type Tabs
    DOM.btnTabImage.addEventListener('click', () => {
      state.watermark.type = 'image';
      updateUIFromConfig();
      renderPreview();
    });

    DOM.btnTabText.addEventListener('click', () => {
      state.watermark.type = 'text';
      updateUIFromConfig();
      renderPreview();
    });

    // Logo Color Filter
    DOM.logoFilterSelect.addEventListener('change', (e) => {
      state.watermark.colorFilter = e.target.value;
      DOM.tintColorRow.style.display = e.target.value === 'tint' ? 'flex' : 'none';
      renderPreview();
    });

    DOM.tintColorPicker.addEventListener('input', (e) => {
      state.watermark.tintColor = e.target.value;
      renderPreview();
    });

    // Text inputs
    DOM.textInput.addEventListener('input', (e) => {
      state.watermark.text = e.target.value;
      renderPreview();
    });

    DOM.fontSelect.addEventListener('change', (e) => {
      state.watermark.fontFamily = e.target.value;
      renderPreview();
    });

    DOM.btnFontBold.addEventListener('click', () => {
      state.watermark.bold = !state.watermark.bold;
      DOM.btnFontBold.style.backgroundColor = state.watermark.bold ? 'var(--accent)' : 'var(--bg-input)';
      renderPreview();
    });

    DOM.btnFontItalic.addEventListener('click', () => {
      state.watermark.italic = !state.watermark.italic;
      DOM.btnFontItalic.style.backgroundColor = state.watermark.italic ? 'var(--accent)' : 'var(--bg-input)';
      renderPreview();
    });

    DOM.textColorPicker.addEventListener('input', (e) => {
      state.watermark.textColor = e.target.value;
      renderPreview();
    });

    DOM.toggleStroke.addEventListener('change', (e) => {
      state.watermark.stroke.enabled = e.target.checked;
      renderPreview();
    });

    DOM.toggleBgBox.addEventListener('change', (e) => {
      state.watermark.bgBox.enabled = e.target.checked;
      renderPreview();
    });

    // Sliders & Link to Numeric inputs
    bindSlider(DOM.sliderScale, DOM.valScale, (val) => {
      state.watermark.scale = val;
      renderPreview();
    });

    bindSlider(DOM.sliderOpacity, DOM.valOpacity, (val) => {
      state.watermark.opacity = val;
      renderPreview();
    });

    bindSlider(DOM.sliderInsetX, DOM.valInsetX, (val) => {
      state.watermark.insetX = val;
      state.watermark.customOffset.enabled = false;
      renderPreview();
    });

    bindSlider(DOM.sliderInsetY, DOM.valInsetY, (val) => {
      state.watermark.insetY = val;
      state.watermark.customOffset.enabled = false;
      renderPreview();
    });

    bindSlider(DOM.sliderRotation, DOM.valRotation, (val) => {
      state.watermark.rotation = val;
      renderPreview();
    });

    DOM.scaleModeSelect.addEventListener('change', (e) => {
      state.watermark.scaleMode = e.target.value;
      renderPreview();
    });

    DOM.blendModeSelect.addEventListener('change', (e) => {
      state.watermark.blendMode = e.target.value;
      renderPreview();
    });

    DOM.toggleShadow.addEventListener('change', (e) => {
      state.watermark.shadow.enabled = e.target.checked;
      renderPreview();
    });

    DOM.toggleTiled.addEventListener('change', (e) => {
      state.watermark.tiled.enabled = e.target.checked;
      DOM.groupTiledControls.style.display = e.target.checked ? 'flex' : 'none';
      renderPreview();
    });

    bindSlider(DOM.sliderTiledSpacing, DOM.valTiledSpacing, (val) => {
      state.watermark.tiled.spacing = val;
      renderPreview();
    });

    // Quick Rotation Buttons
    document.querySelectorAll('.rot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const angle = parseInt(btn.dataset.rot, 10);
        state.watermark.rotation = angle;
        DOM.sliderRotation.value = angle;
        DOM.valRotation.value = angle;
        renderPreview();
      });
    });

    // 9-Point Anchor Grid Click
    DOM.anchorCells.forEach(cell => {
      cell.addEventListener('click', () => {
        DOM.anchorCells.forEach(c => c.classList.remove('active'));
        cell.classList.add('active');
        state.watermark.anchor = cell.dataset.anchor;
        state.watermark.customOffset.enabled = false;
        renderPreview();
      });
    });

    // Navigation Controls
    DOM.btnPrevPhoto.addEventListener('click', () => selectPhoto(state.currentIndex - 1));
    DOM.btnNextPhoto.addEventListener('click', () => selectPhoto(state.currentIndex + 1));

    // Before / After View Toggle
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

    // Interactive Dragging on Canvas Box
    setupInteractiveDrag();

    // Export Buttons
    DOM.btnExportBatch.addEventListener('click', () => {
      DOM.exportModal.classList.add('active');
    });

    DOM.btnExportCurrent.addEventListener('click', () => {
      startBatchExport(true);
    });

    DOM.btnCancelExportModal.addEventListener('click', () => {
      DOM.exportModal.classList.remove('active');
    });

    DOM.btnStartExport.addEventListener('click', () => {
      // Gather export settings
      state.exportSettings.format = DOM.exportFormat.value;
      state.exportSettings.quality = parseInt(DOM.exportQuality.value, 10);
      state.exportSettings.resizeMode = DOM.exportResize.value;
      state.exportSettings.maxEdge = parseInt(DOM.exportResizeMaxEdge.value, 10) || 2048;
      state.exportSettings.namingPattern = DOM.exportNaming.value || '{name}_watermarked';

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

    DOM.exportResize.addEventListener('change', (e) => {
      DOM.maxEdgeRow.style.display = e.target.value === 'max_edge' ? 'flex' : 'none';
    });

    DOM.btnCancelProgress.addEventListener('click', () => {
      state.isExporting = false;
      DOM.progressModal.classList.remove('active');
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'ArrowLeft') {
        selectPhoto(state.currentIndex - 1);
      } else if (e.code === 'ArrowRight') {
        selectPhoto(state.currentIndex + 1);
      } else if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        state.showOriginal = true;
        renderPreview();
      } else if (e.code === 'KeyE' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        DOM.btnExportBatch.click();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        state.showOriginal = false;
        renderPreview();
      }
    });
  }

  // --- Demo Photography Generator (Landscape + Portrait) ---
  function loadDemoPhotos() {
    const demos = [
      { name: 'Demo_Landscape_3000x2000.jpg', w: 3000, h: 2000, type: 'landscape' },
      { name: 'Demo_Portrait_2000x3000.jpg', w: 2000, h: 3000, type: 'portrait' }
    ];

    demos.forEach(d => {
      const c = document.createElement('canvas');
      c.width = d.w;
      c.height = d.h;
      const ctx = c.getContext('2d');

      if (d.type === 'landscape') {
        // Sunset Landscape Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, d.h);
        grad.addColorStop(0, '#1a102f');
        grad.addColorStop(0.35, '#5c2243');
        grad.addColorStop(0.65, '#bd4832');
        grad.addColorStop(0.85, '#f09338');
        grad.addColorStop(1, '#ffcb6b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, d.w, d.h);

        // Distant Mountain Ridges
        ctx.fillStyle = '#261224';
        ctx.beginPath();
        ctx.moveTo(0, d.h * 0.72);
        ctx.lineTo(d.w * 0.25, d.h * 0.62);
        ctx.lineTo(d.w * 0.55, d.h * 0.68);
        ctx.lineTo(d.w * 0.85, d.h * 0.58);
        ctx.lineTo(d.w, d.h * 0.66);
        ctx.lineTo(d.w, d.h);
        ctx.lineTo(0, d.h);
        ctx.closePath();
        ctx.fill();

        // Foreground Hills
        ctx.fillStyle = '#100813';
        ctx.beginPath();
        ctx.moveTo(0, d.h * 0.82);
        ctx.lineTo(d.w * 0.4, d.h * 0.74);
        ctx.lineTo(d.w * 0.75, d.h * 0.84);
        ctx.lineTo(d.w, d.h * 0.78);
        ctx.lineTo(d.w, d.h);
        ctx.lineTo(0, d.h);
        ctx.closePath();
        ctx.fill();
      } else {
        // Atmospheric Studio Portrait Backdrop
        const grad = ctx.createRadialGradient(d.w * 0.5, d.h * 0.42, 100, d.w * 0.5, d.h * 0.42, d.h * 0.75);
        grad.addColorStop(0, '#3a4a5e');
        grad.addColorStop(0.5, '#1e2530');
        grad.addColorStop(1, '#0c0e12');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, d.w, d.h);

        // Bokeh Circles
        for (let i = 0; i < 28; i++) {
          const bx = (Math.sin(i * 3.7) * 0.5 + 0.5) * d.w;
          const by = (Math.cos(i * 4.9) * 0.5 + 0.5) * d.h;
          const rad = 40 + (i % 6) * 35;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + (i % 4) * 0.02})`;
          ctx.beginPath();
          ctx.arc(bx, by, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Vignette effect
      const vig = ctx.createRadialGradient(d.w / 2, d.h / 2, Math.min(d.w, d.h) * 0.4, d.w / 2, d.h / 2, Math.max(d.w, d.h) * 0.75);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, d.w, d.h);

      c.toBlob(blob => {
        const file = new File([blob], d.name, { type: 'image/jpeg' });
        addFiles([file]);
      }, 'image/jpeg', 0.95);
    });
  }

  function loadCustomLogo(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      state.logoImg = img;
      DOM.logoThumbImg.src = url;
      DOM.logoName.textContent = file.name;
      DOM.logoDim.textContent = `${img.naturalWidth} × ${img.naturalHeight}px`;
      renderPreview();
    };
  }

  function bindSlider(sliderEl, inputEl, onChange) {
    sliderEl.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      inputEl.value = val;
      onChange(val);
    });

    inputEl.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) val = 0;
      sliderEl.value = val;
      onChange(val);
    });
  }

  // --- Direct On-Canvas Drag & Resize Logic ---
  function setupInteractiveDrag() {
    const box = DOM.interactiveBox;
    let isDragging = false;
    let isResizing = false;
    let startX, startY;
    let initialLeft, initialTop, initialWidth;

    box.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('resize-handle')) {
        isResizing = true;
        startX = e.clientX;
        initialWidth = parseFloat(box.style.width);
      } else {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = parseFloat(box.style.left);
        initialTop = parseFloat(box.style.top);
      }
      e.stopPropagation();
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging && !isResizing) return;

      const canvas = DOM.previewCanvas;
      if (!canvas) return;

      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newX = initialLeft + dx;
        const newY = initialTop + dy;

        state.watermark.customOffset = {
          enabled: true,
          xRatio: newX / canvas.width,
          yRatio: newY / canvas.height
        };
        renderPreview();
      } else if (isResizing) {
        const dx = e.clientX - startX;
        const newWidth = Math.max(20, initialWidth + dx);
        const newScale = Math.round((newWidth / Math.min(canvas.width, canvas.height)) * 100);
        const clampedScale = Math.max(2, Math.min(100, newScale));
        
        state.watermark.scale = clampedScale;
        DOM.sliderScale.value = clampedScale;
        DOM.valScale.value = clampedScale;
        renderPreview();
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      isResizing = false;
    });
  }

  // Kickstart on DOM Content Loaded
  document.addEventListener('DOMContentLoaded', init);
})();
