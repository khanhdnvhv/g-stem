import { STEMScheduleViewer } from "../teacher/STEMScheduleViewer";

/**
 * Tái dùng viewer của giáo viên nhưng filter theo lớp của học sinh.
 */
export function StudentScheduleViewer() {
  return <STEMScheduleViewer forRole="student" />;
}

export default StudentScheduleViewer;
