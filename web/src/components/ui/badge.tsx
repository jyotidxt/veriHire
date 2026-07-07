import React from "react";
import clsx from "clsx";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "neutral";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  children,
  ...props
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none",
        {
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20": variant === "success",
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20": variant === "warning",
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20": variant === "error",
          "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20": variant === "info",
          "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20": variant === "neutral",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
