import { cn } from "../../ui/utils";

interface PartnerLogoCloudProps {
  logos: { name: string; logo: string }[];
  title?: string;
  className?: string;
}

export function PartnerLogoCloud({ logos, title, className }: PartnerLogoCloudProps) {
  return (
    <div className={cn("text-center", className)}>
      {title && (
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
          {title}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
            title={logo.name}
          >
            <img src={logo.logo} alt={logo.name} className="h-12 w-12 object-contain rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
