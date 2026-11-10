import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('Открывается страница регистрации при клике по ссылке "Register"', async ({page}) => {
    await page.goto('');
    await page.getByTestId('nav-sign-up').click();
    await expect(page).toHaveURL('http://104.168.59.50/articles/register');
    await expect(page.getByText('Create an account', {exact: true})).toBeVisible();
});
