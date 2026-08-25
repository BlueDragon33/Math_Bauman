# MATH ADD-ON V3 · Lượt 5 · Formula Font & Render QA

## Mục tiêu
- Gia cố font công thức cho môn Toán mà không nhúng hoặc chia sẻ file font.
- Bảo đảm công thức luôn hiển thị bằng font stack hệ thống: Cambria Math, STIX Two Math, Latin Modern Math, Noto Serif Math, Times New Roman.
- Không phụ thuộc MathJax/KaTeX hoặc hàm renderFormula bên ngoài.
- Công thức dài được phép cuộn ngang nội bộ, không làm vỡ bố cục và không cắt nội dung chính.

## Thay đổi
- Cập nhật `subject-adapter.js` với `renderFormulaSafe()` và `normalizeMathText()`.
- Bổ sung CSS lớp `math-safe-formula`, `math-display-line`, `math-source-line`, `math-inline`.
- Dùng `@font-face` chỉ tham chiếu font cục bộ bằng `local(...)`, không đóng gói font file.
- Giữ nguyên UX chung, background Toán, video, mô phỏng và stage gate.

## Kết quả
- `window.renderFormula` có fallback an toàn.
- Công thức có dòng hiển thị dễ đọc và dòng nguồn LaTeX nhỏ để kiểm tra.
- Công thức dài không khóa chiều cao nội dung và không gây overflow toàn trang.

## Chưa xuất file
Lượt 5 chỉ sửa và kiểm thử. File add-on chỉ xuất ở lượt 6 sau khi tinh gọn UX/UI lần cuối.
