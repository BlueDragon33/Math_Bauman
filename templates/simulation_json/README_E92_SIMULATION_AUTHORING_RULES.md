# E92 Simulation Authoring Rules

Mô phỏng phải khóa theo bài lý thuyết thật trong `subjects/math/data/lessons.json`.

- `lessonId` phải là ID thật.
- `lessonTitle` phải là tên bài thật.
- `sourceLessonId` chỉ dùng để tham chiếu, không dùng làm khóa import.
- Mỗi bài đúng 1 `simulation` unified.
- Nếu tạo pack theo chương, pack phải thuộc một `departmentId` + một `chapterId`; gói liên chương chỉ dùng cho enrichment có chủ đích và phải ghi `packScope: cross_chapter_enrichment`.
- Controls phải là slider số đơn, không dùng default dạng mảng nếu renderer chưa hỗ trợ vector.
