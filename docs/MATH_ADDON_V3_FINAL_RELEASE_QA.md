# Math Add-on V3 Final Release QA

Ngày đóng gói: 2026-06-11 16:55:17

## Phạm vi

Gói này chỉ chứa `subjects/math` để copy đè vào thư mục `subjects` của Main. Không kèm Main, không kèm template chung, không kèm legacy.

## Điểm chốt cuối

- UX/UI dùng khung chung hệ thống, không tách kiểu riêng.
- Background Toán riêng: lưới tọa độ, vector, ma trận, ký hiệu Toán nhẹ.
- Có Video tích hợp qua `data/videos.json` với 36 slot.
- Có phòng mô phỏng thực nghiệm qua `data/simulations.json` và `data/applications.json`.
- Font/render công thức dùng stack an toàn, không nhúng font file, không phụ thuộc thư viện ngoài.
- Stage Gate giữ nguyên: học → ôn → kiểm tra từ Lịch hôm nay → mở phần/giai đoạn.
- Đề 20/40/60/100 giữ tỷ lệ 30/30/20/20, flag 4×5 và 5×5.

## Số liệu dữ liệu

- 72 bài học.
- 87 concept.
- 61 công thức/mẫu toán.
- 432 bài tập.
- 360 câu ôn tập/remediation.
- 2200 câu kiểm tra.
- 24 lab ứng dụng.
- 36 mô phỏng.
- 36 slot video.
- 7 project.

## Cách dùng

Giải nén zip, copy thư mục `subjects/math` trong gói này đè lên `subjects/math` của Main. Nên sao lưu thư mục Toán cũ trước khi đè.
