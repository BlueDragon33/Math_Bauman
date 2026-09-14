# Math_Bauman

Site môn **Toán Bauman** độc lập trong hệ sinh thái Bauman Master AI.

Repo này giữ nội dung và runtime môn Toán riêng để có thể phát triển, kiểm thử và triển khai độc lập với Bauman Hub, đồng thời vẫn liên kết về lộ trình học tổng thể.

## Nội dung hiện có

- `index.html` — entry của site môn học;
- `editor.html` — bề mặt chỉnh sửa nội dung;
- `subject-manifest.js/json` — manifest cấu trúc môn học;
- `data/` — dữ liệu học tập;
- `simulations/` — mô phỏng phục vụ bài học;
- `assets/` — tài nguyên giao diện/nội dung;
- `docs/` — tài liệu dự án.

## Vai trò kiến trúc

```text
Application Management
        ↓
Bauman Master AI Hub
        ↓
Math_Bauman
```

`Math_Bauman` sở hữu source và dữ liệu môn Toán của chính nó. Bauman Hub đóng vai trò điều phối lộ trình; Application Management chỉ quản lý trạng thái dự án/contract cần thiết và không sao chép dữ liệu môn học vào control-plane.

## Nguyên tắc

1. Giữ site môn Toán độc lập để dễ phát triển và kiểm thử.
2. Không gộp source trở lại Hub chỉ để đơn giản hóa triển khai.
3. Mọi contract quản trị từ xa phải được công bố rõ trước khi bật nút điều khiển trong Application Management.
4. Nội dung legacy chỉ được nhập khi đã xác định nguồn và tránh tạo bản sao trùng lặp.
5. Repo được theo dõi trong danh mục dự án GitHub của `BlueDragon33/Application-Management` để không bị thất lạc khỏi hệ thống quản lý chung.
