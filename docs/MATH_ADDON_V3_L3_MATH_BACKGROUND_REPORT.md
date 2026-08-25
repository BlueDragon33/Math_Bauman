# Math Add-on V3 · Lượt 3 Background Report

## Phạm vi

Lượt 3 chỉ xử lý nền đặc trưng môn Toán, không xuất file và không thay đổi logic Stage Gate.

## Đã làm

- Giữ khung UX/UI chung: sidebar, topbar, view, panel/card.
- Thay toàn bộ `subject-theme.css` cũ bằng lớp nền Toán sạch hơn.
- Nền sáng có lưới tọa độ, ký hiệu ∇, Σ, λ, AᵀA, P(A|B), ∫f(t)dt ở mức mờ.
- Không dùng `bst-*` làm bố cục chính. Các selector còn lại chỉ là lớp tương thích.
- Thêm lớp nhấn riêng cho formula, proof, worked-example, mistake, application.
- Bổ sung font stack Toán an toàn: Cambria Math, STIX Two Math, Latin Modern Math, Times New Roman.
- Không thêm fixed-height hoặc overflow-hidden vào vùng học tập.

## Nguyên tắc giữ nguyên

- Kiểm tra chỉ mở từ Lịch hôm nay.
- Không mở khóa 7 ngày.
- Xong phần hiện tại mới mở phần tiếp theo.
- Đề 20/40/60/100, flag 4x5 và 5x5 giữ nguyên.

## Chưa làm

- Chưa thêm Video.
- Chưa nâng phòng mô phỏng thực nghiệm.
- Chưa xuất file.
