# Bauman Math Theory Tab · E125 Visual Skin

Gói này nâng cấp E124 bằng lớp giao diện **Visual Skin** cho Tab Lý thuyết.

## Có gì mới

- `theory_tab_demo_E125.html`: bản xem thử giao diện Tab Lý thuyết.
- `assets/theory_skin/theory-skin-E125.css`: CSS giao diện kính, card, sidebar, role slide.
- `assets/theory_skin/theory-renderer-E125.js`: renderer đọc `lessons.json` và dựng UI.
- `assets/theory_skin/theme_tokens_E125.json`: design token để tái dùng.
- `assets/theory_skin/CANVA_STYLE_GUIDE_E125.md`: hướng dẫn tạo mockup Canva cùng phong cách.
- `assets/theory_skin/integration_snippet_E125.js`: đoạn tích hợp nhanh vào module.

## Không thay đổi

- Không sửa logic học thuật trong từng lesson.
- Không tạo/sửa `formulas.json`, `simulations.json`, `exercises.json`, `question_bank.json`, `mindmap.json`.
- Không mở phần PhD 41–56.
- Không sửa core UI cũ, chỉ thêm skin và demo.

## Cách xem nhanh

Mở thư mục bằng Live Server, rồi mở:

```text
theory_tab_demo_E125.html
```

Nếu mở trực tiếp bằng `file://`, trình duyệt có thể chặn `fetch('lessons.json')`. Khi đó dùng VS Code Live Server.

## Cách tích hợp vào module Toán

1. Copy `lessons.json` vào nguồn dữ liệu Tab Lý thuyết.
2. Copy thư mục `assets/theory_skin/` vào module.
3. Nạp CSS/JS theo `integration_snippet_E125.js`.
4. Gọi:

```js
BaumanTheorySkin.init(lessonsJsonObject);
```

## Kiểm định

- Lessons: 347
- Slides: 5552
- Slides/lesson: 16
- Active chapters: 40
- PhD generated: 0
