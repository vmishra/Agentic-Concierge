import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, Mic, Paperclip, Square } from 'lucide-react'
import { useApp } from '@/state/store'
import { cn } from '@/lib/cn'
import { fadeRise, spring } from './motion/presets'

export function ChatPane() {
  const messages = useApp((s) => s.messages)
  const isStreaming = useApp((s) => s.isStreaming)
  const send = useApp((s) => s.sendMessage)
  const cancel = useApp((s) => s.cancel)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isStreaming])

  async function onSubmit(e?: FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    await send(text)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {isEmpty ? <EmptyState onPick={(q) => send(q)} /> : <Transcript />}
      </div>
      <form
        onSubmit={onSubmit}
        className="shrink-0 p-3 bg-elev-1"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div
          className={cn(
            'flex flex-col gap-2 rounded-[var(--radius-lg)] bg-surface-raised border border-[color:var(--border)] p-2.5',
            'focus-within:border-[color:var(--border-strong)] transition-colors',
          )}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder={isEmpty ? 'What shall we arrange?' : 'Refine, ask for alternatives, or say proceed.'}
            className="w-full resize-none bg-transparent outline-none text-[14px] text-text placeholder:text-subtle leading-relaxed"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <AffordanceIcon icon={<Paperclip className="size-3.5" strokeWidth={1.5} />} label="Attach file" />
              <AffordanceIcon icon={<Mic className="size-3.5" strokeWidth={1.5} />} label="Dictate" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] text-subtle numeric">
                <kbd className="font-mono text-[10px]">↵</kbd> to send
              </span>
              {isStreaming ? (
                <button
                  type="button"
                  onClick={cancel}
                  className="h-8 px-3 rounded-[var(--radius-sm)] bg-elev-2 text-muted hover:text-text text-[12px] font-medium flex items-center gap-1.5 border border-[color:var(--border)]"
                >
                  <Square className="size-3" strokeWidth={2} />
                  Pause
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                    'bg-[color:var(--accent)] text-[oklch(16%_0_0)]',
                    'disabled:opacity-30 disabled:pointer-events-none',
                    'transition-[transform,filter] duration-150 hover:brightness-[1.04] active:scale-95',
                  )}
                  aria-label="Send"
                >
                  <ArrowUp className="size-4" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function AffordanceIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="size-7 rounded-md flex items-center justify-center text-subtle hover:text-text hover:bg-elev-2 transition-colors"
    >
      {icon}
    </button>
  )
}

const suggestions = [
  {
    label: 'Four of us, F1 Abu Dhabi in November. One uses a wheelchair. Budget ~₹50L.',
    tone: 'accent' as const,
  },
  { label: 'Wimbledon 2026 for a family of six — three adults, three children.', tone: 'neutral' as const },
  { label: 'India vs Australia Test at Wankhede, corporate group of 10.', tone: 'neutral' as const },
]

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <motion.div
      variants={fadeRise}
      initial="initial"
      animate="animate"
      className="h-full flex flex-col items-center justify-center p-8 gap-8 text-center"
    >
      <div className="flex flex-col gap-3 max-w-[320px]">
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium">welcome</span>
        <h2 className="display text-[30px] font-medium leading-tight tracking-tight">What shall we arrange?</h2>
        <p className="text-[13px] text-muted leading-relaxed">
          A few specialists are ready — research, logistics, experience, budget, and a personaliser. Tell me what you
          have in mind; I will thread the rest.
        </p>
      </div>
      <div className="w-full flex flex-col gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(s.label)}
            className={cn(
              'group text-left rounded-[var(--radius-md)] px-3.5 py-3 border border-[color:var(--border)]',
              'bg-elev-1 hover:bg-elev-2 transition-colors',
              'text-[13px] text-muted hover:text-text leading-relaxed',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function Transcript() {
  const messages = useApp((s) => s.messages)
  const visible = useMemo(() => messages.filter((m) => m.role === 'user' || (m.role === 'assistant' && (m.content || m.streaming))), [messages])
  return (
    <div className="flex flex-col gap-4 p-5">
      <AnimatePresence initial={false}>
        {visible.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: spring }}
          >
            {m.role === 'user' ? (
              <UserBubble text={m.content} />
            ) : (
              <AgentBubble text={m.content} streaming={m.streaming} agent={m.agent ?? 'Concierge'} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="rounded-[var(--radius-lg)] bg-[color:var(--accent-soft)] text-text px-4 py-2.5 max-w-[85%] text-[13.5px] leading-relaxed">
        {text}
      </div>
    </div>
  )
}

function AgentBubble({ text, streaming, agent }: { text: string; streaming?: boolean; agent: string }) {
  return (
    <div className="flex flex-col gap-1 max-w-[90%]">
      <span className="text-[10.5px] uppercase tracking-[0.14em] text-subtle font-medium">{agent}</span>
      <p className="text-[13.5px] text-text leading-relaxed whitespace-pre-line">
        {text}
        {streaming ? <span className="inline-block w-[1px] h-3.5 bg-[color:var(--accent)] ml-0.5 align-middle animate-pulse" /> : null}
      </p>
    </div>
  )
}
