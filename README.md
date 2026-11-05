# Lightmark Pro - Trình Ghép Logo & Watermark Hàng Loạt Chuẩn Adobe Lightroom

**Lightmark Pro** là ứng dụng web xử lý và đóng dấu watermark / ghép logo hàng loạt cho hình ảnh, được thiết kế lấy cảm hứng từ tính năng Watermark chuyên nghiệp trên **Adobe Lightroom Classic**.

Ứng dụng chạy hoàn toàn **trên trình duyệt máy tính của bạn (Client-side)**, không tải ảnh lên máy chủ nào, đảm bảo **100% riêng tư, an toàn và tốc độ siêu nhanh** kể cả khi xử lý hàng trăm bức ảnh độ phân giải cao (24MP - 48MP+).

---

## 🚀 Cách Mở & Sử Dụng

### Cách 1: Nhanh nhất (Không cần cài đặt)
- Nhấp đúp chuột vào file **`start.bat`** (hoặc nhấp đúp file **`index.html`**).
- Ứng dụng sẽ tự động mở ngay trên trình duyệt (Chrome, Edge, Firefox, Cốc Cốc, v.v.).

### Cách 2: Chạy qua Local Server (Tùy chọn)
Nếu bạn muốn chạy dạng localhost:
```bash
python server.py
```
Trình duyệt sẽ tự động mở `http://localhost:8080`.

---

## 🌟 Các Tính Năng Nổi Bật (Chuẩn Lightroom)

### 1. Nguồn Watermark Đa Dạng
- **Logo / Hình ảnh (PNG, WebP, JPG, SVG)**:
  - Tự động nhận diện độ trong suốt (Alpha channel).
  - Tích hợp sẵn bộ lọc thông minh:
    - *Màu gốc* của logo.
    - *Đổi sang Trắng tinh khiết* (Monochrome White) - cực kỳ hữu ích khi logo màu tối nằm trên nền ảnh tối.
    - *Đổi sang Đen* (Monochrome Black).
    - *Đổi màu tùy chỉnh* (Tint color picker).
- **Văn bản / Chữ ký số (Text / Signature)**:
  - Tùy biến font chữ đa dạng (Inter, Roboto, Playfair Display, Montserrat, Dancing Script cho chữ ký nghệ thuật).
  - Đậm (Bold), Nghiêng (Italic), Màu sắc, Viền chữ (Stroke/Outline), Khung nền mờ (Background Box).

### 2. Định Vị & Neo Vị Trí (9-Point Anchor Grid)
- **Lưới neo 9 điểm chuẩn Lightroom**:
  - Top-Left (Góc trên trái), Top-Center, Top-Right (Góc trên phải).
  - Middle-Left, Center (Chính giữa), Middle-Right.
  - Bottom-Left (Góc dưới trái), Bottom-Center, Bottom-Right (Góc dưới phải).
- Căn lề ngang & dọc chính xác theo tỉ lệ % (`Inset X / Inset Y`).
- Kéo thả & thay đổi kích thước trực tiếp ngay trên khung xem trước (Interactive On-Canvas Drag & Resize).

### 3. Tỉ Lệ Thông Minh (Proportional Scale)
- Tự động co giãn theo % kích thước cạnh ảnh. Dù bạn chụp ảnh ngang hay dọc, ảnh 12MP hay 48MP, watermark luôn hiển thị đồng bộ và cân đối tuyệt đối trên mọi bức ảnh trong mẻ xuất.

### 4. Hiệu Ứng & Chế Độ Hòa Trộn (Effects & Blend Modes)
- Độ mờ đục (Opacity) từ 0% đến 100%.
- Các chế độ hòa trộn: *Normal, Multiply, Screen, Overlay, Soft Light*.
- Đổ bóng thực tế (Drop Shadow) giúp nổi bật logo trên mọi chi tiết phức tạp của ảnh.
- Xoay góc tự do (-180° đến 180°) và các nút xoay nhanh (0°, 45°, 90°, -45°, 180°).

### 5. Chế Độ Lưới Chống Trộm (Tiled Protection Pattern)
- Tự động nhân bản watermark dạng lưới caro chéo trải đều khắp ảnh, bảo vệ bản quyền ảnh demo gửi khách hàng trước khi thanh toán.

### 6. Quản Lý Mẫu Cấu Hình (Presets)
- Đi kèm sẵn các mẫu chuẩn:
  - *Góc Dưới Phải (Chuẩn Lightroom)*
  - *Góc Dưới Trái (Logo Trắng)*
  - *Chính Giữa Chống Trộm (Mờ 35%)*
  - *Lưới Caro Toàn Màn Hình (Tiled)*
  - *Chữ Ký Nghệ Thuật (Signature Text)*
- Cho phép bạn lưu các cấu hình yêu thích thành mẫu riêng (lưu vĩnh viễn trên máy).

### 7. Xuất Ảnh Hàng Loạt Độ Phân Giải Gốc (Batch Export)
- Xử lý mượt mà hàng trăm ảnh cùng lúc mà không làm đơ trình duyệt.
- Tùy chọn định dạng: **JPEG** (chỉnh được thanh chất lượng 40-100%), **PNG**, **WebP**, hoặc **Giữ nguyên định dạng gốc**.
- Tùy chọn Resize: Giữ nguyên Full Resolution hoặc giới hạn cạnh dài nhất (ví dụ: 2048px chuẩn Facebook).
- Tùy chỉnh quy tắc đặt tên file: `{name}_watermarked`, `{name}_{index}`, v.v.
- Tự động đóng gói tất cả vào một file **`.ZIP`** tải về máy tính trong chớp mắt.
- Có nút "Tải ảnh này" để xem trước chất lượng xuất của 1 tấm duy nhất.

---

## ⌨️ Phím Tắt Nhanh (Keyboard Shortcuts)
- **Space (Phím cách)**: Nhấn giữ để xem ảnh gốc trước khi gắn watermark (Before / After).
- **Phím ← (Mũi tên trái)**: Xem ảnh trước trong hàng đợi.
- **Phím → (Mũi tên phải)**: Xem ảnh tiếp theo.
- **Ctrl + E**: Mở nhanh hộp thoại Xuất hàng loạt.

---

## 📁 Cấu Trúc Thư Mục
```
d:\ghép logo\
├── index.html            # Giao diện chính ứng dụng
├── css\
│   └── style.css         # Giao diện phong cách Adobe Lightroom Dark UI
├── js\
│   ├── app.js            # Điều khiển giao diện, hàng đợi ảnh, xuất ZIP
│   ├── watermark-engine.js # Bộ máy tính toán toán học & render canvas sắc nét
│   └── jszip.min.js      # Thư viện đóng gói ZIP offline
├── start.bat             # File nhấp đúp để mở ngay trên Windows
├── server.py             # Server nội bộ python (tùy chọn)
└── README.md             # Hướng dẫn chi tiết
```
