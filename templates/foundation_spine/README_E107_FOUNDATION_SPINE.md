# E107 · Foundation Spine Reset

Bản này bỏ toàn bộ bài học active cũ. UI giữ khung e-learning, nhưng dữ liệu học liệu được làm lại từ đầu.

## Xương sống
- 40 chương từ hiện tại đến tốt nghiệp thạc sĩ.
- 16 chương mở rộng tiến sĩ.
- Tổng 56 chương trong `data/chapter_spine.json`.

## Cách phát triển
1. Chọn 1 chương trong `chapter_spine.json`.
2. Dùng `chapter_to_lesson_breakdown_template.json` để chia chương thành 6–8 bài.
3. Sau khi khóa lessonId, dùng DataVault Bundles để tạo từng nguồn: lessons, formulas, simulations, exercises, applications, professor_qa, question_bank.
4. Import vào Kho môn học, kiểm UI, xuất nguồn.

## Quy tắc
Không tự ý dùng lại 260 bài cũ. Không để UI đoán chương bằng keyword. Không làm toàn bộ lý thuyết trong một lượt.
