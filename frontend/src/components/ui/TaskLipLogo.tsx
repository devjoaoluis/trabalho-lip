import { cn } from "#lib/utils"
import Tools from "/design-tools.svg?url"
import "./tasklip-logo.css"

interface TaskLipLogoProps {
  className?: string
  variant?: "white" | "dark"
}

export function TaskLipLogo({ className, variant = "white" }: TaskLipLogoProps) {
  return (
    <div
      className={cn("tasklip-logo", className)}
      aria-label="Task Lip"
    >
      <img
        src={Tools}
        alt=""
        aria-hidden="true"
        className="tasklip-logo__icon"
      />
      <span
        className={cn(
          "tasklip-logo__text",
          variant === "dark" ? "tasklip-logo__text--dark" : "tasklip-logo__text--white"
        )}
      >
        Task Lip
      </span>
    </div>
  )
}
