# E114 · Bauman Math Specialized Data Vault Router

Đã nâng cấp file môn Toán để tích hợp khung và quản lý nội dung qua Tab Dữ liệu theo đường:

```text
Kho môn học
→ Học tập
→ Lý thuyết / Bài tập / Ứng dụng / Ôn tập / Kiểm tra / Blueprint kiểm tra
→ Khung môn học / Dữ liệu môn học
```

## Các thao tác có trong từng slot

- Chèn: nhập JSON và thay thế nội dung cũ của nguồn đang chọn.
- Sửa: mở trình sửa JSON trực tiếp.
- Xóa: xóa dữ liệu hiện tại trong bộ nhớ trình duyệt của module.
- Xuất: xuất file JSON đã chèn/sửa.
- Form: xuất file mẫu để mở rộng thêm mà không cần sửa main.

## Trạng thái khung

- Chương 1–40: active Bauman core từ tháng 8/2026 tới VKR/tốt nghiệp.
- Chương 41–56: giữ làm khung tiến sĩ khóa, không sinh nội dung.
- `content_vault_manifest.json` đã có `e114NavigationContract`.

## File runtime đã sửa

- `subjects/math/assets/core.js`
- `subjects/math/assets/core.css`
- `subjects/math/assets/subject-adapter.js`
- `subjects/math/data/chapter_spine.json`
- các file `*_frame.json`
- `subjects/math/data/content_vault_manifest.json`

## Kiểm tra dự kiến trong trình duyệt

Mở console và chạy:

```js
BAUMAN_MATH_E114_SELF_CHECK()
```

Kỳ vọng: `ok: true`.
