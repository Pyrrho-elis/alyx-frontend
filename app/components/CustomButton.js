// Dependencies: pnpm install lucide-react

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomButton({ 
  children, 
  className, 
  variant = "default", 
  icon: Icon = ArrowRight,
  hideIcon = false,
  iconPosition = "right",
  ...props 
}) {
  return (
    <Button 
      {...props} 
      variant={variant}
      className={cn(
        "group transition-colors",
        variant === "outline" ? "hover:bg-gray-50" : "",
        className
      )}
    >
      <span className="flex items-center justify-center gap-2">
        {iconPosition === "left" && !hideIcon && (
          <Icon
            className="opacity-70"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        )}
        {children}
        {iconPosition === "right" && !hideIcon && (
          <Icon
            className="opacity-70"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        )}
      </span>
    </Button>
  );
}
