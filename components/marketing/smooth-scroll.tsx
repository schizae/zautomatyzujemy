'use client'

import { useEffect } from 'react'

function hasOwnScroll(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  if (target.closest('[role="dialog"], textarea, input, select, [contenteditable="true"]')) return true
  for (let element = target; element !== document.body; element = element.parentElement!) {
    if (!element) break
    if (/(auto|scroll)/.test(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight) return true
  }
  return false
}

export function SmoothScroll() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = matchMedia('(pointer: fine)')
    let frame = 0
    let destination = scrollY
    let lastTime = 0
    let focusTarget: HTMLElement | null = null
    const stop = () => { cancelAnimationFrame(frame); frame = 0; focusTarget = null }
    const tick = (now: number) => {
      const step = Math.min(32, now - lastTime || 16)
      lastTime = now
      if (focusTarget) destination = scrollY + focusTarget.getBoundingClientRect().top - (parseFloat(getComputedStyle(focusTarget).scrollMarginTop) || 0)
      destination = Math.max(0, Math.min(destination, document.documentElement.scrollHeight - innerHeight))
      const remaining = destination - scrollY
      const next = scrollY + remaining * (1 - Math.exp(-step / 145))
      window.scrollTo({ top: Math.abs(remaining) < 1 ? destination : remaining > 0 ? Math.ceil(next) : Math.floor(next), behavior: 'instant' })
      if (Math.abs(remaining) >= 1) { frame = requestAnimationFrame(tick); return }
      frame = 0
      if (focusTarget) {
        const target = focusTarget
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1')
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
        }
        target.focus({ preventScroll: true })
        focusTarget = null
      }
    }
    const start = () => { if (!frame) { lastTime = performance.now(); frame = requestAnimationFrame(tick) } }
    const wheel = (event: WheelEvent) => {
      if (reduced.matches || !pointer.matches || event.defaultPrevented || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || hasOwnScroll(event.target)) return
      event.preventDefault()
      focusTarget = null
      if (!frame) destination = scrollY
      destination += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1)
      start()
    }
    const click = (event: MouseEvent) => {
      stop()
      if (reduced.matches || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return
      const link = event.target.closest('a[href]')
      if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute('download')) return
      const url = new URL(link.href)
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return
      let target: HTMLElement | null
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))) } catch { return }
      if (!target) return
      event.preventDefault()
      destination = scrollY + target.getBoundingClientRect().top - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0)
      focusTarget = target
      if (location.hash !== url.hash) history.pushState(null, '', url.hash)
      start()
    }
    window.addEventListener('wheel', wheel, { passive: false })
    // Capture hash links before Next Link handles navigation and marks the event prevented.
    document.addEventListener('click', click, true)
    const interruptEvents = ['keydown', 'pointerdown', 'touchstart', 'visibilitychange', 'popstate']
    interruptEvents.forEach(event => window.addEventListener(event, stop))
    reduced.addEventListener('change', stop)
    return () => {
      stop()
      window.removeEventListener('wheel', wheel)
      document.removeEventListener('click', click, true)
      interruptEvents.forEach(event => window.removeEventListener(event, stop))
      reduced.removeEventListener('change', stop)
    }
  }, [])
  return null
}
