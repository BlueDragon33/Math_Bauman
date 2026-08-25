# Bauman Math · Unified Simulation JSON Template

Mục đích: tạo file JSON riêng cho mô phỏng từng chương, trong đó mỗi ý nhỏ của chương là một `miniLesson` và mỗi `miniLesson` có đúng một mô phỏng `unified`.

## Quy tắc quan trọng

1. Một bài nhỏ = một `lessonId` = một mô phỏng unified.
2. Không dùng lại nhánh cũ `Mô phỏng lý thuyết` / `Mô phỏng ứng dụng`.
3. `simulation.file` luôn là `simulations/unified_lab.html`.
4. Khi tích hợp vào `subjects/math/data/simulations.json`, dùng `lessonId` làm khóa để replace/insert.
5. Mỗi bài phải có visual, controls, readouts, scenarios, runProtocol, decisionRule và commonMisreadings riêng. Không copy chung một lab cho cả chương.

## Cấu trúc file

- `chapter_simulation_pack_template.json`: form trống để nhân bản.
- `chapter_01_vector_sample.json`: ví dụ đã điền một phần cho Chương 1.
- `chapter_simulation_pack_schema.json`: JSON Schema để kiểm tra cấu trúc.

## Tích hợp sau khi bạn điền

Khi bạn tạo xong file chương, gửi lại cho tôi. Tôi sẽ:

1. validate JSON;
2. map từng `miniLesson[].simulation` sang format runtime trong `simulations.json`;
3. kiểm trùng `lessonId` / `simulation.id`;
4. replace đúng bài tương ứng;
5. kiểm lại tab Mô phỏng để nội dung đổi rõ theo từng chương/bài.
