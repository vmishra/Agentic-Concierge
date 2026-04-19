import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Brain, Layers, Lightbulb, Sparkles, Wrench, Binoculars, AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useApp } from '@/state/store'
import type { TraceEntry } from '@/adk/types'
import { cn } from '@/lib/cn'
import { chipEnter } from './motion/presets'

/**
 * ActivityRibbon — the "show your work" contract of the demo. Every trace
 * event from the runner renders as a small chip, so viewers can see skills
 * load, tools call, sub-agents dispatch, memory read/write, and context
 * compactions happen live.
 */
export function ActivityRibbon() {
  const traces = useApp((s) => s.traces)
  const isStreaming = useApp((s) => s.isStreaming)
  const activeAgent = useApp((s) => s.activeAgent)

  const recent = useMemo(() => traces.slice(-14), [traces])

  return (
    <div className="shrink-0 hairline-b bg-surface px-6 py-2.5">
      <div className="flex items-center gap-3">
        <AgentPulse label={activeAgent ?? 'standby'} streaming={isStreaming} />
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scroll-smooth">
          <AnimatePresence initial={false}>
            {recent.map((t) => (
              <motion.div
                key={t.id}
                layout
                variants={chipEnter}
                initial="initial"
                animate="animate"
                exit="exit"
                className="shrink-0"
              >
                <TraceChip entry={t} />
              </motion.div>
            ))}
          </AnimatePresence>
          {recent.length === 0 ? (
            <span className="text-[11px] text-subtle">Activity will surface here — skill loads, tool calls, memory, research steps.</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function AgentPulse({ label, streaming }: { label: string; streaming: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2.5 h-7 rounded-full bg-elev-1 border border-[color:var(--border)]">
      <span className="relative flex size-2">
        <span
          className={cn(
            'absolute inset-0 rounded-full',
            streaming ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--border-strong)]',
          )}
        />
        {streaming ? (
          <span
            className="absolute inset-0 rounded-full bg-[color:var(--accent)] animate-ping opacity-60"
            style={{ animationDuration: '1.8s' }}
          />
        ) : null}
      </span>
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted font-medium whitespace-nowrap">{label}</span>
    </div>
  )
}

function TraceChip({ entry }: { entry: TraceEntry }) {
  const { label, icon, tone } = labelFor(entry)
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[10.5px] font-medium whitespace-nowrap',
        tone === 'trace'
          ? 'bg-[color:var(--trace-soft)] border-[color:var(--trace-soft)] text-[color:var(--trace)]'
          : tone === 'accent'
            ? 'bg-[color:var(--accent-soft)] border-[color:var(--accent-soft)] text-[color:var(--accent)]'
            : tone === 'danger'
              ? 'bg-[oklch(68%_0.15_25/0.14)] border-[oklch(68%_0.15_25/0.20)] text-[color:var(--danger)]'
              : 'bg-elev-1 border-[color:var(--border)] text-muted',
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

function labelFor(t: TraceEntry): { label: string; icon: ReactNode; tone: 'neutral' | 'trace' | 'accent' | 'danger' } {
  const e = t.event
  const cls = 'size-[12px]'
  switch (e.kind) {
    case 'skill.load':
      return { label: `skill · ${e.skill}`, icon: <Layers className={cls} strokeWidth={1.7} />, tone: 'trace' }
    case 'tool.load':
      return { label: `tool · load ${e.tool}`, icon: <Wrench className={cls} strokeWidth={1.7} />, tone: 'trace' }
    case 'tool.call':
      return { label: `tool · ${e.tool}`, icon: <Wrench className={cls} strokeWidth={1.7} />, tone: 'neutral' }
    case 'tool.result':
      return { label: `✓ ${e.tool}`, icon: <Wrench className={cls} strokeWidth={1.7} />, tone: 'neutral' }
    case 'tool.error':
      return { label: `! ${e.tool}`, icon: <AlertTriangle className={cls} strokeWidth={1.7} />, tone: 'danger' }
    case 'agent.dispatch':
      return {
        label: `${t.source} → ${e.to}`,
        icon: <Sparkles className={cls} strokeWidth={1.7} />,
        tone: 'accent',
      }
    case 'agent.return':
      return {
        label: `${e.agent} ✓`,
        icon: <Sparkles className={cls} strokeWidth={1.7} />,
        tone: 'neutral',
      }
    case 'memory.read':
      return { label: `memory · ${e.hits} hit${e.hits === 1 ? '' : 's'}`, icon: <Brain className={cls} strokeWidth={1.7} />, tone: 'trace' }
    case 'memory.write':
      return { label: 'memory · write', icon: <Brain className={cls} strokeWidth={1.7} />, tone: 'accent' }
    case 'artifact.emit':
      return { label: `emit · ${e.artifactKind}`, icon: <Lightbulb className={cls} strokeWidth={1.7} />, tone: 'neutral' }
    case 'context.compact':
      return { label: `context · −${e.savedTokens.toLocaleString()}t`, icon: <Layers className={cls} strokeWidth={1.7} />, tone: 'neutral' }
    case 'research.step':
      return {
        label: `research · ${e.status}`,
        icon: <Binoculars className={cls} strokeWidth={1.7} />,
        tone: 'trace',
      }
    case 'thinking':
      return { label: 'thinking…', icon: <Brain className={cls} strokeWidth={1.7} />, tone: 'neutral' }
  }
}
