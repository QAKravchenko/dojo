import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object для раздела статей QA Dojo (http://104.168.59.50/articles)
 * Содержит локаторы и методы для авторизации и поиска статей.
 */
export class ArticlesPage {
    readonly page: Page;

    // Навигация (шапка)
    readonly signInNavLink: Locator;
    readonly newArticleNavLink: Locator;
    readonly userProfileNavLink: Locator;

    // Форма авторизации (/articles/login)
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly signInSubmitButton: Locator;

    // Поиск и фильтрация статей (/articles)
    readonly searchInput: Locator;
    readonly applyFilterButton: Locator;
    readonly articlesCountBadge: Locator;
    readonly articleCards: Locator;

    constructor(page: Page) {
        this.page = page;

        // Навигация
        this.signInNavLink = page.getByTestId('nav-sign-in');
        this.newArticleNavLink = page.getByRole('link', { name: 'New article' });
        this.userProfileNavLink = page.getByRole('banner').getByRole('link', { name: 'olena' });

        // Форма входа
        this.emailInput = page.getByTestId('auth-email');
        this.passwordInput = page.getByTestId('auth-password');
        this.signInSubmitButton = page.getByTestId('auth-submit');

        // Поиск статей
        this.searchInput = page.getByTestId('home-search-input');
        this.applyFilterButton = page.getByTestId('home-filter-apply');
        this.articlesCountBadge = page.getByText(/^\d+ articles?$/);
        this.articleCards = page.locator('article');
    }

    /**
     * Переход на главную страницу раздела статей
     */
    async goto(): Promise<void> {
        await this.page.goto('http://104.168.59.50/articles');
    }

    /**
     * Авторизация пользователя через форму входа
     */
    async login(email: string, password: string): Promise<void> {
        await this.signInNavLink.click();
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.signInSubmitButton.click();
    }

    /**
     * Поиск статьи по ключевому слову в заголовке
     */
    async searchArticle(query: string): Promise<void> {
        await this.searchInput.fill(query);
        await this.applyFilterButton.click();
    }
}
