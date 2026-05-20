import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";

interface NavItem {
  label: string;
  to?: string;
  children?: { label: string; to: string; description?: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", to: "/" },
  {
    label: "Giải pháp",
    children: [
      { label: "Tổng quan Phòng STEM", to: "/solutions", description: "3 tier phòng học STEM" },
      { label: "Phòng Tối thiểu", to: "/solutions/minimum", description: "Khởi đầu STEM cho mọi trường" },
      { label: "Phòng Cơ bản", to: "/solutions/basic", description: "Đầy đủ tính năng cho trường vừa" },
      { label: "Phòng Nâng cao", to: "/solutions/advanced", description: "Giải pháp đẳng cấp quốc tế" },
    ],
  },
  {
    label: "Chương trình",
    children: [
      { label: "Tổng quan 5 chương trình", to: "/programs", description: "CT1 - CT5 chuẩn Bộ GD&ĐT" },
      { label: "CT1 — Tích hợp nội môn", to: "/programs/ct1" },
      { label: "CT2 — Liên môn", to: "/programs/ct2" },
      { label: "CT3 — Tăng cường ĐM-ST", to: "/programs/ct3" },
      { label: "CT4 — Robotic/AI/IoT", to: "/programs/ct4" },
      { label: "CT5 — Trải nghiệm/NCKH", to: "/programs/ct5" },
    ],
  },
  {
    label: "Đối tác",
    children: [
      { label: "Mạng lưới đối tác", to: "/partners", description: "Hệ sinh thái Geleximco STEM" },
      { label: "Geleximco STEM", to: "/partners/geleximco-stem" },
      { label: "EBD — NXB ĐH Sư Phạm", to: "/partners/ebd" },
      { label: "Nexta", to: "/partners/nexta" },
    ],
  },
  { label: "Tin tức", to: "/news" },
  {
    label: "Hỗ trợ",
    children: [
      { label: "Support Center", to: "/support", description: "Trung tâm trợ giúp tổng" },
      { label: "Câu hỏi thường gặp", to: "/support/faq" },
      { label: "Knowledge Base", to: "/support/kb" },
      { label: "Gửi yêu cầu hỗ trợ", to: "/support/ticket-new" },
    ],
  },
  { label: "Liên hệ", to: "/contact" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/95 backdrop-blur transition-shadow",
        scrolled && "shadow-sm border-b border-border"
      )}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              G
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-foreground text-base">Geleximco</span>
              <span className="text-[10px] uppercase tracking-wider text-accent font-medium">STEM Platform</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavMenuItem
                key={item.label}
                item={item}
                open={openMenu === item.label}
                onOpen={(o) => setOpenMenu(o ? item.label : null)}
              />
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link to="/contact">Đăng ký tư vấn</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded hover:bg-secondary transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="max-w-[1280px] mx-auto px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <MobileNavItem key={item.label} item={item} />
            ))}
            <div className="pt-3 border-t border-border space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link to="/contact">Đăng ký tư vấn</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavMenuItem({
  item,
  open,
  onOpen,
}: {
  item: NavItem;
  open: boolean;
  onOpen: (o: boolean) => void;
}) {
  if (!item.children) {
    return (
      <NavLink
        to={item.to!}
        end={item.to === "/"}
        className={({ isActive }) =>
          cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive
              ? "text-primary bg-primary/5"
              : "text-foreground hover:text-primary hover:bg-secondary"
          )
        }
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => onOpen(true)}
      onMouseLeave={() => onOpen(false)}
    >
      <button
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
          open
            ? "text-primary bg-primary/5"
            : "text-foreground hover:text-primary hover:bg-secondary"
        )}
      >
        {item.label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
          <div className="bg-card border border-border rounded-lg shadow-lg min-w-[280px] py-2 overflow-hidden">
            {item.children.map((child) => (
              <Link
                key={child.to}
                to={child.to}
                className="flex flex-col gap-0.5 px-4 py-2.5 hover:bg-secondary transition-colors group"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-primary">
                  {child.label}
                </span>
                {child.description && (
                  <span className="text-xs text-muted-foreground">{child.description}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  if (!item.children) {
    return (
      <NavLink
        to={item.to!}
        end={item.to === "/"}
        className={({ isActive }) =>
          cn(
            "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive ? "text-primary bg-primary/5" : "text-foreground hover:bg-secondary"
          )
        }
      >
        {item.label}
      </NavLink>
    );
  }
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
      >
        {item.label}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-border pl-3">
          {item.children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary rounded transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
