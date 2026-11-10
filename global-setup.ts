import { chromium, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ArticlesPage } from './pages/ArticlesPage';

const authFile = 'playwright/.auth/user.json';

export default async function globalSetup(): Promise<void> {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      baseURL: 'http://104.168.59.50/articles',
    });
    const page = await context.newPage();
    const articlesPage = new ArticlesPage(page);

    // 1. Відкриваємо застосунок і переходимо до форми входу та авторизуємося
    await articlesPage.goto();
    await articlesPage.login('olena@example.com', 'password');

    // 2. Дочікуємося надійних ознак завершення авторизації (UI + токен у localStorage)
    await expect(page).toHaveURL('http://104.168.59.50/articles');
    await expect(articlesPage.userProfileNavLink).toBeVisible();
    await expect(articlesPage.newArticleNavLink).toBeVisible();
    await page.waitForFunction(() => Boolean(window.localStorage.getItem('qa-dojo.token')));

    // 3. Зберігаємо стан авторизації у файл
    await context.storageState({ path: authFile });
  } finally {
    // 4. Завжди закриваємо браузер підготовки
    await browser.close();
  }
}
