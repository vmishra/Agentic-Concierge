import { AnimatePresence, motion } from 'motion/react'
import type { A2UIArtifact } from '@/adk/a2ui'
import { fadeRise } from '@/ui/motion/presets'
import { ItineraryCard } from './Itinerary'
import { OptionCardGrid } from './OptionCardGrid'
import { ComparisonTable } from './ComparisonTable'
import { PricingBreakdown } from './PricingBreakdown'
import { RefinementChips } from './RefinementChips'
import { ResearchScratchpad } from './ResearchScratchpad'
import { MapPreview } from './MapPreview'
import { Dossier } from './Dossier'
import { Note } from './Note'
import { ApprovalCard } from './ApprovalCard'

export interface RendererProps {
  artifacts: A2UIArtifact[]
  onRefine?: (chipLabel: string, prompt?: string) => void
  onSelect?: (artifactId: string, optionId: string) => void
}

export function Renderer({ artifacts, onRefine, onSelect }: RendererProps) {
  return (
    <div className="flex flex-col gap-5">
      <AnimatePresence initial={false}>
        {artifacts.map((a) => (
          <motion.div
            key={a.id}
            layout
            variants={fadeRise}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ArtifactSwitch artifact={a} onRefine={onRefine} onSelect={onSelect} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function ArtifactSwitch({
  artifact,
  onRefine,
  onSelect,
}: {
  artifact: A2UIArtifact
  onRefine?: (label: string, prompt?: string) => void
  onSelect?: (artifactId: string, optionId: string) => void
}) {
  switch (artifact.kind) {
    case 'itinerary':
      return <ItineraryCard artifact={artifact} onRefine={onRefine} />
    case 'option_card_grid':
      return <OptionCardGrid artifact={artifact} onRefine={onRefine} onSelect={onSelect} />
    case 'comparison_table':
      return <ComparisonTable artifact={artifact} />
    case 'pricing_breakdown':
      return <PricingBreakdown artifact={artifact} />
    case 'refinement_chips':
      return <RefinementChips artifact={artifact} onRefine={onRefine} />
    case 'research_scratchpad':
      return <ResearchScratchpad artifact={artifact} />
    case 'map_preview':
      return <MapPreview artifact={artifact} />
    case 'dossier':
      return <Dossier artifact={artifact} />
    case 'note':
      return <Note artifact={artifact} />
    case 'approval_request':
      return <ApprovalCard artifact={artifact} />
  }
}
