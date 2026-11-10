import { test, expect } from '@playwright/test';
import { ArticlesPage } from '../pages/ArticlesPage';

// ============================================================================
// 1. Базова задача: підтвердження авторизації через globalSetup і storageState
// ============================================================================

test.describe('Авторизація через storageState', () => {
  test('користувач уже авторизований при відкритті сторінки статей без повторного UI-входу', async ({
    page,
  }) => {
    const articlesPage = new ArticlesPage(page);

    // Відкриваємо сторінку застосунку зі статтями (без заповнення форми входу)
    await articlesPage.goto();

    // Перевіряємо ознаки авторизованого користувача
    await expect(articlesPage.userProfileNavLink).toBeVisible();
    await expect(page.getByTestId('nav-profile')).toContainText('olena');
    await expect(articlesPage.newArticleNavLink).toBeVisible();
    await expect(page.getByTestId('feed-tab-your')).toBeVisible();
    await expect(articlesPage.signInNavLink).toBeHidden();
  });
});

// ============================================================================
// 2. Просунутий рівень: перевірка іншої початкової сесії (без авторизації)
// ============================================================================

test.describe('Сесія з порожнім storageState (без авторизації)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('користувач починає роботу без авторизації при порожньому storageState', async ({
    page,
  }) => {
    const articlesPage = new ArticlesPage(page);

    await articlesPage.goto();

    // Перевіряємо, що елементи авторизованого користувача відсутні, а кнопки входу/реєстрації видимі
    await expect(articlesPage.signInNavLink).toBeVisible();
    await expect(page.getByTestId('nav-sign-up')).toBeVisible();
    await expect(articlesPage.userProfileNavLink).toBeHidden();
    await expect(articlesPage.newArticleNavLink).toBeHidden();
  });
});
