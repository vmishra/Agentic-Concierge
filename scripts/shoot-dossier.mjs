/**
 * Narrowly re-shoot the Dossier + share-PDF screens.
 */

import puppeteer from 'puppeteer'
import { setTimeout as sleep } from 'node:timers/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'docs', 'screens')
const URL = 'http://localhost:5173/'
const SIZE = { width: 1600, height: 1000 }

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: SIZE,
  args: ['--window-size=1600,1000'],
})
const page = await browser.newPage()
await page.setViewport({ ...SIZE, deviceScaleFactor: 2 })
page.setDefaultTimeout(30_000)

async function snap(name) {
  await page.screenshot({ path: join(OUT, `${name}.png`) })
  console.log('· ' + name)
}

// Click a button whose trimmed text exactly equals the given label.
async function clickChip(label) {
  const handles = await page.$$('button')
  for (const h of handles) {
    const t = await page.evaluate((b) => (b.textContent ?? '').trim(), h)
    if (t === label) { await h.click(); return true }
  }
  return false
}
async function clickLastByText(text) {
  const handles = await page.$$('button')
  const matches = []
  for (const h of handles) {
    const t = await page.evaluate((b) => (b.textContent ?? '').trim(), h)
    if (t.toLowerCase().includes(text.toLowerCase())) matches.push(h)
  }
  if (!matches.length) return false
  await matches[matches.length - 1].click()
  return true
}

async function dismissIntro() {
  const handles = await page.$$('button')
  for (const h of handles) {
    const t = await page.evaluate((b) => (b.textContent ?? '').trim(), h)
    if (/step inside/i.test(t)) { await h.click(); return }
  }
}

await page.evaluateOnNewDocument(() => { try { sessionStorage.clear() } catch {} })
await page.goto(URL, { waitUntil: 'networkidle2' })
await sleep(1800)
await dismissIntro()
await sleep(1200)

// Type the F1 request directly instead of clicking a seeded card.
const ta = await page.waitForSelector('textarea')
await ta.click()
await page.type('textarea', 'Four of us, F1 Abu Dhabi in November. One uses a wheelchair. Budget ~₹50L.')
await page.keyboard.press('Enter')
console.log('sent initial request')
await sleep(26000) // full intro + all 4 sub-agents + assemble

// Type "proceed" into the textarea — most reliable.
const ta2 = await page.waitForSelector('textarea')
await ta2.click()
await page.type('textarea', 'proceed')
await page.keyboard.press('Enter')
console.log('typed proceed')
await sleep(10000)

// Scroll the workspace all the way down so approval + dossier are visible
await page.evaluate(() => {
  document.querySelectorAll('[class*="overflow-y-auto"]').forEach((p) => { p.scrollTop = p.scrollHeight })
})
await sleep(1200)
await snap('05-approval-gate')

// Scroll up a bit so approval card is visible in the workspace
await page.evaluate(() => {
  document.querySelectorAll('[class*="overflow-y-auto"]').forEach((p) => {
    p.scrollTop = p.scrollHeight
  })
})
await sleep(600)
// Click Approve and proceed (button inside ApprovalCard)
const approved = await clickLastByText('Approve and proceed')
console.log('approved:', approved)
await sleep(10000)

// Scroll to very bottom
await page.evaluate(() => {
  document.querySelectorAll('[class*="overflow-y-auto"]').forEach((p) => { p.scrollTop = p.scrollHeight })
})
await sleep(1200)
await snap('06-dossier')

// Now click Share dossier to open the PDF preview
const shared = await clickLastByText('Share dossier')
console.log('share clicked:', shared)
await sleep(2200)
await snap('07-dossier-pdf')

await browser.close()
console.log('done')
