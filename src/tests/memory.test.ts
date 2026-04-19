import { describe, expect, test } from 'vitest'
import { HashEmbedder, LocalMemoryBackend, MemoryService, cosine } from '@/adk/memory'

describe('MemoryService', () => {
  test('adds and recalls the most similar fact first', async () => {
    const svc = new MemoryService(new (class {
      facts: ReturnType<LocalMemoryBackend['all']> = []
      all() { return this.facts }
      upsert(f: Parameters<LocalMemoryBackend['upsert']>[0]) {
        const i = this.facts.findIndex((x) => x.id === f.id)
        if (i >= 0) this.facts[i] = f
        else this.facts.push(f)
      }
      clear() { this.facts = [] }
    })(), new HashEmbedder())

    await svc.add('Guest prefers business-class flights arriving before local midnight.')
    await svc.add('Guest is vegan.')
    await svc.add('Guest travels in groups of four.')

    const hits = await svc.search('vegan meal', 3)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0]!.fact.text.toLowerCase()).toContain('vegan')
  })

  test('cosine of identical vectors is 1', () => {
    expect(cosine([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 6)
  })

  test('cosine of orthogonal vectors is 0', () => {
    expect(cosine([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 6)
  })
})
