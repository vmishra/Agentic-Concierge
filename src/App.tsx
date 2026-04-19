import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Shell } from './ui/Shell'
import { IntroCurtain, hasSeenIntro, markIntroSeen } from './ui/IntroCurtain'

export default function App() {
  const [seen, setSeen] = useState<boolean>(() => hasSeenIntro())
  const onEnter = () => {
    markIntroSeen()
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
