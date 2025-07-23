import Image from "next/image";
import { useState } from "react";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "gold" | "black";
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  xs: { width: 16, height: 16, className: "w-4 h-4" },
  sm: { width: 24, height: 24, className: "w-6 h-6" },
  md: { width: 32, height: 32, className: "w-8 h-8" },
  lg: { width: 48, height: 48, className: "w-12 h-12" },
  xl: { width: 64, height: 64, className: "w-16 h-16" },
  "2xl": { width: 96, height: 96, className: "w-24 h-24" },
};

export function Logo({
  size = "md",
  variant = "gold",
  className = "",
  priority = false,
}: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const sizeConfig = sizeMap[size];

  const logoSrc =
    variant === "gold"
      ? "/images/Excellence-Games-Logo-Gold.png"
      : "/images/Excellence-Games-Logo-Black.png";

  return (
    <div
      className={`relative ${sizeConfig.className} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={logoSrc}
        alt="Excellence Games"
        width={sizeConfig.width}
        height={sizeConfig.height}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}
        priority={priority}
      />
      <Image
        src={
          variant === "gold"
            ? "/images/Excellence-Games-Logo-Black.png"
            : "/images/Excellence-Games-Logo-Gold.png"
        }
        alt="Excellence Games"
        width={sizeConfig.width}
        height={sizeConfig.height}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        priority={priority}
      />
    </div>
  );
}

// Specific logo components for common use cases
export function LogoXS({
  variant = "gold",
  className = "",
}: Omit<LogoProps, "size">) {
  return <Logo size="xs" variant={variant} className={className} />;
}

export function LogoSM({
  variant = "gold",
  className = "",
}: Omit<LogoProps, "size">) {
  return <Logo size="sm" variant={variant} className={className} />;
}

export function LogoMD({
  variant = "gold",
  className = "",
}: Omit<LogoProps, "size">) {
  return <Logo size="md" variant={variant} className={className} />;
}

export function LogoLG({
  variant = "gold",
  className = "",
}: Omit<LogoProps, "size">) {
  return <Logo size="lg" variant={variant} className={className} />;
}

export function LogoXL({
  variant = "gold",
  className = "",
}: Omit<LogoProps, "size">) {
  return <Logo size="xl" variant={variant} className={className} />;
}

export function Logo2XL({
  variant = "gold",
  className = "",
}: Omit<LogoProps, "size">) {
  return <Logo size="2xl" variant={variant} className={className} />;
}
