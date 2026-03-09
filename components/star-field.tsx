"use client"

import { useEffect, useRef } from "react"

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

const STAR_COUNT = 900
const MOUSE_REPEL_RADIUS = 120
const MOUSE_REPEL_STRENGTH = 0.8
const CONNECTION_DISTANCE = 120

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    starsRef.current = Array.from({ length: STAR_COUNT }, () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      return {
        x, y, ox: x, oy: y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 0.6,
        opacity: Math.random() * 0.5 + 0.5,
      }
    })

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const stars = starsRef.current
      const mouse = mouseRef.current

      for (const star of stars) {
        // Mouse repulsion
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

        // Pull back toward home position
        star.vx += (star.ox - star.x) * 0.018
        star.vy += (star.oy - star.y) * 0.018

        const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy)
        if (speed > 2) {
          star.vx = (star.vx / speed) * 2
          star.vy = (star.vy / speed) * 2
        }

        star.x += star.vx
        star.y += star.vy

        if (star.x < 0) { star.x = canvas.width;  star.ox = canvas.width  * Math.random() }
        if (star.x > canvas.width)  { star.x = 0; star.ox = canvas.width  * Math.random() }
        if (star.y < 0) { star.y = canvas.height; star.oy = canvas.height * Math.random() }
        if (star.y > canvas.height) { star.y = 0; star.oy = canvas.height * Math.random() }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(210, 225, 255, ${star.opacity})`
        ctx.fill()
      }

      // Draw connections between nearby stars
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
            ctx.strokeStyle = `rgba(160, 200, 255, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      aria-hidden="true"
    />
  )
}


