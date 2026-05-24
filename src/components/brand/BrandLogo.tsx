import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Served from public/brand/logo.jpg (source: image/logo.jpg) */
export const BRAND_LOGO_SRC = "/brand/logo.jpg";

const SIZE = {
  sm: { height: 28, width: 140 },
  md: { height: 36, width: 180 },
  lg: { height: 48, width: 240 },
} as const;

interface BrandLogoProps {
  size?: keyof typeof SIZE;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  size = "md",
  href = "/dashboard",
  className,
  priority,
}: BrandLogoProps) {
  const dims = SIZE[size];

  const image = (
    <Image
      src={BRAND_LOGO_SRC}
      alt={APP_NAME}
      width={dims.width}
      height={dims.height}
      priority={priority}
      className={cn("h-auto max-w-full object-contain object-left", className)}
      style={{ maxHeight: dims.height }}
    />
  );

  if (href == null) {
    return <span className="inline-flex items-center">{image}</span>;
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
    >
      {image}
    </Link>
  );
}
