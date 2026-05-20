import { Link } from "react-router";
import { Construction, ArrowLeft } from "lucide-react";
import { Button } from "../../ui/button";

interface PublicComingSoonProps {
  pageName: string;
  pageId?: string;
  description?: string;
}

export function PublicComingSoon({ pageName, pageId, description }: PublicComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Construction className="size-10" />
        </div>
        {pageId && (
          <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Trang {pageId}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{pageName}</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          {description ||
            "Trang này đang trong quá trình xây dựng. Vui lòng quay lại sau hoặc liên hệ với chúng tôi để biết thêm thông tin."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="size-4 mr-2" /> Về Trang chủ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Liên hệ tư vấn</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
