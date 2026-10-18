const { chromium } = require('/Users/weitzu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = 'deliverables/website-v3-validation';
const base = process.env.PCP_QA_BASE || 'http://127.0.0.1:3122';
const slugs = ['', 'pcp-systems', 'downhole-pumps', 'pcp-elastomers', 'surface-drive-pcp', 'engineering-inquiry', 'request-quote', 'technical-resources'];
(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const report = { base, checkedAt: new Date().toISOString(), automatedAccessibility: [], navigation: [], errors: [], caveat: 'Automated WCAG checks and task tests do not establish complete accessibility or legal compliance.' };
  try {
    for (const width of [375, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(() => { window.__PCP_INTERNAL_QA__=true; });
      const page = await context.newPage();
      page.on('pageerror', error => report.errors.push(error.message));
      for (const slug of slugs) {
        const response = await page.goto(`${base}/en${slug ? '/' + slug : ''}`, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('main#main-content').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        await page.addScriptTag({ path: '/private/tmp/pcpump-design-audit/node_modules/axe-core/axe.min.js' });
        const result = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
        report.automatedAccessibility.push({ width, slug: slug || 'home', violations: result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), incompleteChecks: result.incomplete.map(v => v.id), passedRules: result.passes.length });
        if (slug === 'request-quote') {
          assert.equal(await page.getByRole('button', { name: 'Review brief', exact: true }).count(), 1);
          assert.equal(await page.getByRole('button', { name: 'Save preview inquiry', exact: true }).count(), 0);
          assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://www.pcpump.com/en/engineering-inquiry');
        }
      }
      await page.goto(`${base}/en`, { waitUntil: 'networkidle' });
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip-link').evaluate(e => e === document.activeElement), true);
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.activeElement.id === 'main-content');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
      const navigation = width < 1000 ? page.getByRole('navigation', { name: 'Mobile navigation' }) : page.getByRole('navigation', { name: 'Primary navigation' });
      if (width < 1000) await page.locator('.mobile-menu summary').click();
      await navigation.getByRole('link', { name: /Engineering inquiry/ }).click();
      await page.waitForURL('**/en/engineering-inquiry');
      report.navigation.push({ width, headerInquiry: 'pass', legacyInquiry: 'pass', keyboardSkip: 'pass' });
      await context.close();
    }
    fs.writeFileSync(`${out}/design-audit.json`, JSON.stringify(report, null, 2));
    assert.equal(report.errors.length, 0);
    assert.equal(report.automatedAccessibility.reduce((n, p) => n + p.violations.length, 0), 0);
    console.log('PASS: all rendered page/viewport accessibility checks, keyboard skip, header conversion links and legacy inquiry alias. See JSON for manual-review limitations.');
  } finally { fs.writeFileSync(`${out}/design-audit.json`, JSON.stringify(report, null, 2)); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
