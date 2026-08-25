# Main Bridge Contract V4

Main gửi `BAUMAN_TODAY_TASK` hoặc `BAUMAN_ASSIGN_TASK`.

Trường bắt buộc: `subjectId`, `stageId`, `partId`, `taskType`, `lessonIds`, `conceptIds`, `source`.

Môn trả `BAUMAN_SUBJECT_PROGRESS` và chỉ xin mở khóa bằng `BAUMAN_UNLOCK_REQUEST` với `unlockTarget=next_part|next_stage`.
