import { SkillRegistry } from '@/adk/skill'
import { eventCatalogSkill } from './event-catalog'
import { hospitalityTiersSkill } from './hospitality-tiers'
import { travelLogisticsSkill } from './travel-logistics'
import { dietaryAccessibilitySkill } from './dietary-accessibility'
import { giftingNarrativeSkill } from './gifting-narrative'

export function buildSkillRegistry(): SkillRegistry {
  const r = new SkillRegistry()
  r.registerAll([
    eventCatalogSkill,
    hospitalityTiersSkill,
    travelLogisticsSkill,
    dietaryAccessibilitySkill,
    giftingNarrativeSkill,
  ])
  return r
}

export {
  eventCatalogSkill,
  hospitalityTiersSkill,
  travelLogisticsSkill,
  dietaryAccessibilitySkill,
  giftingNarrativeSkill,
}
