import { useEffect, useRef, useState } from 'react'

// True once the element has been at least partly visible on screen (then stays true). Used to start
// an animation when the candidate scrolls to it. Without IntersectionObserver, true at once.
export function useInView(threshold = 0.25) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView]
}
