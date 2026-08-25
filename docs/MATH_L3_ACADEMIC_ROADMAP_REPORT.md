# MATH L3 ACADEMIC ROADMAP REPORT

Ngày tạo: 2026-06-11 15:43 UTC

## Mục tiêu lượt 3

Lượt 3 không xuất file. Mục tiêu là dựng lộ trình học thuật môn Toán trên nền Template V1 và cấu trúc Toán V2, để các lượt sau phình nội dung có trục rõ ràng, không học cưỡi ngựa xem hoa.

## Kết quả chính

- Tạo `data/academic-roadmap.json`.
- Thêm 6 khối học thuật: Toán nền tảng, Đại số tuyến tính, Giải tích nhiều biến, Xác suất - thống kê, Tối ưu hóa, Toán cho AI/Signal/Research.
- Gắn `academicBlockId` cho toàn bộ module.
- Sắp lại từng `stagePart` bằng tiêu đề học thuật cụ thể, chu kỳ học sâu và bằng chứng bắt buộc.
- Sửa HK4 từ 1 module lặp 4 phần thành 4 module riêng:
  - `m_m401`: Metric và diễn giải luận văn.
  - `m_m402`: Mô hình hóa toán học cho dữ liệu luận văn.
  - `m_m403`: Phân tích kết quả, sai số và độ tin cậy mô hình.
  - `m_m404`: Phụ lục công thức và lập luận bảo vệ luận văn.
- Thêm skeleton bài học HK4 mới để stage gate không trỏ lặp vào cùng một nội dung.
- Cập nhật manifest để nhận diện `academic-roadmap.json`.

## Chuỗi học sâu chuẩn

1. Khái niệm → công thức → trực giác/chứng minh ngắn.
2. Ví dụ mẫu → tự giải lại → kiểm tra ý nghĩa kết quả.
3. Bài tập phân tầng → ghi lỗi sai theo concept.
4. Ứng dụng AI/Signal/UGV/USV → artifact học tập.
5. Ôn tập bắt buộc → kiểm tra từ Lịch hôm nay → mở phần tiếp theo.

## Điều còn để lượt sau

- Lượt 4: phình sâu nội dung bài học, công thức, chứng minh, ví dụ mẫu, lỗi thường gặp.
- Lượt 5: tạo bài tập, ôn tập và ngân hàng kiểm tra đủ 20/40/60/100.
- Lượt 6: mô phỏng và ứng dụng thực tế.
- Lượt 7: UX/UI và render công thức.
- Lượt 8: kiểm thử toàn diện.
- Lượt 9: xuất file.
