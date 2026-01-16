"use client"

import * as React from "react"
import { createPortal } from "react-dom"

interface DropdownPortalProps {
  show: boolean;
  children: React.ReactNode;
}

export function DropdownPortal({ show, children }: DropdownPortalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Don't render anything on the server
  if (!mounted) return null
  
  // Don't render when not showing
  if (!show) return null
  
  // The key to fixing the type error: separate the portal creation
  // into its own variable instead of directly in JSX
  const portal = createPortal(children, document.body)
  
  // Return without type annotation
  return portal
} 