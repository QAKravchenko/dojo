// Импортируем функции test и expect из библиотеки Playwright
import { test, expect } from '@playwright/test';
// Импортируем класс Page Object страницы статей ArticlesPage
import { ArticlesPage } from '../pages/ArticlesPage';
import { getTestData } from '../test-data';

// Группируем тесты для раздела статей QA Dojo
test.describe('QA Dojo - Articles Login & Search', () => {
    test.use({ storageState: { cookies: [], origins: [] } });
    let articlesPage: ArticlesPage;

    // Перед каждым тестом инициализируем Page Object и открываем страницу статей
    test.beforeEach(async ({ page }) => {
        articlesPage = new ArticlesPage(page);
        await articlesPage.goto();
    });

    // Тест №1: успешная авторизация на сайте
    test('should log in successfully with credentials', async ({ page }, testInfo) => {
        const testData = getTestData(testInfo.project.name).articles;
        // Выполняем вход с данными текущего окружения
        await articlesPage.login(testData.userEmail, testData.userPassword);

        // Проверяем, что произошел редирект обратно на страницу /articles
        await expect(page).toHaveURL('http://104.168.59.50/articles');
        // Проверяем, что в шапке появились ссылка на профиль пользователя и кнопка "New article"
        await expect(articlesPage.userProfileNavLink).toBeVisible();
        await expect(articlesPage.newArticleNavLink).toBeVisible();
    });

    // Тест №2: поиск статьи по ключевому слову
    test('should search and find an article by headline keyword', async ({}, testInfo) => {
        const testData = getTestData(testInfo.project.name).articles;
        // Вводим поисковый запрос из тестовых данных окружения и нажимаем кнопку Apply
        await articlesPage.searchArticle(testData.searchKeyword);

        // Проверяем, что счетчик отфильтрованных статей показывает ожидаемый результат
        await expect(articlesPage.articlesCountBadge).toHaveText(testData.expectedBadgeText);
        // Проверяем, что в результатах отображается ровно 1 карточка статьи с искомым заголовком
        await expect(articlesPage.articleCards).toHaveCount(1);
        await expect(
            articlesPage.articleCards.getByRole('heading', {
                name: testData.expectedArticleTitle,
                level: 2,
            })
        ).toBeVisible();
    });
});
