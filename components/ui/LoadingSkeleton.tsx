import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Number of placeholder blocks to display
   * @default 1
   */
  count?: number
  /**
   * Height of each placeholder block in pixels
   * @default 20
   */
  height?: number
  /**
   * Whether the skeleton should be rounded
   * @default true
   */
  rounded?: boolean
  /**
   * Custom width for the skeleton blocks (can be px, %, etc.)
   * @default "100%"
   */
  width?: string | number
}

export function LoadingSkeleton({
  count = 1,
  height = 20,
  rounded = true,
  width = "100%",
  className,
  ...props
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse bg-muted",
            rounded && "rounded-md",
            className
          )}
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            width: typeof width === "number" ? `${width}px` : width,
            marginBottom: index < count - 1 ? "0.5rem" : 0,
          }}
          {...props}
        />
      ))}
    </>
  )
}
