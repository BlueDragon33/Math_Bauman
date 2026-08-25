# E104 · E-learning UI Framework

Mục tiêu: giữ hệ thống như một khung e-learning đọc nội dung từ Kho môn học.

## Nguyên tắc

- UI/UX là lớp trình bày và điều hướng.
- Nội dung học thuật được nạp bằng JSON theo slot: lessons, formulas, simulations, exercises, applications, professor_qa, review/question.
- Không viết học liệu trực tiếp vào core.js.
- Mỗi luồng học bám một khóa duy nhất: `lessonId`.

## Luồng dùng

1. Viết học liệu bằng Authoring Bundle.
2. Audit học thuật.
3. Xuất JSON đúng template.
4. Vào Kho môn học và nhập vào nguồn tương ứng.
5. Kiểm lại trên UI.

## Thành phần UI chính

- Tổng quan: dashboard e-learning.
- Học tập: cây Khoa → Bộ môn → Chương → Bài, reader trung tâm, dock bên phải.
- Mô phỏng: lab unified theo lessonId.
- Kho môn học: data backend pipeline.
- Lịch trình hôm nay: modal điều hướng theo một lessonId.
