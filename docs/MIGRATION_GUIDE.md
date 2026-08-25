# Migration Guide

1. Clone `_template` thành thư mục môn mới.
2. Đổi `subject-manifest.json` và `subject-theme.css`.
3. Chuyển dữ liệu môn vào schema mới.
4. Viết adapter môn học nếu có công thức, code, mô hình, dataset hoặc research artifact.
5. Chạy `node tools/validate-data.js` và `node tools/validate-links.js`.
