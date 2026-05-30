import { cn } from "@/lib/utils"

interface PixelPanelProps {
  children: React.ReactNode
  title?: string
  variant?: "default" | "inset" | "gold"
  className?: string
  titleClassName?: string
}

export function PixelPanel({
  children,
  title,
  variant = "default",
  className,
  titleClassName,
}: PixelPanelProps) {
  const variantStyles = {
    default: "bg-card shadow-[inset_-4px_-4px_0px_0px_rgba(0,0,0,0.5),inset_4px_4px_0px_0px_rgba(255,255,255,0.1),8px_8px_0px_0px_rgba(0,0,0,0.4)]",
    inset: "bg-muted shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.5),inset_-4px_-4px_0px_0px_rgba(255,255,255,0.1)]",
    gold: "bg-card shadow-[inset_-4px_-4px_0px_0px_rgba(0,0,0,0.5),inset_4px_4px_0px_0px_rgba(255,255,255,0.1),8px_8px_0px_0px_rgba(0,0,0,0.4),0_0_20px_rgba(200,180,100,0.3)]",
  }

  return (
    <div
      className={cn(
        "relative border-4 border-border",
        variantStyles[variant],
        className
      )}
    >
      {title && (
        <div className={cn(
          "absolute -top-4 left-4 px-2 bg-card text-primary text-[10px] uppercase tracking-wider",
          titleClassName
        )}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}
