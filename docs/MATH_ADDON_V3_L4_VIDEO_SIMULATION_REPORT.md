# MATH ADD-ON V3 · Lượt 4 Video + Simulation Report

## Phạm vi
- Thêm `data/videos.json` cho kho video tích hợp.
- Thêm tab `Video` vào manifest và UI chung.
- Nâng tab `Ứng dụng` thành phòng mô phỏng thực nghiệm, không chỉ là danh sách lab.
- Giữ nguyên stage gate, kiểm tra, dữ liệu học thuật và background Toán ở lượt 3.

## Video
- 36 slot video theo 6 nhóm: Đại số tuyến tính, Giải tích nhiều biến, Xác suất - thống kê, Tối ưu hóa, Signal/AI, Luận văn/НИР-ВКР.
- Không dùng URL giả. Mỗi slot có `videoUrl`/`iframeUrl` trống để người dùng dán link sau.
- Mỗi video có `watchTask`, `artifact`, `linkedLessonIds`, `linkedConceptIds`, `stageId`, `partId`.

## Mô phỏng
- UI gom observation/practice/moduleLabs thành phòng mô phỏng.
- Mỗi mô phỏng hiển thị mục tiêu, tham số/bước làm, sản phẩm cần nộp.
- Không tạo fixed-height, không làm khuyết nội dung.

## Kiểm thử
- JSON parse OK.
- Manifest link OK.
- JS syntax OK.
- CSS append OK.
- Không xuất file ở lượt 4.
