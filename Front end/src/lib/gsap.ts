'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function registerGSAP() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export function revealOnScroll(
  targets: string | Element | Element[],
  options?: { stagger?: number; y?: number; start?: string }
) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    gsap.set(targets, { opacity: 1, y: 0 })
    return
  }
  gsap.set(targets, { opacity: 0, y: options?.y ?? 32 })
  ScrollTrigger.batch(targets as string, {
    start: options?.start ?? 'top 85%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'expo.out',
        stagger: options?.stagger ?? 0.08,
      }),
  })
}

export function countUp(el: Element, target: number, duration = 1.2) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) { el.textContent = String(target); return }
  const obj = { val: 0 }
  gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = Math.round(obj.val).toString() },
  })
}

export function navShrink(navEl: Element) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return
  let shrunk = false
  const onScroll = () => {
    if (window.scrollY > 40 && !shrunk) {
      shrunk = true
      gsap.to(navEl, { paddingTop: 12, paddingBottom: 12, duration: 0.3, ease: 'power2.out' })
      ;(navEl as HTMLElement).style.backdropFilter = 'blur(20px)'
    } else if (window.scrollY <= 40 && shrunk) {
      shrunk = false
      gsap.to(navEl, { paddingTop: 24, paddingBottom: 24, duration: 0.3, ease: 'power2.out' })
      ;(navEl as HTMLElement).style.backdropFilter = 'blur(12px)'
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}

export function textReveal(words: Element[], delay = 0) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) { gsap.set(words, { opacity: 1, y: 0 }); return }
  gsap.set(words, { opacity: 0, y: 24 })
  gsap.to(words, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'expo.out',
    stagger: 0.04,
    delay,
  })
}

export function pageTransitionIn(overlay: Element) {
  return gsap.fromTo(
    overlay,
    { clipPath: 'inset(100% 0 0 0)' },
    { clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'expo.inOut' }
  )
}

export function pageTransitionOut(overlay: Element) {
  return gsap.to(overlay, {
    clipPath: 'inset(0 0 100% 0)',
    duration: 0.7,
    ease: 'expo.inOut',
  })
}

export { gsap, ScrollTrigger }
