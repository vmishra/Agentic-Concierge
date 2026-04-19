import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Shell } from './ui/Shell'
import { IntroCurtain } from './ui/IntroCurtain'

export default function App() {
  // Intentionally ephemeral — every hard reload shows the curtain again so the
  // overture never gets "used up" during a demo session.
  const [seen, setSeen] = useState<boolean>(false)
  return (
    <>
      <Shell />
      <AnimatePresence>
        {!seen ? <IntroCurtain key="intro" onEnter={() => setSeen(true)} /> : null}
      </AnimatePresence>
    </>
  )
}
