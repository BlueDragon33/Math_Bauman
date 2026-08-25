# E115 · Compact No-Code Storage UI

## Mục tiêu

Tinh gọn UX/UI Tab Dữ liệu của môn Toán. Màn hình chính không hiển thị code/JSON. Code chỉ xuất hiện khi người dùng bấm **Sửa** hoặc mở form chỉnh dữ liệu.

## Đã sửa

- Tab Dữ liệu chuyển sang giao diện quản trị gọn hơn.
- Ẩn toàn bộ preview JSON khỏi màn hình chính.
- Bỏ hiển thị đường dẫn dạng code trong thẻ Khung/Dữ liệu.
- Giữ đủ thao tác cho từng slot:
  - Chèn
  - Sửa
  - Xóa
  - Xuất
  - Form
- Nút **Sửa** vẫn mở hộp thoại JSON để chỉnh/thay nguồn.
- Nút **Form** vẫn xuất mẫu JSON để mở rộng nội dung mà không sửa main.
- Giữ đường dẫn logic:
  - Kho môn học
  - Học tập
  - Lý thuyết
  - Khung môn học / Dữ liệu môn học

## Kiểm tra kỹ thuật

- `core.js`: PASS `node --check`
- `subject-adapter.js`: PASS `node --check`
- JSON data: 48 file, 0 lỗi parse
- Màn hình chính: không gọi `preview114(src)` trong source panel E114

## Ghi chú

Đây là chỉnh UX/UI, không sinh thêm nội dung học thuật mới và không thay đổi cấu trúc dữ liệu lõi.
