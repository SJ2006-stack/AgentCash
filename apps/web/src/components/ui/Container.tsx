import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
} as const;

export function Container({ className, children, size = "lg", ...props }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-6 sm:px-8", sizes[size], className)} {...props}>
      {children}
    </div>
  );
}
