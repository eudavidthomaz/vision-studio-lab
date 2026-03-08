import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

const SPARKLES_DISABLED_VARIANTS = new Set(["destructive", "secondary", "link"]);

const buttonVariants = cva(
  "relative group inline-flex items-center justify-center gap-2 whitespace-nowrap border text-sm font-medium text-foreground rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary/5 hover:bg-primary/0 border-primary/20",
        solid:
          "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent hover:border-foreground/50 transition-all duration-200",
        destructive:
          "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-transparent",
        outline:
          "border-input bg-transparent hover:bg-accent/10 hover:text-accent-foreground",
        secondary:
          "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-secondary",
        ghost:
          "border-transparent bg-transparent hover:border-muted-foreground/30 hover:bg-accent/10",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-7 py-1.5 h-10",
        sm: "px-4 py-0.5 h-9",
        lg: "px-10 py-2.5 h-11",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const showSparkles = !SPARKLES_DISABLED_VARIANTS.has(variant || "default");

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {showSparkles && (
          <div className="absolute inset-0 overflow-hidden rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0">
            <SparklesCore
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={40}
              particleColor="hsl(var(--primary))"
              speed={3}
              className="w-full h-full"
            />
          </div>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
