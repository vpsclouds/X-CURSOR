import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-editor-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-xcursor-input text-xcursor-text hover:bg-xcursor-hover border border-xcursor-border",
        primary:
          "bg-accent text-white hover:bg-accent-hover shadow-sm",
        ghost:
          "text-xcursor-text-muted hover:text-xcursor-text hover:bg-xcursor-hover",
        outline:
          "border border-xcursor-border bg-transparent text-xcursor-text hover:bg-xcursor-hover",
        danger:
          "bg-xcursor-error/10 text-xcursor-error border border-xcursor-error/30 hover:bg-xcursor-error/20",
        link:
          "text-accent underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-5 px-1.5 text-[10px] rounded",
        sm: "h-6 px-2 text-editor-xs rounded",
        md: "h-7 px-3 text-editor-sm rounded",
        lg: "h-8 px-4 text-editor-base rounded-md",
        "icon-xs": "h-5 w-5 rounded",
        "icon-sm": "h-6 w-6 rounded",
        "icon-md": "h-7 w-7 rounded",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
