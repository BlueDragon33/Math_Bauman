# E117 - Rebuilt Today Schedule Popup

## Phạm vi
- Bỏ giao diện popup lịch trình cũ trong luồng hiển thị đang hoạt động.
- Dựng mới `renderRouteModal()` bằng shell E117 hoàn toàn mới.
- Popup mới dùng bố cục command center: header, sidebar trọng tâm, cụm tab dọc và vùng pane cuộn riêng.

## Thiết kế mới
- Tab Luồng học: 6 chặng dạng accordion, mở từng chặng.
- Tab Nguồn dữ liệu: 13 cụm nguồn, mỗi cụm có Khung, Nội dung, Legacy.
- Tab Ôn kiểm: tách ôn tập, ngân hàng câu hỏi, blueprint đề, mind map.
- Tab Mở nhanh: đi thẳng vào Lý thuyết, Bài tập, Ứng dụng, Mô phỏng, Vấn đáp, Công thức.

## Chống mất nội dung
- Modal dùng chiều cao gần toàn màn hình.
- Nội dung chính chia pane riêng, mỗi pane tự cuộn.
- Không ép hiển thị toàn bộ bảng dài trong một lần.
- Responsive cho màn hẹp và mobile.

## Kiểm tra
- `node --check assets/core.js`: PASS.
- Active modal self-check: E117, không còn class popup cũ E116/E109/E104 trong output active.
