import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass-dark rounded-lg p-4 pr-8 min-w-[300px] relative animate-in slide-in-from-right-full ${
            toast.variant === "destructive"
              ? "border-red-500 text-red-200"
              : "border-neon-blue text-white"
          }`}
        >
          {toast.title && (
            <div className="font-semibold mb-1 holographic">{toast.title}</div>
          )}
          {toast.description && (
            <div className="text-sm text-muted-foreground">{toast.description}</div>
          )}
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded"
            data-testid={`button-close-toast-${toast.id}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}