import { test, expect, type Page, type BrowserContext } from '@playwright/test';

// --- Hulpfuncties ---
async function preventGdprBanner(context: BrowserContext) {
  await context.addInitScript(() => {
    window.localStorage.setItem('gdpr-consent-choice', 'accept');
  });
}

async function solveCaptchaAndSubmit(page: Page, uniqueId: string) {
  const captchaLabel = page.locator('label[for="captchaAnswer"]');
  await expect(captchaLabel).toContainText(/Hoeveel is [1-9]/, { timeout: 10000 });

  const captchaText = await captchaLabel.textContent();
  
  if (!captchaText) throw new Error("Kan Captcha som niet vinden op de pagina!");

  const numbers = captchaText.match(/\d+/g);
  if (!numbers || numbers.length < 2) throw new Error("Kon geen getallen vinden in captcha tekst");

  const sum = parseInt(numbers[0]) + parseInt(numbers[1]);
  console.log(`[Test] Captcha gevonden: ${numbers[0]} + ${numbers[1]} = ${sum}`);

  await page.fill('input[name="captchaAnswer"]', sum.toString());
  await page.fill('input[name="firstName"]', 'Test');
  await page.fill('input[name="lastName"]', `Visitor ${uniqueId}`);
  await page.fill('input[name="email"]', 'visitor@example.com');
  await page.fill('input[name="phone"]', '0612345678');
  await page.fill('input[name="subject"]', `E2E Test ${uniqueId}`);
  await page.fill('textarea[name="message"]', 'Dit is een automatisch bericht van Playwright.');

  await page.getByRole('button', { name: /verstuur|verzenden|send/i }).click();
}

// --- Test 1: De Happy Flow (Bezoeker) ---
test('Bezoeker kan succesvol contactformulier versturen', async ({ context, page }) => {
  await preventGdprBanner(context);

  const uniqueId = Date.now().toString();  

  await page.goto('/contact');
  await solveCaptchaAndSubmit(page, uniqueId);

  await expect(page.getByText(/succes|gelukt|sent|verzonden/i)).toBeVisible();
});

// --- Test 2: Realtime Notificatie (Admin + Bezoeker) ---
test('Admin ontvangt realtime notificatie bij nieuw bericht', async ({ browser }) => {
  
  // Stap A: Admin logt in (Context 1)
  const adminContext = await browser.newContext();
  await preventGdprBanner(adminContext);
  const adminPage = await adminContext.newPage();

  await adminPage.goto('/admin');

  await adminPage.fill('input[name="email"]', 'admin@showcase.com'); 
  await adminPage.fill('input[name="password"]', 'Admin123!');
  await adminPage.getByRole('button', { name: /inloggen|login/i }).click();

  await expect(adminPage).toHaveURL(/\/dashboard/);
  
  // Stap B: Bezoeker stuurt bericht (Context 2 - Schone browser)
  const visitorContext = await browser.newContext();
  await preventGdprBanner(visitorContext);
  const visitorPage = await visitorContext.newPage();
  
  const uniqueId = Date.now().toString();
  const uniqueName = `Visitor ${uniqueId}`;

  await visitorPage.goto('/contact');
  await solveCaptchaAndSubmit(visitorPage, uniqueId);
  await expect(visitorPage.getByText('Bericht Verzonden!')).toBeVisible();

  // Stap C: Check bij Admin (Realtime update)
  await expect(adminPage.getByText(uniqueName)).toBeVisible();
  
  console.log('[Test] Realtime notificatie succesvol ontvangen!');
});