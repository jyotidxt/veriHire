import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  glowEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "glass-card p-6 transition-all duration-300 relative overflow-hidden",
        {
          "hover:translate-y-[-2px] hover:shadow-xl dark:hover:shadow-black/30": hoverEffect,
          "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_3s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent": glowEffect,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
