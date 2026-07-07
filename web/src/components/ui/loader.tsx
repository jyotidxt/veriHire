import React from "react";
import clsx from "clsx";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Loader: React.FC<LoaderProps> = ({ className, size = "md" }) => {
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <div
        className={clsx(
          "rounded-full border-t-2 border-r-2 border-brand-violet animate-spin",
          {
            "w-4 h-4 border-2": size === "sm",
            "w-8 h-8 border-2": size === "md",
            "w-12 h-12 border-3": size === "lg",
          }
        )}
        style={{ borderBottomColor: "transparent", borderLeftColor: "transparent" }}
      />
    </div>
  );
};
