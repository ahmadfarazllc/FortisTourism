import { useState } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const toasts: Toast[] = []
let toastId = 0

export function useToast() {
  const [, forceUpdate] = useState({})

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = (toastId++).toString()
    const newToast = { ...toast, id }
    toasts.push(newToast)
    forceUpdate({})
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
    
    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      forceUpdate({})
    }
  }

  return {
    toast: addToast,
    toasts,
    removeToast,
  }
}