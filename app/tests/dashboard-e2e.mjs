import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:3001';
const rootPath = new URL(baseURL).pathname.replace(/\/?$/, '/');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(60_000);
const consoleErrors = [];
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push({ text: message.text(), url: message.location().url });
});
page.on('pageerror', error => consoleErrors.push({ text: error.message, url: page.url() }));

async function openQ3() {
  await page.getByRole('button', { name: /2016 Q3 Forecast · Editable/i }).click();
  await page.waitForURL('**/q3');
  await page.getByRole('spinbutton', { name: 'Price € EU P1' }).waitFor();
}

async function openQ2() {
  await page.getByRole('button', { name: /Q2 OFFICIAL ACTUAL · LOCKED/i }).click();
  await page.waitForURL(url => url.pathname === rootPath);
}

try {
  await page.goto(baseURL + '/');
  const q2 = page.locator('section').filter({ hasText: '2016 Q2 — Official actual results' });
  const originalQ2 = await q2.innerText();
  for (const value of ['€860,997', '€62,489', '€1,051,507']) {
    assert(originalQ2.includes(value), `Missing official Q2 value ${value}`);
  }
  assert.equal(await q2.locator('input').count(), 0, 'Q2 Actual must be read-only');

  await openQ3();
  const q3Price = page.getByRole('spinbutton', { name: 'Price € EU P1' });
  await q3Price.fill('455');
  assert.equal(await q3Price.inputValue(), '455');

  await openQ2();
  assert.equal(await q2.innerText(), originalQ2, 'Q2 Actual changed after editing Q3');
  await openQ3();
  assert.equal(await q3Price.inputValue(), '455', 'Q3 edits must survive Q2/Q3 navigation');

  await page.getByRole('button', { name: /^2016 Q4/ }).click();
  const q4Price = page.getByRole('spinbutton', { name: 'Price € EU P1' });
  const q4Before = await q4Price.inputValue();
  await page.getByRole('button', { name: '2016 Q3', exact: true }).click();
  await page.getByRole('button', { name: /Apply Strategy 2/i }).click();
  assert((await page.locator('body').innerText()).includes('Q3 inputs: Strategy 2 · Aggressive revenue recovery'));
  await page.getByRole('button', { name: /^2016 Q4/ }).click();
  assert.equal(await q4Price.inputValue(), q4Before, 'Applying a Q3 strategy must not alter Q4');

  assert.deepEqual(consoleErrors, [], `Browser console errors: ${JSON.stringify(consoleErrors)}`);
  console.log('PASS: locked Q2, persistent Q3 edits, isolated strategy presets, and no browser errors.');
} finally {
  await browser.close();
}
