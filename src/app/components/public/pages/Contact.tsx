import { useState, type FormEvent } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { Button } from "../../ui/button";
import { Section, SectionHeading } from "../marketing/Section";
import { HeroSection } from "../marketing/HeroSection";

const PROVINCES = [
  "Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa-Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
  "Lạng Sơn", "Lào Cai", "Lâm Đồng", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
  "Thanh Hóa", "Thừa Thiên-Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái",
];

const INTEREST_OPTIONS = [
  "Phòng STEM Tối thiểu",
  "Phòng STEM Cơ bản",
  "Phòng STEM Nâng cao",
  "Tập huấn giáo viên",
  "Demo nền tảng",
  "Trở thành nhà phân phối",
];

const CONTACT_INFO = [
  {
    icon: <MapPin className="size-5" />,
    label: "Địa chỉ",
    lines: ["Tầng 18, Tòa nhà Geleximco", "36 Hoàng Cầu, Đống Đa, Hà Nội"],
  },
  {
    icon: <Phone className="size-5" />,
    label: "Hotline",
    lines: ["1800 5688 (miễn phí)", "Thứ 2 – Thứ 6, 8:00 – 17:30"],
  },
  {
    icon: <Mail className="size-5" />,
    label: "Email",
    lines: ["contact@geleximco-stem.vn", "support@geleximco-stem.vn"],
  },
  {
    icon: <Clock className="size-5" />,
    label: "Giờ làm việc",
    lines: ["Thứ 2 – Thứ 6: 8:00 – 17:30", "Thứ 7: 8:00 – 12:00"],
  },
];

export function Contact() {
  const [interests, setInterests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleInterest(opt: string) {
    setInterests((prev) =>
      prev.includes(opt) ? prev.filter((i) => i !== opt) : [...prev, opt]
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Liên hệ"
        title={
          <>
            Nhận tư vấn{" "}
            <span className="text-primary">miễn phí</span>
          </>
        }
        subtitle="Đội ngũ chuyên gia sẵn sàng khảo sát thực tế và đề xuất giải pháp STEM tối ưu cho trường bạn trong vòng 48 giờ."
        background="tint"
      />

      <Section background="default">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-foreground mb-6">Gửi yêu cầu tư vấn</h2>

            {submitted ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Gửi thành công!</h3>
                <p className="text-muted-foreground mb-6">
                  Cảm ơn bạn đã liên hệ. Đội ngũ tư vấn của chúng tôi sẽ phản hồi trong vòng 24–48 giờ làm việc.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Gửi yêu cầu khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Họ và tên <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Chức vụ <span className="text-primary">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    >
                      <option value="">Chọn chức vụ</option>
                      <option>Hiệu trưởng</option>
                      <option>Phó Hiệu trưởng</option>
                      <option>Trưởng phòng GD&ĐT</option>
                      <option>Chuyên viên Sở/Phòng GD</option>
                      <option>Giáo viên</option>
                      <option>Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tên trường / Đơn vị <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Trường THCS Nguyễn Du"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Tỉnh/Thành phố <span className="text-primary">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {PROVINCES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Bậc học
                    </label>
                    <select className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm">
                      <option value="">Chọn bậc học</option>
                      <option>Mầm non</option>
                      <option>Tiểu học</option>
                      <option>THCS</option>
                      <option>THPT</option>
                      <option>Liên cấp</option>
                      <option>THPT Nghề</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email <span className="text-primary">*</span>
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

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2.5">
                    Quan tâm đến
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleInterest(opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          interests.includes(opt)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border text-foreground hover:border-primary/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nội dung yêu cầu
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Mô tả ngắn về nhu cầu của trường bạn, số phòng STEM cần thiết, ngân sách dự kiến..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Gửi yêu cầu tư vấn
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Thông tin liên hệ</h2>
            {CONTACT_INFO.map((info) => (
              <div key={info.label} className="bg-card border border-border rounded-xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {info.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {info.label}
                  </p>
                  {info.lines.map((line, i) => (
                    <p key={i} className={`text-sm ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4">
              <p className="text-sm font-semibold text-foreground mb-2">
                Phản hồi nhanh trong 48h
              </p>
              <p className="text-sm text-muted-foreground">
                Đội ngũ tư vấn cam kết liên hệ lại trong vòng 48 giờ làm việc sau khi nhận yêu cầu của bạn.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Map placeholder */}
      <Section background="muted" className="py-0">
        <div className="h-64 rounded-2xl bg-secondary overflow-hidden flex items-center justify-center border border-border">
          <div className="text-center text-muted-foreground">
            <MapPin className="size-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Bản đồ — Tầng 18, Tòa nhà Geleximco, 36 Hoàng Cầu, Hà Nội</p>
          </div>
        </div>
      </Section>
    </>
  );
}
