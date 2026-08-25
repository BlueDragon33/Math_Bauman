# L2 · Standalone Web App & PWA checkpoint

Trạng thái: **PASS**

## Phạm vi đã khóa

- Web App độc lập tại `index.html`, không phụ thuộc đường dẫn repo cha.
- Giữ nguyên 347 legacy lesson, 18 theory overlay và 56 chapter frame.
- Route chính `Học tập → Lý thuyết` giữ quyền render E129 sau các core render muộn.
- Luồng E186 mở được C03 và đủ 6 overlay theo `chapterId` chuẩn.
- E129 dedupe hai view của frame về đúng 56 chương theo `chapterId`.
- PWA shell, Service Worker versioned, mobile 390 px và controlled offline reload.

## Bằng chứng

- Nhánh: `migration/full-webapp-v2`.
- GitHub Actions run: `32835461390`.
- Commit remote được kiểm: `5a136dabe53cb65fc2ebba109e8f3f641ad1660b`.
- `static-gate`: PASS.
- `browser-gate`: PASS, 14/14.
- Browser artifact: `9558419819` (`math-webapp-browser-smoke`).

Các check trình duyệt đã PASS: online boot, 347 lesson, 18 overlay, primary navigation, accessible ready state, clean visible text, route Học tập, 56 frame runtime, E129 route ownership, C03 canonical route, mobile layout, PWA controller, offline reload và runtime errors.

## Lỗi phát hiện và đã sửa trong gate

1. Primary navigation chưa route vào canonical core state.
2. Core renderer chưa handoff sang E129.
3. Test cũ bấm sidebar ẩn thay vì flow E186 visible.
4. Core render muộn ghi đè bề mặt E129.
5. Frame bị đếm đôi thành 112 vì có cả `stages[]` và `chapters[]`.
6. Offline regression kiểm tra trước khi dữ liệu hoàn tất tải.

`main` không bị sửa hoặc merge trong checkpoint này.
