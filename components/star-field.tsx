"use client"

import { useEffect, useRef, useCallback } from "react"

interface Star {
  x: number
  y: number
  ox: number
  oy: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

const STAR_COUNT = 400
const MOUSE_REPEL_RADIUS = 50
const MOUSE_REPEL_STRENGTH = 0.8
const CONNECTION_DISTANCE = 90

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef<number>(0)
  const initializedRef = useRef(false)

  const initStars = useCallback((w: number, h: number) => {
    if (w === 0 || h === 0) return
    starsRef.current = Array.from({ length: STAR_COUNT }, () => {
      const x = Math.random() * w
      const y = Math.random() * h
      return {
        x, y, ox: x, oy: y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.4 + 1.0,
        opacity: Math.random() * 0.2 + 0.8,
      }
    })
    initializedRef.current = true
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let logicalW = 0
    let logicalH = 0

    const setSize = () => {
      const parent = canvas.parentElement
      const w = parent?.clientWidth || window.innerWidth
      const h = parent?.clientHeight || window.innerHeight
      if (w === 0 || h === 0) return
      const dpr = window.devicePixelRatio || 1
      const prevW = logicalW
      const prevH = logicalH
      logicalW = w
      logicalH = h
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!initializedRef.current) {
        initStars(w, h)
      } else if (prevW > 0 && prevH > 0) {
        const scaleX = w / prevW
        const scaleY = h / prevH
        for (const star of starsRef.current) {
          star.x *= scaleX
          star.y *= scaleY
          star.ox *= scaleX
          star.oy *= scaleY
        }
      }
    }

    setSize()

    const ro = new ResizeObserver(() => setSize())
    if (canvas.parentElement) {
      ro.observe(canvas.parentElement)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)

    const draw = () => {
      if (!canvas.width || !canvas.height) {
        animFrameRef.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, logicalW, logicalH)
      const stars = starsRef.current
      const mouse = mouseRef.current

      for (const star of stars) {
        const dx = star.x - mouse.x
        const dy = star.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_REPEL_RADIUS && dist > 0) {
          const force = (MOUSE_REPEL_RADIUS - dist) / MOUSE_REPEL_RADIUS
          star.vx += (dx / dist) * force * MOUSE_REPEL_STRENGTH
          star.vy += (dy / dist) * force * MOUSE_REPEL_STRENGTH
        }

        star.vx *= 0.85
        star.vy *= 0.85

        star.vx += (star.ox - star.x) * 0.018
        star.vy += (star.oy - star.y) * 0.018

        const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy)
        if (speed > 2) {
          star.vx = (star.vx / speed) * 2
          star.vy = (star.vy / speed) * 2
        }

        star.x += star.vx
        star.y += star.vy

        if (star.x < 0) { star.x = logicalW; star.ox = logicalW * Math.random() }
        if (star.x > logicalW) { star.x = 0; star.ox = logicalW * Math.random() }
        if (star.y < 0) { star.y = logicalH; star.oy = logicalH * Math.random() }
        if (star.y > logicalH) { star.y = 0; star.oy = logicalH * Math.random() }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(210, 225, 255, ${star.opacity})`
        ctx.fill()
      }

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.35
            ctx.beginPath()
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            ctx.strokeStyle = `rgba(220, 230, 255, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      ro.disconnect()
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      initializedRef.current = false
    }
  }, [initStars])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
