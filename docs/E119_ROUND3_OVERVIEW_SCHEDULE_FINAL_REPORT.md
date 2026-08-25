# E119 Round 3 · Overview Schedule Final

## Phạm vi
- Hoàn tất lượt 3: test sâu, dọn luồng cũ, khóa lại tab Tổng quan và nút **Lịch trình hôm nay**.
- Không dùng popup cũ E118/E117/E116 trong active `renderRouteModal()`.

## Thay đổi chính
1. Override cuối cùng `renderOverview()` bằng `e119-final-overview`.
2. Override cuối cùng `renderRouteModal()` bằng `e119-schedule-studio e119-final`.
3. Popup có 7 tab rõ ràng: Hôm nay, Lý thuyết, Bài tập, Ứng dụng, Mô phỏng, Ôn kiểm, Dữ liệu.
4. Thêm capture handler riêng cho `data-act=route-modal` và `data-act=open-today-route` để mở đúng popup cuối, không để handler cũ chen vào.
5. Override `afterRender()` sạch để không còn sửa nút thành nhãn cũ kiểu “NÊN BẤM TRƯỚC”.
6. Bổ sung CSS cho 7 tab, responsive và vùng cuộn riêng.
7. Cache bump lên `v=119`.

## Kiểm tra
- `node --check assets/core.js`: PASS.
- Static check active route: PASS.
- Static check overview final: PASS.
- Static check old popup classes inactive trong render cuối: PASS.
- Zip test: PASS.
