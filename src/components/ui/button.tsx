"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 px-5 py-3 text-white shadow-[0_12px_35px_rgba(99,102,241,0.35)] hover:scale-[1.01] hover:shadow-[0_16px_45px_rgba(34,211,238,0.25)]",
        secondary:
          "border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 hover:bg-white/10",
        danger:
          "bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-white shadow-[0_12px_30px_rgba(244,63,94,0.25)] hover:scale-[1.01]",
        ghost: "px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white",
      },
      size: {
        default: "",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-3.5 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
