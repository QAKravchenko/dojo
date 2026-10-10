import { test, expect, Page } from '@playwright/test';

// 1. Функция авторизации на Dojo
async function login(page: Page, email: string, password: string) {
  await page.goto('http://104.168.59.50/articles');
  await page.getByTestId('nav-sign-in').click();
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  await page.getByTestId('auth-submit').click();

  // Проверка успешной авторизации
  await expect(page.getByTestId('nav-profile')).toContainText('olena');
}

// 2. Функция создания одной статьи
async function createArticle(page: Page, title: string, description: string, body: string) {
  await page.getByTestId('nav-new-article').click();
  await page.getByTestId('editor-title').fill(title);
  await page.getByTestId('editor-description').fill(description);
  await page.getByTestId('editor-body').fill(body);
  await page.getByTestId('editor-submit').click();

  // Ожидание перехода на созданную статью
  await expect(page.getByTestId('article-title')).toHaveText(title);
}

// 3. Функция проверки статьи в Your Feed с учетом пагинации
async function checkArticleInFeed(page: Page, title: string) {
  const article = page.getByTestId('preview-title').filter({ hasText: new RegExp(`^${title}$`) });

  // Если статьи нет на текущей странице, переключаем страницы пагинации
  if (!await article.isVisible()) {
    const pageButtons = page.locator('[data-testid^="pagination-page-"]');
    const totalPages = await pageButtons.count();

    for (let p = 1; p <= totalPages; p++) {
      await page.getByTestId(`pagination-page-${p}`).click();
      if (await article.isVisible()) break;
    }
  }

  // Проверяем, что статья найдена
  await expect(article, `Статья "${title}" не найдена в Your Feed`).toBeVisible();
}

// Сценарий из 3 тестов в заданном порядке
test.describe.serial('Создание 10 статей и проверка Your Feed', () => {
  let page: Page;
  const titles: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. Авторизируйтесь', async () => {
    // Войдите в систему и убедитесь, что авторизация прошла успешно
    await login(page, 'olena@example.com', 'password');
  });

  test('2. Создайте 10 статей', async () => {
    test.setTimeout(60000);
    const runId = Date.now();
    const articles = Array.from({ length: 10 }, (_, i) => `Article ${runId}-${i + 1}`);

    // Создание статей в цикле for...of
    for (const title of articles) {
      await createArticle(page, title, 'Опис статті', 'Текст статті');
      titles.push(title);
    }

    expect(titles).toHaveLength(10);
  });

  test('3. Проверьте Your Feed', async () => {
    // Открываем личную ленту Your Feed
    await page.goto('http://104.168.59.50/articles');
    await page.getByTestId('feed-tab-your').click();
    await expect(page.getByTestId('feed-tab-your')).toHaveAttribute('data-active', 'true');

    // Ожидаем появление в ленте последней созданной статьи
    const latestArticle = page.getByTestId('preview-title').filter({ hasText: new RegExp(`^${titles[titles.length - 1]}$`) });
    await expect(latestArticle).toBeVisible();

    // Проверяем наличие каждой из 10 статей в цикле for...of
    for (const title of titles) {
      await checkArticleInFeed(page, title);
    }
  });
});