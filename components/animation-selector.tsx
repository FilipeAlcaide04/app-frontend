"use client"

import { useState } from "react"
import { OPENSOURCEAVATARS_ANIMATIONS, type AnimationName } from "@/lib/vrm-animations"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export interface AnimationSelectorProps {
  value?: AnimationName | string
  onChange?: (animation: AnimationName) => void
  className?: string
}

export function AnimationSelector({ value, onChange, className }: AnimationSelectorProps) {
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationName | string>(
    value || "Bored"
  )

  const handleChange = (newAnimation: string) => {
    setSelectedAnimation(newAnimation)
    onChange?.(newAnimation as AnimationName)
  }

  // Group animations by category
  const idleAnimations = OPENSOURCEAVATARS_ANIMATIONS.filter(a => a.category === "idle")
  const activeAnimations = OPENSOURCEAVATARS_ANIMATIONS.filter(a => a.category === "active")

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor="animation-select" className="text-sm font-medium">
          Avatar Animation
        </Label>
        <Select value={selectedAnimation} onValueChange={handleChange}>
          <SelectTrigger id="animation-select" className="w-full">
            <SelectValue placeholder="Select animation" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Idle Animations
            </div>
            {idleAnimations.map((anim) => (
              <SelectItem key={anim.name} value={anim.name}>
                <div className="flex items-center gap-2">
                  <span>{anim.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Idle
                  </Badge>
                </div>
              </SelectItem>
            ))}
            
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
              Active Animations
            </div>
            {activeAnimations.map((anim) => (
              <SelectItem key={anim.name} value={anim.name}>
                <div className="flex items-center gap-2">
                  <span>{anim.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Animation description */}
        {selectedAnimation && (
          <p className="text-xs text-muted-foreground">
            {OPENSOURCEAVATARS_ANIMATIONS.find(a => a.name === selectedAnimation)?.description}
          </p>
        )}
      </div>
    </div>
  )
}

// Compact button version for toolbar
export function AnimationSelectorCompact({ value, onChange, className }: AnimationSelectorProps) {
  return (
    <Select value={value || "Bored"} onValueChange={(v) => onChange?.(v as AnimationName)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPENSOURCEAVATARS_ANIMATIONS.map((anim) => (
          <SelectItem key={anim.name} value={anim.name}>
            {anim.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
