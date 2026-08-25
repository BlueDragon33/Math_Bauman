# E108 · Stage Discipline Spine

Bản này giữ khung e-learning sạch nhưng tách **khung học thuật** khỏi **học liệu nội dung**.

## Kiến trúc

```text
UI shell / core.js
→ đọc data/discipline_spine.json
→ đọc data/chapter_spine.json
→ hiển thị Giai đoạn → Phân môn → Chương
→ học liệu chi tiết nhập riêng qua Kho môn học
```

## Quy tắc

- Muốn đổi khung phân môn/chương: sửa hoặc thay `discipline_spine.json` và `chapter_spine.json`.
- Không nhúng bài giảng vào `chapter_spine.json`.
- Bài giảng, công thức, mô phỏng, bài tập, ứng dụng, vấn đáp, kiểm tra nằm ở các file dữ liệu riêng.
- Nội dung mới phải tham chiếu `stageId`, `disciplineId`, `chapterId`, `lessonId`.

## Lý do chọn cách này

Cách này nhanh hơn hard-code vào UI, nhưng không khóa chết hệ thống. Khung vẫn nằm trong file môn Toán để mở ra thấy ngay, còn học liệu vẫn đi theo đường DataVault.
