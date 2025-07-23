import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface EmptyStateProps {
  /**
   * Main title/message to display
   */
  title: string
  /**
   * Optional secondary description
   */
  description?: string
  /**
   * Optional icon or illustration component
   */
  illustration?: ReactNode
  /**
   * Optional call-to-action button or link
   */
  action?: ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
}

export function EmptyState({
  title,
  description,
  illustration,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8",
      className
    )}>
      {illustration && (
        <div className="mb-6">
          {illustration}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}
