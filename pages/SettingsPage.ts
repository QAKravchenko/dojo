import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object для сторінки налаштувань профілю (/articles/settings) та профілю користувача (/articles/profile/:username)
 */
export class SettingsPage {
  readonly page: Page;

  // Шапка застосунку
  readonly navProfile: Locator;
  readonly navProfileAvatarImg: Locator;

  // Сторінка профілю (/articles/profile/:username)
  readonly profilePage: Locator;
  readonly profileAvatarImg: Locator;
  readonly editProfileLink: Locator;

  // Форма налаштувань (/articles/settings)
  readonly settingsForm: Locator;
  readonly avatarPreviewImg: Locator;
  readonly imageUrlInput: Locator;
  readonly usernameInput: Locator;
  readonly bioInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly saveSettingsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Шапка
    this.navProfile = page.getByTestId('nav-profile');
    this.navProfileAvatarImg = this.navProfile.locator('img');

    // Профіль
    this.profilePage = page.getByTestId('profile-page');
    this.profileAvatarImg = this.profilePage.locator('header img');
    this.editProfileLink = page.getByRole('link', { name: 'Edit profile' });

    // Налаштування
    this.settingsForm = page.getByTestId('settings-form');
    this.avatarPreviewImg = page.getByTestId('settings-avatar-preview').locator('img');
    this.imageUrlInput = page.getByTestId('settings-image');
    this.usernameInput = page.getByTestId('settings-username');
    this.bioInput = page.getByTestId('settings-bio');
    this.emailInput = page.getByTestId('settings-email');
    this.passwordInput = page.getByTestId('settings-password');
    this.saveSettingsButton = page.getByTestId('settings-submit');
  }

  /**
   * Відкриває сторінку налаштувань авторизованого користувача
   */
  async openSettings(username: string): Promise<void> {
    await this.page.goto(`/articles/profile/${username}`);
    await expect(this.navProfile).toBeVisible();
    await this.editProfileLink.click();
    await expect(this.page).toHaveURL(/\/articles\/settings$/);
    await expect(this.settingsForm).toBeVisible();
  }

  /**
   * Змінює URL аватарки у формі налаштувань, натискає кнопку збереження та очікує завершення PUT /api/user
   */
  async updateAvatarUrlAndSave(newAvatarUrl: string): Promise<void> {
    await this.imageUrlInput.fill(newAvatarUrl);

    const updateResponsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/user') && response.request().method() === 'PUT'
    );

    await this.saveSettingsButton.click();

    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBeTruthy();
    expect(updateResponse.status()).toBe(200);
  }

  /**
   * Перевіряє, що елемент <img> видимий, має очікуваний атрибут src та фактично завантажив зображення (complete && naturalWidth > 0)
   */
  async verifyImageLoaded(imageLocator: Locator, expectedSrc: string): Promise<void> {
    await expect(imageLocator).toBeVisible();
    await expect(imageLocator).toHaveAttribute('src', expectedSrc);

    await expect
      .poll(
        async () =>
          imageLocator.evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
          ),
        { message: 'Очікуємо фактичного завантаження зображення (complete && naturalWidth > 0)' }
      )
      .toBe(true);
  }
}
