# L3 · Data contracts and content catalog checkpoint

Trạng thái: **PASS**

## Phạm vi đã khóa

- Manifest standalone có JSON Schema cục bộ và browser artifact được sinh tự động.
- Program identity phân biệt mã công bố chính thức `09.04.01` với mã hiển thị cá nhân hóa `09.04.01/11`.
- Catalog khai đúng số liệu thực: 347 legacy lesson, 18 theory overlay, 56 canonical chapter và 13 Content Vault domain.
- Sửa toàn bộ active manifest path từ `subjects/math/data/...` sang `data/...`.
- Sửa metadata sai: theory overlay có 18 record; các content bank rỗng khai đúng 0 thay vì 18.
- Migration dry-run tạo 365 runtime key có namespace, không sửa source record và không collision.
- Service Worker L3 precache program identity, namespace registry và các manifest/canonical spine cần thiết.

## Bằng chứng

- Nhánh: `migration/full-webapp-v2`.
- Commit remote được kiểm: `aa9d19514f63096168b17822757f981d04f1357e`.
- Local/remote tree: `1a1d276c70295ff8e81021d9aac043e1a2177ba3`.
- GitHub Actions run: `32836910247`.
- `static-gate`: PASS — source preservation 15/15; data contract 27/27.
- `browser-gate`: PASS — 14/14 desktop/mobile/PWA/offline.
- Browser artifact: `9558978104` (`math-webapp-browser-smoke`).

## Khoảng trống audit phát hiện và đã đưa vào kế hoạch

- Vocab, grammar, speaking, dialogue, deep-speaking, writing và videos còn dùng nhiều lesson/chapter/module reference thuộc namespace lịch sử.
- Không viết lại các ID này. L5 được tăng từ 8 lên 10 bước để tạo mapping registry có provenance/rollback và regression toàn bộ support cross-link.
- Chín primary learning bank đang thực sự rỗng tiếp tục được công bố rõ và xử lý tuần tự ở L6–L9.

`main` không bị sửa hoặc merge trong checkpoint này.
