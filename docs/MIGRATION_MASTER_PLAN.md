# Math Bauman Web App V2 · Master Plan

Nhánh làm việc: `migration/full-webapp-v2`. `main` chỉ được cập nhật sau khi
toàn bộ gate tương ứng có bằng chứng test/CI.

Quy mô sau audit: **15 lượt · 128 bước**. Kế hoạch có thể tăng khi audit chất
lượng học liệu phát hiện khoảng trống cần thiết; không giảm chuẩn để giữ số bước.

## Lượt 1 · Source audit, preservation and rollback · 8 bước

1. Khóa commit gốc của `Math_Bauman` làm rollback baseline.
2. Đọc cây nguồn `subjects/math` trên nhánh migration Bauman Master AI.
3. So sánh file/checksum/runtime dependency giữa hai repo.
4. Bảo toàn 347 lesson ID và 18 theory overlay.
5. Bảo toàn route, storage key, progress và JSON import/export cũ.
6. Phân loại runtime, học liệu, QA artifact và compatibility layer.
7. Ghi provenance nguồn và danh sách khoảng trống dữ liệu.
8. Chạy deterministic source audit trước khi khóa L1.

## Lượt 2 · Standalone Web App shell and PWA baseline · 10 bước

1. Nhập module Toán mới theo overlay có kiểm soát.
2. Tách dependency storage dùng chung thành asset standalone.
3. Dựng một `index.html` Web App thống nhất thay vì tập HTML rời.
4. Giữ toàn bộ tab Tổng quan/Học tập/Vấn đáp/Mô phỏng/Tài nguyên/Công thức/Mind map/Dữ liệu.
5. Nối core runtime legacy với theory E129–E246.
6. Bổ sung semantic HTML, skip link, trạng thái tải và vùng thông báo accessible.
7. Bổ sung manifest và icon PWA.
8. Bổ sung Service Worker shell/offline fallback có version rollback.
9. Kiểm tra mọi local asset route và standalone path.
10. Browser smoke desktop/mobile/offline trước khi khóa L2.

## Lượt 3 · Data contracts and content catalog · 8 bước

1. Chuẩn hóa manifest standalone và program identity ИУ-5.
2. Phân biệt mã công bố `09.04.01` và mã hiển thị `09.04.01/11`.
3. Lập catalog 347 legacy lesson, 18 overlay và 56 chapter frame.
4. Chuẩn hóa source identity/version/provenance.
5. Kiểm orphan/duplicate/broken reference.
6. Sửa count metadata đang lỗi thời.
7. Thêm schema/validator và migration dry-run.
8. Data-integrity checkpoint.

## Lượt 4 · Learner-first navigation and study UX · 10 bước

1. Home/dashboard môn Toán rõ việc học hôm nay.
2. Cây Giai đoạn → Học phần → Chương → Bài.
3. Tìm kiếm và lọc không làm mất trạng thái.
4. Lesson reader dễ đọc, không clip nội dung.
5. Mục tiêu, prerequisite và thời lượng rõ ràng.
6. Công thức/định nghĩa/ví dụ/lỗi sai có phân cấp thị giác.
7. Resume vị trí học gần nhất.
8. Bookmark/note/checklist.
9. Empty/error/loading states có hướng xử lý.
10. UX regression desktop/tablet/mobile.

## Lượt 5 · Legacy 347 + 18 overlay bridge · 8 bước

1. Giữ nguyên toàn bộ ID và thứ tự nguồn.
2. Read-only adapter sang Universal Lesson Contract.
3. Chọn authoritative source theo lesson/version.
4. Fallback về legacy khi overlay thiếu hoặc lỗi.
5. Không nhân đôi progress giữa legacy và overlay.
6. Công thức và slide route không đổi.
7. Rollback theo lesson/source.
8. Cross-version regression.

## Lượt 6 · Theory, formulas, proofs and worked examples · 8 bước

1. Audit coverage thực tế theo từng chương.
2. Bổ sung công thức còn thiếu có điều kiện áp dụng.
3. Proof/intuition bridge theo trình độ.
4. Worked examples từng bước.
5. Misconception và correct/wrong visual.
6. Việt–Nga–Anh cho thuật ngữ Toán.
7. Formula rendering/accessibility/offline QA.
8. Academic review checkpoint.

## Lượt 7 · Exercises and deliberate practice · 10 bước

1. Khôi phục/xây exercise bank theo lessonId.
2. Bốn mức độ có rubric rõ.
3. Hint theo tầng, không lộ đáp án sớm.
4. Lời giải từng bước và kiểm tra kết quả.
5. Bài tính tay + Python/NumPy phù hợp.
6. Lỗi sai nối về prerequisite.
7. Personal weak-topic queue.
8. Spaced practice 1–3–7–14 ngày.
9. Import/export exercise artifact.
10. Coverage và learner-flow regression.

## Lượt 8 · Simulations, applications and computational labs · 10 bước

1. Khôi phục/xây simulation bank theo lessonId.
2. Unified lab có biến, readout và scenario.
3. AI/Data/Signal/Control/UGV-USV applications.
4. Python/NumPy notebook contract.
5. Correct/wrong parameter states.
6. Artifact/log/report sau lab.
7. Offline deterministic simulation fallback.
8. Mobile interaction và keyboard support.
9. Performance/memory guard.
10. Lab quality regression.

## Lượt 9 · Assessment, review and mastery · 10 bước

1. Question bank đủ coverage lesson/chapter.
2. Blueprint 40/30/20/10 theo độ khó.
3. Exam 20/40/60/100 câu và phân trang an toàn.
4. Không lộ đáp án trước khi nộp.
5. Review từ lỗi sai thực tế.
6. Mastery evidence hiểu–giải–ứng dụng–giải thích–ghi nhớ.
7. Oral/professor defense.
8. Remedial plan và retest.
9. Progress integrity và recovery.
10. Assessment security/browser regression.

## Lượt 10 · Context-aware AI Mentor · 8 bước

1. AI biết môn/chương/bài hiện tại.
2. AI biết prerequisite và weak topics.
3. AI biết lịch học và tiến độ.
4. AI biết assessment errors/evidence.
5. AI biết НИР/ВКР context liên quan.
6. Source/user/system/AI provenance tách biệt.
7. Offline fallback không phụ thuộc AI.
8. Context/eval/privacy checkpoint.

## Lượt 11 · Russian/English academic layer · 6 bước

1. Russian Twin theo lesson/context.
2. English research terminology.
3. Glossary bảo toàn ký hiệu/tên riêng.
4. Progressive language rescue.
5. Vấn đáp và thuyết trình Nga/Anh.
6. Language alignment QA.

## Lượt 12 · Offline, storage and content operations · 8 bước

1. IndexedDB/local storage budget và migration.
2. Offline subject packs có integrity.
3. JSON import validate/preview/commit/rollback.
4. Export/backup/restore learner data.
5. Direct local reader.
6. PWA install/update UX.
7. Multi-tab/concurrent-write recovery.
8. Offline lifecycle regression.

## Lượt 13 · Accessibility, responsive and performance · 8 bước

1. WCAG keyboard/focus/landmark audit.
2. Contrast/type scale/readability.
3. Reduced motion và screen-reader labels.
4. 320px/mobile/tablet/desktop layouts.
5. Large-data lazy load.
6. DOM/memory/network profiling.
7. Core Web Vitals budget.
8. Cross-browser/device gate.

## Lượt 14 · Security, integrity and curriculum governance · 8 bước

1. XSS/injection/local-file audit.
2. Assessment tamper guard.
3. Content provenance/reviewer/version.
4. Author → validate → review → publish workflow.
5. Lesson-level diff/rollback.
6. Duplicate/orphan/ID conflict detection.
7. Dependency/secret/privacy scan.
8. Security/content recovery drill.

## Lượt 15 · Full acceptance, staging and release · 8 bước

1. Full curriculum smoke.
2. Legacy content/function parity.
3. Accessibility acceptance.
4. Offline/PWA acceptance.
5. Performance acceptance.
6. Learner and academic reviewer acceptance.
7. Staging/version/health/rollback checkpoint.
8. Chỉ cập nhật `main` khi toàn bộ gate tương ứng PASS.
