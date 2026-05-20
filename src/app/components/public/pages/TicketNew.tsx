import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../../ui/button";
import { HeroSection } from "../marketing/HeroSection";
import { Section } from "../marketing/Section";

const ISSUE_TYPES = [
  "Không đăng nhập được",
  "Lỗi khi sử dụng tính năng",
  "Thiết bị phòng STEM hỏng / cần bảo hành",
  "Câu hỏi về học liệu",
  "Yêu cầu cấp thêm tài khoản",
  "Yêu cầu xuất dữ liệu / báo cáo",
  "Câu hỏi về hợp đồng / thanh toán",
  "Khác",
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Thấp — Không ảnh hưởng đến hoạt động hiện tại" },
  { value: "medium", label: "Trung bình — Cần giải quyết trong 1-2 ngày" },
  { value: "high", label: "Cao — Ảnh hưởng đến tiết học / vận hành" },
  { value: "urgent", label: "Khẩn cấp — Cần xử lý ngay" },
];

export function TicketNew() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketId] = useState(`TK${Date.now().toString().slice(-6)}`);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Hỗ trợ kỹ thuật"
        title={
          <>
            Gửi yêu cầu{" "}
            <span className="text-primary">hỗ trợ</span>
          </>
        }
        subtitle="Đội ngũ hỗ trợ của Geleximco cam kết phản hồi trong vòng 4 giờ làm việc."
        background="tint"
      />

      <Section background="default">
        <div className="max-w-2xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
            <Link to="/support">
              <ArrowLeft className="size-4 mr-1" /> Trung tâm hỗ trợ
            </Link>
          </Button>

          {submitted ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Ticket đã được tạo thành công!</h3>
              <p className="text-muted-foreground mb-2">
                Mã ticket của bạn: <span className="font-bold text-primary">{ticketId}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Chúng tôi sẽ gửi email xác nhận và phản hồi trong vòng 4 giờ làm việc. Vui lòng giữ mã ticket để theo dõi tiến trình.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Tạo ticket mới
                </Button>
                <Button asChild>
                  <Link to="/support">Về trung tâm hỗ trợ</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  Trước khi tạo ticket, bạn có thể tìm câu trả lời nhanh hơn tại{" "}
                  <Link to="/support/faq" className="text-primary underline underline-offset-2">FAQ</Link> hoặc{" "}
                  <Link to="/support/kb" className="text-primary underline underline-offset-2">Knowledge Base</Link>.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Loại vấn đề <span className="text-primary">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  >
                    <option value="">Chọn loại vấn đề</option>
                    {ISSUE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Mức độ ưu tiên <span className="text-primary">*</span>
                  </label>
                  <div className="space-y-2">
                    {PRIORITY_LEVELS.map((level) => (
                      <label key={level.value} className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary/50 transition-colors">
                        <input
                          type="radio"
                          name="priority"
                          value={level.value}
                          className="accent-primary"
                        />
                        <span className="text-sm text-foreground">{level.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tiêu đề vấn đề <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mô tả ngắn gọn vấn đề của bạn..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Mô tả chi tiết <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Mô tả chi tiết vấn đề, các bước đã thực hiện, thông báo lỗi (nếu có), thiết bị đang sử dụng..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email liên hệ <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@truong.edu.vn"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-muted-foreground">
                    * Trường bắt buộc. Phản hồi trong 4 giờ làm việc.
                  </p>
                  <Button type="submit" size="lg">
                    Gửi yêu cầu hỗ trợ
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
