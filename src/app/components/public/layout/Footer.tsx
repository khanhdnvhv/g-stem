import { Link } from "react-router";
import { Mail, Phone, MapPin, Facebook, Youtube, Linkedin } from "lucide-react";

const COLUMNS = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Phòng STEM Tối thiểu", to: "/solutions/minimum" },
      { label: "Phòng STEM Cơ bản", to: "/solutions/basic" },
      { label: "Phòng STEM Nâng cao", to: "/solutions/advanced" },
      { label: "5 Chương trình CT1-CT5", to: "/programs" },
    ],
  },
  {
    title: "Đối tác",
    links: [
      { label: "Geleximco STEM", to: "/partners/geleximco-stem" },
      { label: "EBD — NXB ĐH Sư Phạm", to: "/partners/ebd" },
      { label: "Nexta", to: "/partners/nexta" },
      { label: "Trở thành đối tác", to: "/contact" },
    ],
  },
  {
    title: "Tài nguyên",
    links: [
      { label: "Tin tức / Blog", to: "/news" },
      { label: "Sự kiện sắp tới", to: "/events" },
      { label: "Tải tài liệu / Brochure", to: "/downloads" },
      { label: "Knowledge Base", to: "/support/kb" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm hỗ trợ", to: "/support" },
      { label: "Câu hỏi thường gặp", to: "/support/faq" },
      { label: "Gửi yêu cầu hỗ trợ", to: "/support/ticket-new" },
      { label: "Liên hệ", to: "/contact" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-sidebar text-sidebar-foreground mt-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand col (span 2) */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md bg-accent text-sidebar-primary-foreground flex items-center justify-center font-bold text-lg">
                G
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-base">Geleximco</span>
                <span className="text-[10px] uppercase tracking-wider text-accent font-medium">
                  STEM Platform
                </span>
              </div>
            </div>
            <p className="text-sm text-sidebar-foreground/80 leading-relaxed max-w-sm">
              Nền tảng tổng thể cho giáo dục STEM toàn diện — đồng hành cùng nhà trường Việt Nam
              chuẩn hóa chương trình STEM theo Bộ GD&ĐT.
            </p>
            <div className="space-y-2 text-sm text-sidebar-foreground/80">
              <div className="flex items-start gap-2">
                <Phone className="size-4 mt-0.5 shrink-0" />
                <span>Hotline: 1900 xxxx (8h-18h, T2-T6)</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="size-4 mt-0.5 shrink-0" />
                <a href="mailto:contact@geleximco-stem.vn" className="hover:text-accent">
                  contact@geleximco-stem.vn
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5 shrink-0" />
                <span>Hà Nội · TP. Hồ Chí Minh · Đà Nẵng</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-sidebar-primary-foreground transition-colors"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-sidebar-primary-foreground transition-colors"
              >
                <Youtube className="size-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-sidebar-primary-foreground transition-colors"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-sidebar-foreground mb-4 uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-sidebar-foreground/75 hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-sidebar-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sidebar-foreground/60">
            © {year} Tập đoàn Geleximco — STEM Platform. Bảo lưu mọi quyền.
          </p>
          <div className="flex items-center gap-4 text-xs text-sidebar-foreground/60">
            <Link to="#" className="hover:text-accent">
              Điều khoản sử dụng
            </Link>
            <span>·</span>
            <Link to="#" className="hover:text-accent">
              Chính sách bảo mật
            </Link>
            <span>·</span>
            <Link to="#" className="hover:text-accent">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
