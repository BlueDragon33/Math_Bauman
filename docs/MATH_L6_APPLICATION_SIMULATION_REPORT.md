# MATH L6 APPLICATION & SIMULATION REPORT

Ngày tạo: 2026-06-11 16:00

## Mục tiêu lượt 6

Biến môn Toán từ kho bài học/công thức thành hệ học tập có mô phỏng, ứng dụng AI/Signal/UGV-USV và artifact phục vụ НИР/ВКР.

## Kết quả chính

| Hạng mục | Số lượng |
|---|---:|
| Application lab theo module | 24 |
| Mô phỏng quan sát theo khối | 6 |
| Mô phỏng thực hành theo khối | 6 |
| Mini-lab theo module | 24 |
| Project ứng dụng | 7 |
| Bài học được gắn applicationLab/simulation | 72 |

## Quy tắc học sâu

- Mỗi module phải có ít nhất một lab ứng dụng.
- Lab phải nối với lessonIds, conceptIds, simulationId và projectId.
- Trước khi mở kiểm tra, lịch nên xác nhận có artifact ứng dụng hoặc simulation log trong phần hiện tại.
- Nếu sai câu ứng dụng, hệ thống quay về lab + lesson/concept liên quan, rồi mới kiểm tra lại từ Lịch hôm nay.

## Các track ứng dụng

- **foundation_math_to_engineering**: Đọc đề kỹ thuật, nhận diện biến, giả thiết và kết luận trước khi tính. Artifact: sổ ký hiệu + bảng lỗi biến đổi + lời giải có diễn giải
- **ugv_feature_geometry**: Dữ liệu cảm biến được biểu diễn thành vector/ma trận để đo tương đồng, chiếu và giảm chiều. Artifact: notebook vector/ma trận + sơ đồ hình học + bảng giải thích feature
- **loss_surface_and_gradient**: Một hàm lỗi phụ thuộc nhiều biến được khảo sát bằng gradient/Jacobian/Hessian. Artifact: notebook gradient + ảnh mặt lỗi + ghi chú chọn learning rate
- **sensor_uncertainty_statistics**: Nhiễu cảm biến và mẫu đo được đánh giá bằng Bayes, kỳ vọng, phương sai và khoảng tin cậy. Artifact: bảng thống kê mẫu + kết luận độ tin cậy + cảnh báo sai lệch
- **model_training_and_regularization**: Loss function, regularization và ràng buộc được dùng để chọn nghiệm thực dụng thay vì nghiệm đẹp trên giấy. Artifact: bảng so sánh loss/metric + nhận xét overfit/underfit
- **signal_ai_thesis_metrics**: Chuỗi thời gian telemetry, metric dự báo, anomaly score và bảng kết quả luận văn được mô hình hóa bằng toán. Artifact: pipeline metric + bảng kết quả + phụ lục công thức bảo vệ

## Lượt tiếp theo

Lượt 7 sẽ tinh chỉnh UX/UI, render công thức và bố cục tab Học tập/Thực hành/Ứng dụng/Dữ liệu, không khóa chiều cao nội dung và không phá stage gate.
