# E120 Overview Schedule Cleanup

Đã làm sạch kiến trúc tab Tổng quan và lịch hôm nay.

- Dựng một popup Schedule Studio duy nhất: E120.
- Tab Tổng quan dùng renderer E120 clean.
- Loại bỏ các lớp popup thử nghiệm cũ khỏi luồng cuối.
- Nút Lịch trình hôm nay được bắt bằng handler E120 riêng, không bị handler cũ chen vào.
- CSS popup cũ được lọc khỏi file giao diện, CSS E120 được viết lại độc lập.
- Cache nâng lên v=120.

Checklist: node syntax, static old-active scan, zip integrity.
