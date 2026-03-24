"use client"

import { useState } from "react"
import { VRMClientOnly } from "@/components/vrm-client-only"

export default function VRMTestPage() {
  const [vrm, setVrm] = useState<any>(null)
  const [vrmError, setVrmError] = useState<string | null>(null)

  return (
    <div className="w-full h-screen bg-background flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">VRM Avatar Test</h1>
      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
        <div onError={(e) => setVrmError(String(e))}>
          <VRMClientOnly 
            avatarUrl="/avatars/placeholder.vrm" 
            onAvatarLoaded={(v) => {
              console.log("Avatar loaded:", v)
              setVrm(v)
              setVrmError(null)
            }}
          />
        </div>
      </div>
      <div className="p-4 bg-card border border-border rounded-lg space-y-2">
        <p className="font-mono">
          VRM Loaded: <span className={vrm ? "text-green-500 font-bold" : "text-red-500"}>{vrm ? "✓ Yes" : "✗ No"}</span>
        </p>
        {vrm && (
          <>
            <p className="text-xs text-muted-foreground">Scene children: {vrm.scene?.children?.length}</p>
            <p className="text-xs text-muted-foreground">Expression Manager: {vrm.expressionManager ? "✓" : "✗"}</p>
          </>
        )}
        {vrmError && <p className="text-red-500 text-xs">{vrmError}</p>}
        <p className="text-xs text-muted-foreground">Check browser console (F12) for detailed logs</p>
      </div>
    </div>
  )
}

