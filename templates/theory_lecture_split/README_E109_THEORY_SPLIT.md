# E109 · Bài giảng lý thuyết tách khung/nội dung

## Nguyên tắc

- `data/theory_lecture_frame.json`: chỉ chứa khung giai đoạn → phân môn → chương.
- `data/theory_lecture_content.json`: chỉ chứa nội dung bài giảng/slide theo `lessonId` và `chapterId`.
- UI tab Lý thuyết đọc cả hai file: khung tạo cây, nội dung đổ vào vùng đọc.

## Quy trình

1. Sửa/đổi khung: thay `theory_lecture_frame.json`.
2. Viết bài giảng: tạo record trong `theory_lecture_content.json`.
3. Import từng file qua Kho môn học → nhóm `Bài giảng lý thuyết`.
4. Không sửa `core.js` khi chỉ đổi khung/nội dung, miễn schema giữ nguyên.
