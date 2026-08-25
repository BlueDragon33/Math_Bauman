# E116 · Luxury Schedule Popup Report

## Mục tiêu
Sửa toàn bộ UX/UI popup khi bấm nút **Lịch trình hôm nay** trong tab Tổng quan. Trọng tâm là giao diện sang trọng, không hiển thị thiếu nội dung, không bắt buộc phơi toàn bộ nội dung cùng lúc.

## Thay đổi chính
- Thay popup bảng dài E112 bằng popup E116 dạng **buồng lái học tập**.
- Chia nội dung thành 4 tab:
  1. Nhịp học
  2. Nguồn dữ liệu
  3. Ôn tập/Kiểm tra
  4. Mở nhanh
- Dùng accordion cho các chặng học để mở lần lượt, giảm chật màn hình.
- Tách 13 khối dữ liệu thành cards có Khung/Nội dung/Legacy rõ ràng.
- Giữ nút mở nguồn hoạt động qua `data-e112-open-storage`, popup tự đóng và chuyển đúng file trong tab Dữ liệu.
- Khóa kích thước modal route theo viewport, `overflow:hidden` ở khung ngoài và `overflow:auto` ở vùng nội dung để tránh bị cắt.
- Bump cache query lên `v=116` trong `index.html`.

## File sửa
- `subjects/math/assets/core.js`
- `subjects/math/assets/core.css`
- `subjects/math/index.html`

## Kiểm tra nhanh
- `node --check subjects/math/assets/core.js`: PASS.
- Self-check mới: `BAUMAN_MATH_FINAL_SELF_CHECK()` trả về patch `E116_LUXURY_TABBED_TODAY_SCHEDULE` khi chạy trong trình duyệt.
