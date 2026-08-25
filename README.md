# Math Bauman Web App

Ứng dụng học Toán độc lập cho lộ trình Bauman ИУ-5, tập trung vào nền tảng
Toán cho AI, xử lý tín hiệu, điều khiển, НИР và ВКР.

Nhánh phát triển hiện tại: `migration/full-webapp-v2`. Không merge `main` cho
đến khi các gate tương ứng có bằng chứng CI thực tế.

## Chạy ứng dụng

Ứng dụng dùng đường dẫn tương đối và cần được phục vụ qua HTTP để Service
Worker/PWA hoạt động:

```bash
python3 -m http.server 4173
```

Sau đó mở `http://127.0.0.1:4173/`.

## Kiểm tra

```bash
npm install
npm run audit
npm run test:browser
```

- `audit`: kiểm deterministic 347 bài legacy, 18 theory overlay, 56 chương,
  ID/stage/path, PWA shell và nhãn giao diện.
- `test:browser`: chạy Chromium thật ở desktop/mobile, mở C03 và regression
  offline bằng Service Worker.
- Workflow CI: `.github/workflows/math-webapp-quality.yml`.

## Kiến trúc hiện tại

- `index.html`: Web App shell duy nhất.
- `assets/core.js`: runtime tương thích đầy đủ của Math_Bauman cũ.
- `assets/theory_skin/`: theory reader/overlay mới nhập có kiểm soát.
- `assets/platform/`: storage adapter độc lập khỏi repo nguồn.
- `data/lessons.json`: 347 bài legacy, giữ nguyên ID.
- `data/theory_lecture_content.json`: 18 overlay học thuật, tách ID với legacy.
- `data/theory_lecture_frame.json`: khung 56 chương.
- `service-worker.js`: PWA shell cache có version.

Các nguồn `formulas`, `exercises`, `applications`, `simulations`,
`question_bank`, `review_packs`, `test_blueprints`, `professor_qa` và `mindmap`
đang còn là source shell rỗng trong snapshot mới. Chúng được công khai là
khoảng trống và nằm trong các lượt nội dung tiếp theo; không được tính là đã
hoàn thiện chỉ vì UI có tab tương ứng.

Master plan và gate chi tiết nằm tại
[`docs/MIGRATION_MASTER_PLAN.md`](docs/MIGRATION_MASTER_PLAN.md).
