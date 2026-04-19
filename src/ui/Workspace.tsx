import { motion } from 'motion/react'
import { useApp } from '@/state/store'
import { Renderer } from './a2ui/Renderer'
import { ActivityRibbon } from './ActivityRibbon'
import { fadeRise } from './motion/presets'

export function Workspace() {
  const artifacts = useApp((s) => s.artifacts)
  const refine = useApp((s) => s.refine)
  const selectOption = useApp((s) => s.selectOption)
  const isStreaming = useApp((s) => s.isStreaming)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ActivityRibbon />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {artifacts.length === 0 ? (
          <EmptyWorkspace streaming={isStreaming} />
        ) : (
          <motion.div
            variants={fadeRise}
            initial="initial"
            animate="animate"
            className="max-w-[820px] mx-auto px-8 py-8"
          >
            <Renderer
              artifacts={artifacts}
              onRefine={(label, prompt) => void refine(label, prompt)}
              onSelect={selectOption}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}

function EmptyWorkspace({ streaming }: { streaming: boolean }) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-5 max-w-[420px] text-center">
        <AmbientMark />
        <div className="flex flex-col gap-2">
          <h3 className="display text-[20px] font-medium tracking-tight">The workspace will gather here.</h3>
          <p className="text-[13px] text-muted leading-relaxed">
            {streaming
              ? 'Specialists are working — cards, itineraries, and pricing will appear as they return.'
              : 'Ask for something on the left. The specialists will assemble options — itinerary, hotels, hospitality, pricing — here.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function AmbientMark() {
  return (
    <svg viewBox="0 0 120 120" className="size-[80px]" aria-hidden>
      <defs>
        <linearGradient id="am" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(80% 0.13 85)" />
          <stop offset="1" stopColor="oklch(72% 0.08 200)" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="28" fill="none" stroke="url(#am)" strokeWidth="0.8" opacity="0.85" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="url(#am)" strokeWidth="0.5" opacity="0.45" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#am)" strokeWidth="0.3" opacity="0.2" />
      <circle cx="60" cy="60" r="3.5" fill="url(#am)" />
    </svg>
  )
}
