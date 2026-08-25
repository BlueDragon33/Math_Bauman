# E118 · Total Schedule Popup Rebuild

Đã gỡ active UI popup cũ của nút **Lịch trình hôm nay** và thay bằng giao diện mới hoàn toàn.

## Thay đổi
- `renderRouteModal()` được override cuối file bằng shell mới `.e118-schedule-root`.
- Không còn active output của các popup cũ trong luồng mở nút: `e80-route-rich-restore`, `e81-route-modal`, `e104-route-modal`, `e117-today-shell`.
- Giao diện mới chia thành 4 khoang:
  - Buổi học: 7 chặng mở từng phần.
  - Nội dung: 13 cụm dữ liệu Khung / Nội dung / Legacy.
  - Ôn kiểm: ôn lỗi, câu hỏi nhanh, kiểm tra 20 câu, mind map.
  - Lộ trình: hôm nay, tuần này, Việt Nam, dự bị, Bauman, NIR/VKR.
- Từng khoang có vùng cuộn riêng để không cắt nội dung quan trọng.
- Cache bump lên `v=118`.

## Kiểm tra
- `node --check assets/core.js`
- `BAUMAN_MATH_E118_SELF_CHECK()` kiểm tra active popup không còn class/string popup cũ.
