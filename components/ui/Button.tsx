import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-surface hover:bg-primary/90",
    secondary: "bg-foreground text-white hover:bg-foreground/90",
    outline:
      "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-white",
    ghost: "bg-transparent text-foreground hover:bg-background",
  };

  return (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center
        gap-2
        px-4 py-3.5
        rounded-full
        text-base font-semibold
        transition-all duration-200
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
