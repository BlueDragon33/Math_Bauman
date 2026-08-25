# E123 · JSON Import Audit Center

Đã nâng cấp tab Dữ liệu để thao tác Chèn JSON có báo cáo rõ ràng.

## Mục tiêu

- Chèn JSON vào đúng slot Khung/Dữ liệu.
- Báo nguồn đã chèn, file, số mục trước/sau, số mục thêm/cập nhật/bỏ qua.
- Báo lỗi theo path như `chapters[0].chapterTitle` hoặc `records[3].lessonId`.
- Nhận dạng `lesson_framework.json` / `bauman.math.chapter_spine.v2.1` là khung lý thuyết và đưa vào `theory_lecture_frame.json`.
- Giữ khung tiến sĩ ở trạng thái khóa riêng, không đưa vào nội dung học active.

## Luồng chèn

1. Mở Dữ liệu → Học tập → Lý thuyết.
2. Chọn ô Khung môn học nếu chèn `lesson_framework.json`.
3. Bấm Chèn JSON hoặc Dán JSON.
4. Đọc báo cáo trên đầu tab Dữ liệu.

## Kiểm tra

- node --check assets/core.js: PASS khi xuất bản.
- node --check assets/subject-adapter.js: PASS khi xuất bản.
- node --check assets/planning-bridge.js: PASS khi xuất bản.
