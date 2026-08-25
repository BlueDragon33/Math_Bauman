# E119 Round 2 · Overview Total UI Build

Trạng thái: lượt 2 đã dựng giao diện và logic mới, chưa xuất file cuối.

## Đã làm

1. Override active `renderOverview()` bằng shell mới:
   - `e119-overview-shell`
   - `e119-hero-today`
   - `e119-today-command-card`
   - `e119-stage-card`
   - `e119-progress-strip`
   - `e119-quick-grid`
   - `e119-source-status`

2. Override active `renderRouteModal()` bằng Schedule Studio mới:
   - `e119-schedule-studio`
   - `e119-round2`
   - header, rail trái, deck phải, footer cố định
   - 5 tab: Hôm nay, Nội dung, Dữ liệu, Ôn kiểm, Lộ trình

3. Popup không còn dùng class active của các bản cũ:
   - `e118-schedule-root`
   - `e117-today-shell`
   - `e116-today-modal`
   - `e112-today-modal`
   - `e109-today-modal`
   - `e104-route-modal`
   - `e81-route-modal`
   - `e80-route-rich-restore`

4. Đã thêm logic click riêng:
   - `data-e119-route`: mở đúng view/tab/lessonId, set gate khi mở kiểm tra.
   - `data-e119-open`: mở đúng nguồn JSON trong tab Dữ liệu.

5. Đã thêm CSS mới:
   - Tổng quan mới dạng dashboard.
   - Popup mới full modal, có scroll riêng trong pane.
   - Responsive cho màn hình rộng, hẹp và mobile.

## Kiểm tra đã chạy

- `node --check assets/core.js`: PASS
- Static check latest `renderRouteModal()`: không chứa các class popup cũ.
- Static check latest `renderOverview()`: có `e119-overview-shell` và `e119-hero-today`.

## Chưa làm ở lượt 2

- Chưa xuất file.
- Chưa bump bản phát hành cuối.
- Chưa zip.
- Chưa chạy vòng test cuối toàn diện. Các việc này để lượt 3.
