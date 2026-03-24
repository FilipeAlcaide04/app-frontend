"use client"

import { useEffect, useState } from "react"
import { VRMAvatar, VRMAvatarProps } from "./vrm-avatar"

export function VRMClientOnly(props: VRMAvatarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-full h-full" />
  }

  return <VRMAvatar {...props} />
}
