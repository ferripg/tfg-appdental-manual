"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
};

export function NavLink({
  href,
  label,
  className,
  activeClassName,
  onClick,
}: Props) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(className, isActive && activeClassName)}
    >
      {label}
    </Link>
  );
}
