/**
 * Đội Tình Nguyện 10/1985 - Watermark Studio App Logic
 * Xử lý hình ảnh hàng loạt trực tiếp trên trình duyệt máy tính & điện thoại
 */

(function () {
  'use strict';

  const DEFAULT_LOGO_PATH = 'assets/logo-doi.png';

  // --- Initial State ---
  const state = {
    photos: [],
    currentIndex: 0,
    showOriginal: false,
    isExporting: false,
    logoImg: null,
    
    // Cấu hình watermark chuẩn của Đội
    watermark: {
      scale: 18, // 18% kích thước ảnh
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

  // --- Mẫu thiết lập sẵn cho Đội ---
  const defaultPresets = [
    {
      id: 'default-tc',
      name: '⭐ Chuẩn Đội: Giữa - Trên cùng (18%)',
      config: { anchor: 'tc', scale: 18, insetX: 0, insetY: 3.5, rotation: 0 }
    },
    {
      id: 'default-br',
      name: 'Góc Dưới - Phải (16%)',
      config: { anchor: 'br', scale: 16, insetX: 3, insetY: 3, rotation: 0 }
    },
    {
      id: 'default-bl',
      name: 'Góc Dưới - Trái (16%)',
      config: { anchor: 'bl', scale: 16, insetX: 3, insetY: 3, rotation: 0 }
    },
    {
      id: 'default-tr',
      name: 'Góc Trên - Phải (16%)',
      config: { anchor: 'tr', scale: 16, insetX: 3, insetY: 3, rotation: 0 }
    },
    {
      id: 'default-center',
      name: 'Logo Lớn Chính Giữa (30%)',
      config: { anchor: 'mc', scale: 30, insetX: 0, insetY: 0, rotation: 0 }
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
    DOM.btnLoadDemo = document.getElementById('btn-load-demo');

    // Preset Picker
    DOM.presetSelect = document.getElementById('preset-select');
    DOM.btnSavePreset = document.getElementById('btn-save-preset');

    // Logo elements
    DOM.logoThumbImg = document.getElementById('logo-thumb-img');
    DOM.logoDim = document.getElementById('logo-dim');
    DOM.logoInput = document.getElementById('logo-input');
    DOM.btnResetDefaultLogo = document.getElementById('btn-reset-default-logo');

    // Size Slider & Quick buttons
    DOM.sliderScale = document.getElementById('slider-scale');
    DOM.valScaleBadge = document.getElementById('val-scale-badge');
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

  // --- Load Team Logo ---
  function loadDefaultTeamLogo() {
    const img = new Image();
    img.src = DEFAULT_LOGO_PATH;
    img.onload = () => {
      state.logoImg = img;
      if (DOM.logoThumbImg) DOM.logoThumbImg.src = DEFAULT_LOGO_PATH;
      if (DOM.logoDim) DOM.logoDim.textContent = `${img.naturalWidth} × ${img.naturalHeight}px (Đã cắt viền)`;
      renderPreview();
    };
    img.onerror = () => {
      // Fallback nếu chạy ở môi trường đặc biệt
      console.warn('Không thể tải logo từ path, kiểm tra thư mục assets');
    };
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

    state.watermark = {
      ...state.watermark,
      ...JSON.parse(JSON.stringify(found.config)),
      customOffset: { enabled: false, xRatio: 0, yRatio: 0 }
    };

    updateUIFromConfig();
    renderPreview();
  }

  function saveCurrentAsPreset() {
    const name = prompt('Nhập tên cho mẫu thiết lập mới của Đội:', `Mẫu của tôi ${state.presets.length + 1}`);
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

    // Scale slider & badge
    DOM.sliderScale.value = wm.scale;
    DOM.valScaleBadge.textContent = `${wm.scale}%`;
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

    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Vui lòng chọn file hình ảnh (JPG, PNG, WebP).');
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
    if (!photo || !photo.img || !photo.img.complete) return;

    const canvas = DOM.previewCanvas;
    const ctx = canvas.getContext('2d');

    const containerW = DOM.canvasContainer.clientWidth - 40;
    const containerH = DOM.canvasContainer.clientHeight - 40;

    let targetW = photo.width;
    let targetH = photo.height;

    const scale = Math.min(containerW / targetW, containerH / targetH, 1);
    const displayW = Math.round(targetW * scale);
    const displayH = Math.round(targetH * scale);

    canvas.width = displayW;
    canvas.height = displayH;

    // Vẽ ảnh nền
    ctx.drawImage(photo.img, 0, 0, displayW, displayH);

    // Nếu người dùng đang giữ phím Space xem ảnh gốc
    if (state.showOriginal) {
      DOM.interactiveBox.style.display = 'none';
      return;
    }

    // Vẽ logo của Đội
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
  }

  // --- Batch Export Engine ---
  async function startBatchExport(onlyCurrent = false) {
    if (state.photos.length === 0) return;
    state.isExporting = true;

    const listToExport = onlyCurrent ? [state.photos[state.currentIndex]] : state.photos;
    const total = listToExport.length;

    DOM.progressModal.classList.add('active');
    DOM.progressBarFill.style.width = '0%';
    DOM.progressText.textContent = `0 / ${total} ảnh`;
    DOM.progressDetail.textContent = 'Đang chuẩn bị...';

    const zip = new JSZip();

    for (let i = 0; i < total; i++) {
      if (!state.isExporting) break;

      const item = listToExport[i];
      DOM.progressDetail.textContent = `Đang xử lý: ${item.name}`;
      DOM.progressText.textContent = `${i + 1} / ${total} ảnh (${Math.round(((i + 1) / total) * 100)}%)`;
      DOM.progressBarFill.style.width = `${((i + 1) / total) * 100}%`;

      // Xử lý ở độ phân giải gốc
      const blob = await processFullResImage(item);
      const outName = formatOutputName(item.name, i + 1, state.exportSettings.format);

      if (total === 1) {
        downloadBlob(blob, outName);
      } else {
        zip.file(outName, blob);
      }

      await new Promise(r => setTimeout(r, 15));
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

    setTimeout(() => {
      DOM.progressModal.classList.remove('active');
      state.isExporting = false;
    }, 500);
  }

  async function processFullResImage(photo) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = photo.dataUrl;
      img.onload = () => {
        let finalW = img.naturalWidth;
        let finalH = img.naturalHeight;

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

        // Vẽ logo Đội chuẩn tỉ lệ toán học
        WatermarkEngine.renderWatermark(
          offCtx,
          finalW,
          finalH,
          state.watermark,
          state.logoImg
        );

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

    const pattern = state.exportSettings.namingPattern || '{name}_doi1085';
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

  // --- Demo Photography (Ảnh hoạt động tình nguyện mẫu) ---
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
        // Nắng hè tình nguyện rực rỡ
        const grad = ctx.createLinearGradient(0, 0, 0, d.h);
        grad.addColorStop(0, '#2b70c9');
        grad.addColorStop(0.5, '#7bb4f7');
        grad.addColorStop(0.75, '#fde68a');
        grad.addColorStop(1, '#15803d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, d.w, d.h);

        // Đồi xanh
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
        // Ảnh tập thể dọc ấm cúng
        const grad = ctx.createRadialGradient(d.w * 0.5, d.h * 0.4, 200, d.w * 0.5, d.h * 0.5, d.h * 0.8);
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(0.6, '#1e3a8a');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, d.w, d.h);
      }

      c.toBlob(blob => {
        const file = new File([blob], d.name, { type: 'image/jpeg' });
        addFiles([file]);
      }, 'image/jpeg', 0.95);
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

    DOM.btnAddPhotos.addEventListener('click', () => DOM.photosInput.click());
    DOM.emptyState.addEventListener('click', () => DOM.photosInput.click());
    DOM.btnClearPhotos.addEventListener('click', clearAllPhotos);
    if (DOM.btnLoadDemo) DOM.btnLoadDemo.addEventListener('click', loadDemoPhotos);

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

    // Logo change & reset
    DOM.logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          state.logoImg = img;
          DOM.logoThumbImg.src = url;
          DOM.logoDim.textContent = `${img.naturalWidth} × ${img.naturalHeight}px (Logo tùy chọn)`;
          renderPreview();
        };
      }
      e.target.value = '';
    });

    DOM.btnResetDefaultLogo.addEventListener('click', () => {
      loadDefaultTeamLogo();
    });

    // Size Slider
    DOM.sliderScale.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.watermark.scale = val;
      DOM.valScaleBadge.textContent = `${val}%`;
      DOM.quickScaleBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.scale, 10) === val);
      });
      renderPreview();
    });

    // Quick Size Buttons
    DOM.quickScaleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const s = parseInt(btn.dataset.scale, 10);
        state.watermark.scale = s;
        DOM.sliderScale.value = s;
        DOM.valScaleBadge.textContent = `${s}%`;
        DOM.quickScaleBtns.forEach(b => b.classList.toggle('active', b === btn));
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

  // --- Interactive Drag on Canvas ---
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
        const clampedScale = Math.max(6, Math.min(45, newScale));
        
        state.watermark.scale = clampedScale;
        DOM.sliderScale.value = clampedScale;
        DOM.valScaleBadge.textContent = `${clampedScale}%`;
        DOM.quickScaleBtns.forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.scale, 10) === clampedScale);
        });
        renderPreview();
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      isResizing = false;
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
