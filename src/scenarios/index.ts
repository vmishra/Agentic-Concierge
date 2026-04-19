import type { ScenarioScript } from '@/adk/providers/mock'
import { f1AbuDhabiScript } from './f1-abu-dhabi'
import { wimbledonScript } from './wimbledon'
import { cricketScript } from './cricket'

/** A mergeable script — each script contributes beats for its sport/intent. */
export function composeScripts(...scripts: ScenarioScript[]): ScenarioScript {
  const beats: ScenarioScript['beats'] = {}
  for (const s of scripts) {
    for (const [agent, list] of Object.entries(s.beats)) {
      beats[agent] = [...(beats[agent] ?? []), ...list]
    }
  }
  return { name: scripts.map((s) => s.name).join('+'), beats }
}

export const allScenarios: ScenarioScript = composeScripts(
  f1AbuDhabiScript,
  wimbledonScript,
  cricketScript,
)

export { f1AbuDhabiScript, wimbledonScript, cricketScript }
