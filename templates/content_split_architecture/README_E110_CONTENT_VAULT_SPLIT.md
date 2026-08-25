# E110 · Content Vault Split Architecture

Từ E110, không chỉ `Bài giảng lý thuyết` mà mọi nguồn nội dung chính đều tách thành hai file:

```text
*_frame.json   = khung, phân loại, luật tìm kiếm/thay thế
*_content.json = nội dung chi tiết, records để import/export
```

Nguyên tắc: UI là máy đọc. Khung là bản đồ. Nội dung là hàng hóa được nhập qua Kho môn học.

## Nguồn chính

- theory_lecture_frame/content
- formula_frame/content
- simulation_frame/content
- exercise_frame/content
- application_frame/content
- professor_qa_frame/content
- review_pack_frame/content
- question_bank_frame/content
- test_blueprint_frame/content
- chapter_lecture_frame/content
- mindmap_frame/content
- concept_map_frame/content
- media_frame/content

## Legacy

Các file cũ như `formulas.json`, `simulations.json`, `exercises.json` vẫn giữ để tương thích, nhưng khi xây học liệu mới nên nhập vào file `*_content.json` tương ứng.
