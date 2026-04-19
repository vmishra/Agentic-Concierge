/**
 * Memory — short-term Session state + long-term embedding-backed store.
 *
 * Mirrors ADK's Memory Service: `add` ingests a fact, `search` retrieves
 * top-k by semantic similarity. The Embedder interface is provider-neutral;
 * in the Live path we wire Google's gemini-embedding-2 (multimodal — text,
 * image, audio, video) for production-grade recall. The offline path uses a
 * deterministic hash-based embedder so recall is reproducible without a
 * network call.
 */

export interface MemoryFact {
  id: string
  text: string
  /** Semantic vector (arbitrary dim, but consistent per provider). */
  vector: number[]
  tags?: string[]
  createdAt: number
  source?: string
}

export interface Embedder {
  /** Embed one or more texts into same-dim vectors. */
  embed(texts: string[]): Promise<number[][]>
  dim: number
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0
  let la = 0
  let lb = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const av = a[i]!
    const bv = b[i]!
    dot += av * bv
    la += av * av
    lb += bv * bv
  }
  if (la === 0 || lb === 0) return 0
  return dot / Math.sqrt(la * lb)
}

/**
 * Deterministic hash-based embedder for Mock mode. Not a real semantic
 * model — but *consistent*: identical strings always embed identically, and
 * strings that share many tokens have higher cosine than unrelated ones.
 * That's enough for a scripted demo to show memory recall working.
 */
export class HashEmbedder implements Embedder {
  dim = 128

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.embedOne(t))
  }

  private embedOne(text: string): number[] {
    const v = new Array<number>(this.dim).fill(0)
    const tokens = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean)
    for (const tok of tokens) {
      const h = fnv1a(tok)
      const idx = h % this.dim
      v[idx]! += 1
      // spread to a neighbor to avoid too-sparse vectors
      v[(idx + 7) % this.dim]! += 0.4
    }
    // L2 normalize
    let norm = 0
    for (const x of v) norm += x * x
    norm = Math.sqrt(norm) || 1
    for (let i = 0; i < v.length; i++) v[i]! /= norm
    return v
  }
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h >>> 0
}

export interface MemoryStoreBackend {
  all(): MemoryFact[]
  upsert(fact: MemoryFact): void
  clear(): void
}

export class LocalMemoryBackend implements MemoryStoreBackend {
  private key: string
  private cache: MemoryFact[]

  constructor(key = 'agentic-concierge:memory') {
    this.key = key
    this.cache = this.load()
  }

  all() {
    return [...this.cache]
  }

  upsert(fact: MemoryFact) {
    const i = this.cache.findIndex((f) => f.id === fact.id)
    if (i >= 0) this.cache[i] = fact
    else this.cache.push(fact)
    this.persist()
  }

  clear() {
    this.cache = []
    this.persist()
  }

  private load(): MemoryFact[] {
    try {
      if (typeof localStorage === 'undefined') return []
      const raw = localStorage.getItem(this.key)
      return raw ? (JSON.parse(raw) as MemoryFact[]) : []
    } catch {
      return []
    }
  }

  private persist() {
    try {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(this.key, JSON.stringify(this.cache))
    } catch {
      /* quota — fine for demo */
    }
  }
}

export interface SearchResult {
  fact: MemoryFact
  score: number
}

/**
 * MemoryService — adds + searches + recalls facts. Embedder is swappable:
 * Mock mode injects HashEmbedder, Live mode injects Gemini embeddings.
 */
export class MemoryService {
  private backend: MemoryStoreBackend
  private embedder: Embedder

  constructor(backend: MemoryStoreBackend, embedder: Embedder) {
    this.backend = backend
    this.embedder = embedder
  }

  async add(text: string, opts?: { tags?: string[]; source?: string; id?: string }): Promise<MemoryFact> {
    const [vector] = await this.embedder.embed([text])
    const fact: MemoryFact = {
      id: opts?.id ?? crypto.randomUUID(),
      text,
      vector: vector!,
      tags: opts?.tags,
      createdAt: Date.now(),
      source: opts?.source,
    }
    this.backend.upsert(fact)
    return fact
  }

  async search(query: string, k = 5, minScore = 0.2): Promise<SearchResult[]> {
    const all = this.backend.all()
    if (all.length === 0) return []
    const [qv] = await this.embedder.embed([query])
    const scored: SearchResult[] = all
      .map((fact) => ({ fact, score: cosine(qv!, fact.vector) }))
      .filter((r) => r.score >= minScore)
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, k)
  }

  all() {
    return this.backend.all()
  }
  clear() {
    this.backend.clear()
  }
}
