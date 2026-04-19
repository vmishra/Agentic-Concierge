import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Shell } from './ui/Shell'
import { IntroCurtain } from './ui/IntroCurtain'

const SESSION_KEY = 'agentic-concierge:intro-seen-session'

function readSessionSeen(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}
function markSessionSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* ignore */
  }
}

export default function App() {
  // sessionStorage keeps the flag while the browser tab is alive — so a
  // hard reload in the middle of a demo doesn't replay the curtain. The
  // moment you close the browser (or open a fresh tab) it resets.
  const [seen, setSeen] = useState<boolean>(() => readSessionSeen())
  const onEnter = () => {
    markSessionSeen()
    setSeen(true)
  }
  return (
    <>
      <Shell />
      <AnimatePresence>
        {!seen ? <IntroCurtain key="intro" onEnter={onEnter} /> : null}
      </AnimatePresence>
    </>
  )
}
