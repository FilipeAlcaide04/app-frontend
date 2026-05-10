"use client"

import { useEffect, useState } from "react"
import { VRMAvatar, VRMAvatarProps } from "./vrm-avatar"

export function VRMClientOnly(props: VRMAvatarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
      </div>
    )
  }

  return <VRMAvatar {...props} />
}
