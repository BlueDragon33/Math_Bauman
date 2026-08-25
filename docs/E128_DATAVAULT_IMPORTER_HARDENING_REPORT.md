# E128 · DataVault Importer Hardening Report

Bản E128 vá các lỗi tester phát hiện trong E127.

## Điểm đã sửa

1. Dùng IndexedDB cho overlay/backup lớn thay vì lưu toàn bộ lessons vào localStorage.
2. Merge/Replace bắt buộc lesson đầy đủ 16 slide và đủ metadata `sourceChapterNo` 1–40, `sourceStageNo` 0–5.
3. Patch lesson đã có được phép sửa từng slide; patch thêm lesson mới phải đạt chuẩn merge.
4. Self-check E126 không còn khóa cứng đúng 347 lesson, cho phép `>=347`.
5. Self-check E128 không còn `|| true`; panel test là thật.
6. Rollback report tính `beforeCount` trước khi restore.
7. Export và rollback giữ nguyên phạm vi `DB.lessons`, không động các nguồn dữ liệu khác.

## Phạm vi an toàn

- Target duy nhất: `lessons.json` runtime / `DB.lessons`.
- Không sửa `formulas.json`, `exercises.json`, `simulations.json`, `question_bank.json`, `mindmap.json`.
- Không mở PhD Chương 41–56.
- Không rewrite `core.js`.

## Cách test thủ công

1. Mở `subjects/math/index.html` bằng Live Server.
2. Vào Tab Dữ liệu.
3. Kiểm panel `E128 · DataVault Importer Hardening` xuất hiện.
4. Dán template E128 ở `data/import_templates/bauman_math_theory_patch_template_E128.json`.
5. Test patch 1 slide của lesson đã có.
6. Reload để kiểm overlay còn giữ bằng IndexedDB.
7. Rollback và export.
