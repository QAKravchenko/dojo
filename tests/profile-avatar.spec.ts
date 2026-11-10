import { test, expect } from '../fixtures/auth.fixture';

test.describe('API-підготовка користувача та зміна аватарки через UI', () => {
  test('створений через API користувач змінює аватарку в налаштуваннях, і зміни зберігаються після перезавантаження', async ({
    page,
    createdUser,
    settingsPage,
  }) => {
    const expectedAvatarUrl = 'https://playwright.dev/img/playwright-logo.svg';

    // 1–2. Відкриваємо сторінку налаштувань профілю під створеним через API користувачем
    await settingsPage.openSettings(createdUser.username);

    // Перевіряємо, що форма містить username та email саме створеного користувача
    await expect(settingsPage.usernameInput).toHaveValue(createdUser.username);
    await expect(settingsPage.emailInput).toHaveValue(createdUser.email);
    await expect(settingsPage.imageUrlInput).not.toHaveValue(expectedAvatarUrl);

    // 3–4. Вказуємо новий прямий URL картинки, натискаємо кнопку збереження та очікуємо відповідь PUT /api/user
    await settingsPage.updateAvatarUrlAndSave(expectedAvatarUrl);

    // Дочікуємося переходу на сторінку профілю після збереження налаштувань
    await expect(page).toHaveURL(new RegExp(`/articles/profile/${createdUser.username}$`));
    await expect(settingsPage.profilePage).toBeVisible();

    // 5. Перевіряємо, що аватарка користувача відображається, її src відповідає заданій адресі та картинка завантажилася
    await settingsPage.verifyImageLoaded(settingsPage.profileAvatarImg, expectedAvatarUrl);
    await settingsPage.verifyImageLoaded(settingsPage.navProfileAvatarImg, expectedAvatarUrl);

    // 6. Перезавантажуємо сторінку та знову відкриваємо налаштування профілю
    await page.reload();
    await expect(settingsPage.profilePage).toBeVisible();
    await settingsPage.verifyImageLoaded(settingsPage.profileAvatarImg, expectedAvatarUrl);

    await settingsPage.editProfileLink.click();
    await expect(page).toHaveURL(/\/articles\/settings$/);
    await expect(settingsPage.settingsForm).toBeVisible();

    // 7. Перевіряємо, що поле адреси зображення містить збережений URL і аватарка все ще має очікуваний src
    await expect(settingsPage.imageUrlInput).toHaveValue(expectedAvatarUrl);
    await settingsPage.verifyImageLoaded(settingsPage.avatarPreviewImg, expectedAvatarUrl);
    await settingsPage.verifyImageLoaded(settingsPage.navProfileAvatarImg, expectedAvatarUrl);
  });
});
