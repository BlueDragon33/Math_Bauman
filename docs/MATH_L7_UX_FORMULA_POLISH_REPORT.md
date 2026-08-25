# MATH L7 · UX/UI và render công thức

## Mục tiêu
- Giữ nguyên lõi stage gate, không mở kiểm tra tự do.
- Làm lại bố cục tab Học tập, Thực hành, Ôn tập, Kiểm tra, Ứng dụng, Dữ liệu.
- Tạo renderer công thức an toàn, không phụ thuộc CDN, không gây lỗi `renderFormula is not defined`.
- Không dùng fixed-height/overflow hidden làm khuyết nội dung.

## Thay đổi chính
- `index.html`: đổi title và `data-subject` sang `math`.
- `core-subject.js`: thêm render thực cho learning/practice/review/projects/resources/storage.
- `subject-adapter.js`: đồng bộ `BAUMAN_SUBJECT_ADAPTER` và `BaumanSubjectAdapter`.
- `core-subject.css`: thêm layout bài giảng Toán, formula block, proof block, example block, mistake block, application block.
- `subject-theme.css`: thêm lớp polish theo màu xanh/tím sáng.

## Nguyên tắc giữ nguyên
- Kiểm tra chỉ mở từ Lịch hôm nay.
- Không có mở khóa 7 ngày.
- Hoàn thành phần hiện tại mới mở phần tiếp theo.
- 20/40/60 dùng 4x5; 100 dùng 5x5.

## Trạng thái
Lượt 7 đã hoàn thành, chưa xuất file.
