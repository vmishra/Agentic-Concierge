/**
 * Skills — reusable bundles of (instructions + tools + resources).
 *
 * Skills are the unit of "on-demand context" in this demo. An agent advertises
 * the names of skills it *can* use; the runner only *loads* a skill when the
 * coordinator decides it's needed. Loading attaches the skill's tool bundle
 * to the toolbelt for that turn and injects its instructions into the prompt.
 *
 * This is how progressive disclosure works at the prompting layer — agents
 * start lean and *pull* context, rather than pre-loading everything.
 */

import type { LazyTool, ToolCatalog } from './tool'

export interface Skill {
  name: string
  description: string
  /** Tools this skill contributes (lazy — registered but not executed until called). */
  tools: LazyTool[]
  /** Extra instructions injected when this skill is active on a turn. */
  instructions: string
  /** Optional resources (short strings) inlined when active. */
  resources?: { label: string; body: string }[]
}

export class SkillRegistry {
  private skills = new Map<string, Skill>()

  register(skill: Skill): void {
    this.skills.set(skill.name, skill)
  }

  registerAll(skills: Skill[]): void {
    for (const s of skills) this.register(s)
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name)
  }

  /** Load a skill — registers its tools into the catalog and returns the skill. */
  load(name: string, catalog: ToolCatalog): Skill {
    const skill = this.skills.get(name)
    if (!skill) throw new Error(`skill not registered: ${name}`)
    for (const t of skill.tools) {
      if (!catalog.has(t.manifest.name)) catalog.register(t)
    }
    return skill
  }

  list(): Skill[] {
    return [...this.skills.values()]
  }
}
