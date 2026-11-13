import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

// Uses only mocked Auth/PostgREST responses. No real accounts or database writes.
const base = process.env.REVIEW_BASE_URL ?? 'http://127.0.0.1:5173'
const output = 'docs/revisiones/evidencias'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
const user = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'revision@example.invalid', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, identities: [], created_at: '2026-01-01T00:00:00Z' }
const exp = Math.floor(Date.now() / 1000) + 3600
const jwt = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp })).toString('base64url'), 'testsignature'].join('.')
const session = { access_token: jwt, refresh_token: 'mock-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp, user }
try {
  for (const width of [1280, 390]) {
    for (const redirect of ['https://ejemplo.com', '//ejemplo.com']) {
      const context = await browser.newContext({ viewport: { width, height: 900 } })
      const page = await context.newPage()
      const requests = []
      await page.route('**/auth/v1/**', async route => {
        requests.push(new URL(route.request().url()).pathname)
        await route.fulfill({ json: route.request().url().includes('/token') ? session : user })
      })
      await page.route('**/rest/v1/**', route => route.fulfill({ json: { id: user.id, nombre: 'Revisión', rol: 'operador', creado_en: user.created_at } }))
      await page.goto(`${base}/login?redirect=${encodeURIComponent(redirect)}`)
      await page.waitForLoadState('networkidle')
      await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(user.email)
      await page.getByLabel('Contraseña', { exact: true }).fill('MockPassword123!')
      await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
      await page.waitForTimeout(1500)
      assert.equal(new URL(page.url()).origin, new URL(base).origin)
      results.push({ width, test: 'redirect', payload: redirect, finalPath: new URL(page.url()).pathname, externalNavigation: false })
      await page.screenshot({ path: `${output}/redirect-${width}-${redirect.startsWith('https') ? 'https' : 'double-slash'}.png`, fullPage: true })
      await context.close()
    }
    {
      const context = await browser.newContext({ viewport: { width, height: 900 } })
      const page = await context.newPage()
      await page.route('**/auth/v1/**', route => route.fulfill({ json: session }))
      await page.route('**/rest/v1/**', route => route.fulfill({ status: 406, json: { code: 'PGRST116', message: 'No rows', details: '0 rows' } }))
      await page.goto(`${base}/login`)
      await page.waitForLoadState('networkidle')
      await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(user.email)
      await page.getByLabel('Contraseña', { exact: true }).fill('MockPassword123!')
      await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
      await page.getByRole('heading', { name: 'Inicio', exact: true }).waitFor()
      results.push({ width, test: 'missing-profile-existing-medium-finding', panelVisible: true, accessDeniedScreen: false })
      await page.screenshot({ path: `${output}/sin-perfil-${width}.png`, fullPage: true })
      await context.close()
    }
    // Recovery event is delivered by the real SDK from a mocked recovery link.
    {
      const context = await browser.newContext({ viewport: { width, height: 900 } })
      const page = await context.newPage()
      let updates = 0
      await page.route('**/auth/v1/**', async route => {
        if (route.request().method() === 'PUT') updates++
        await route.fulfill({ json: user })
      })
      const fragment = new URLSearchParams({ access_token: jwt, refresh_token: 'mock-refresh', expires_in: '3600', token_type: 'bearer', type: 'recovery' })
      await page.goto(`${base}/reset-password#${fragment}`)
      await page.waitForLoadState('networkidle')
      await page.getByLabel('Nueva contraseña', { exact: true }).fill('MockNewPassword123!')
      await page.getByLabel('Confirmar nueva contraseña').fill('MockNewPassword123!')
      await page.getByRole('button', { name: 'Guardar nueva contraseña' }).click()
      await page.getByText(/Tu contraseña ha sido actualizada/).waitFor()
      assert.equal(updates, 1)
      results.push({ width, test: 'valid-password-recovery', sdkEvent: true, passwordUpdates: updates })
      await context.close()
    }
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    await page.goto(`${base}/reset-password`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: 'Solicitar enlace de recuperación' }).waitFor()
    assert.equal(await page.locator('input').count(), 0)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.screenshot({ path: `${output}/reset-directo-${width}.png`, fullPage: true })
    results.push({ width, test: 'reset-directo', formHidden: true, recoveryLink: true, noHorizontalOverflow: true })
    await page.goto(`${base}/ventas`)
    await page.waitForLoadState('networkidle')
    assert.equal(new URL(page.url()).pathname, '/login')
    results.push({ width, test: 'protected-without-session', finalPath: '/login' })
    await context.close()
  }
  await writeFile(`${output}/navegador.json`, JSON.stringify(results, null, 2) + '\n')
  process.stdout.write(JSON.stringify(results, null, 2) + '\n')
} finally {
  await browser.close()
}
