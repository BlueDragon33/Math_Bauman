# E116 Today Schedule Pro Cleanup

## Đã sửa
- Gỡ khối nội dung cũ trong popup Lịch trình hôm nay: không còn các thẻ "Đầu ra bắt buộc", "Luật học hôm nay", "Tuần này", "Toàn bộ lộ trình".
- Popup mới chỉ giữ bảng chặng học thao tác trực tiếp: Lý thuyết, Bài tập, Ứng dụng, Mô phỏng, Công thức, Ôn tập, Kiểm tra.
- Nút Lịch trình hôm nay được làm lại dạng CTA nổi bật, có icon, nhãn phụ và trạng thái ưu tiên.
- Bổ sung self-check `BAUMAN_MATH_E116_SELF_CHECK()` để kiểm tra không còn marker E80 cũ trong modal.

## Kiểm thử nhanh
- `node --check assets/core.js` phải pass.
- Bấm nút Lịch trình hôm nay trên Tổng quan mở modal `.e116-today-modal`.
- Bấm từng chặng trong modal phải tự đóng popup và điều hướng đúng tab.
