/**
 * shoot.mjs — drive the running dev server and capture polished screenshots
 * of every major screen to docs/screens/.
 *
 *   node scripts/shoot.mjs
 *
 * Pre-requisites: dev server running on http://localhost:5173 and
 * puppeteer installed.
 */

import puppeteer from 'puppeteer'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'docs', 'screens')
await mkdir(OUT, { recursive: true })

const URL = 'http://localhost:5173/'
const SIZE = { width: 1600, height: 1000 }

function log(msg) { console.log(`· ${msg}`) }

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: SIZE,
  args: ['--window-size=1600,1000', '--force-device-scale-factor=2'],
})
const page = await browser.newPage()
page.setDefaultTimeout(30_000)
await page.setViewport({ ...SIZE, deviceScaleFactor: 2 })

async function snap(name, opts = {}) {
  const out = join(OUT, `${name}.png`)
  await page.screenshot({ path: out, fullPage: false, ...opts })
  log(`captured ${name}.png`)
}

async function dismissIntro() {
  try {
    await page.waitForSelector('button[aria-label="Agent Concierge · welcome"], button:has-text("step inside")', { timeout: 3000 })
  } catch { /* no intro */ }
  // Click the "step inside" button
  const buttons = await page.$$('button')
  for (const btn of buttons) {
    const txt = await page.evaluate((b) => b.textContent?.trim() ?? '', btn)
    if (/step inside/i.test(txt)) {
      await btn.click()
      return
    }
  }
}

async function clickByText(text) {
  const buttons = await page.$$('button')
  for (const btn of buttons) {
    const txt = await page.evaluate((b) => b.textContent?.replace(/\s+/g, ' ').trim() ?? '', btn)
    if (txt.toLowerCase().includes(text.toLowerCase())) {
      await btn.click()
      return true
    }
  }
  return false
}

async function typeInChat(prompt) {
  const ta = await page.waitForSelector('textarea')
  await ta.click({ clickCount: 3 })
  await page.keyboard.press('Backspace')
  await page.type('textarea', prompt)
  await page.keyboard.press('Enter')
}

// ---------------------------------------------------------------------------
// 1. Intro curtain — fresh session
// ---------------------------------------------------------------------------
log('intro curtain')
await page.evaluateOnNewDocument(() => {
  try { sessionStorage.clear(); localStorage.clear() } catch {}
})
await page.goto(URL, { waitUntil: 'networkidle2' })
await sleep(2500)
await snap('01-intro-curtain')

// ---------------------------------------------------------------------------
// 2. Empty state (after dismissing)
// ---------------------------------------------------------------------------
log('empty state')
await dismissIntro()
await sleep(1800)
await snap('02-empty-state')

// ---------------------------------------------------------------------------
// 3. F1 scenario in progress
// ---------------------------------------------------------------------------
log('F1 scenario')
await clickByText('Four of us, F1 Abu Dhabi in November')
await sleep(14000) // wait for full intro beat + specialists to settle
await snap('03-f1-scenario')

// ---------------------------------------------------------------------------
// 4. After a refinement click
// ---------------------------------------------------------------------------
log('pit-lane refinement')
await clickByText('Closer to the pit lane')
await sleep(9000)
await snap('04-pit-lane-refinement')

// ---------------------------------------------------------------------------
// 5. HITL approval card (proceed flow)
// ---------------------------------------------------------------------------
log('approval gate')
await clickByText('Proceed')
await sleep(7000)
await snap('05-approval-gate')

// ---------------------------------------------------------------------------
// 6. Dossier + share button
// ---------------------------------------------------------------------------
log('dossier')
await clickByText('Approve and proceed')
await sleep(9000)
// Scroll workspace to bottom to show the dossier
await page.evaluate(() => {
  const panes = document.querySelectorAll('[class*="overflow-y-auto"]')
  for (const p of panes) p.scrollTop = p.scrollHeight
})
await sleep(1200)
await snap('06-dossier')

// ---------------------------------------------------------------------------
// 7. Share dossier — PDF preview
// ---------------------------------------------------------------------------
log('dossier share PDF')
await clickByText('Share dossier')
await sleep(2000)
await snap('07-dossier-pdf')

// Close dialog
await page.keyboard.press('Escape')
await sleep(1000)

// ---------------------------------------------------------------------------
// 8. Under the hood — first slide
// ---------------------------------------------------------------------------
log('under the hood')
await clickByText('under the hood')
await sleep(1800)
await snap('08-under-the-hood')

// ---------------------------------------------------------------------------
// 9. Immersive flow — play the whole thing
// ---------------------------------------------------------------------------
log('immersive flow')
await clickByText('play the full flow')
await sleep(11000) // let it play into act 3 or 4
await snap('09-immersive-flow')

// close
await page.keyboard.press('Escape')
await sleep(600)
await page.keyboard.press('Escape')
await sleep(800)

// ---------------------------------------------------------------------------
// 10. Behind the scenes — annual planning board
// ---------------------------------------------------------------------------
log('behind the scenes · board')
await clickByText('behind the scenes')
await sleep(2200)
await snap('10-behind-scenes-board')

// ---------------------------------------------------------------------------
// 11. Behind the scenes — world reach
// ---------------------------------------------------------------------------
log('behind the scenes · world')
await clickByText('Global reach')
await sleep(2000)
await snap('11-behind-scenes-world')

// ---------------------------------------------------------------------------
// 12. Behind the scenes — event deep dive
// ---------------------------------------------------------------------------
log('behind the scenes · deep dive')
await clickByText('Event deep dive')
await sleep(2000)
await snap('12-behind-scenes-deep-dive')

// ---------------------------------------------------------------------------
// 13. Behind the scenes — persona
// ---------------------------------------------------------------------------
log('behind the scenes · persona')
await clickByText('Persona & targeting')
await sleep(1600)
await snap('13-behind-scenes-persona')

// close
await page.keyboard.press('Escape')
await sleep(800)

// ---------------------------------------------------------------------------
// 14. Hyper care — iPhone cinematic
// ---------------------------------------------------------------------------
log('hyper care')
await clickByText('hyper care')
await sleep(12000) // let it play through a few beats
await snap('14-hyper-care')

await page.keyboard.press('Escape')
await sleep(600)

// ---------------------------------------------------------------------------
// 15. Settings
// ---------------------------------------------------------------------------
log('settings')
await page.click('button[aria-label="Settings"]').catch(() => {})
await sleep(1200)
await snap('15-settings')

await browser.close()
log('done')
