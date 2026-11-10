import { test, expect } from '@playwright/test';

// Задаємо порожній початковий стан, щоб перезаписати глобальний storageState
test.use({ storageState: { cookies: [], origins: [] } });

test('прийняття та зміна cookies', async ({ page, context }) => {
  test.skip(!!process.env.CI, 'Zara Akamai blocks GitHub Actions datacenter IPs');

  // Крок 1. Відкриваємо сайт Zara за повною адресою
  await page.goto('https://www.zara.com/es/en/');

  // Крок 2. Приймаємо всі cookies через інтерфейс та дочікуємося зникнення банера
  const acceptCookiesButton = page.locator('#onetrust-accept-btn-handler');
  const cookiesBanner = page.locator('#onetrust-banner-sdk');

  await expect(acceptCookiesButton).toBeVisible();
  await acceptCookiesButton.click();
  await expect(acceptCookiesButton).toBeHidden();
  await expect(cookiesBanner).toBeHidden();

  // Крок 3. Отримуємо cookies контексту та перевіряємо їх кількість
  const cookies = await context.cookies();
  expect(cookies.length).toBeGreaterThan(0);

  // Крок 4. Вибираємо одну наявну cookie та змінюємо її значення в контексті браузера
  const targetCookie = cookies[0];
  const { name, domain, path, value: initialValue } = targetCookie;
  const newValue =
    initialValue === 'homework-updated' ? 'homework-updated-new' : 'homework-updated';

  await context.addCookies([
    {
      ...targetCookie,
      value: newValue,
    },
  ]);

  // Крок 5. Повторно отримуємо cookies із браузера та перевіряємо результат через find()
  const updatedCookies = await context.cookies();
  const updatedCookie = updatedCookies.find(
    (cookie) =>
      cookie.name === name && cookie.domain === domain && cookie.path === path
  );

  expect(updatedCookie).toBeDefined();
  expect(updatedCookie?.value).toBe(newValue);
  expect(updatedCookie?.value).not.toBe(initialValue);

  // ============================================================================
  // Просунутий рівень: перевірка збереження атрибутів cookie (name, domain, path)
  // ============================================================================
  expect(updatedCookie?.name).toBe(name);
  expect(updatedCookie?.domain).toBe(domain);
  expect(updatedCookie?.path).toBe(path);
});
