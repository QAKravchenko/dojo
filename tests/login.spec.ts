import {test, expect} from '@playwright/test'

test.describe('Login', () => {
    test('Successful login with existed user', async ({page}) => {
        await page.goto('/articles/login');
        await expect(page).toHaveURL('/articles/login');

        await page.getByTestId('auth-email').fill('qakravchenko@gmail.com');
        await page.getByTestId('auth-password').fill('Testing1');
        await page.getByTestId('auth-submit').click();     

        await expect(page).toHaveURL('/articles');
        await expect(page.getByTestId('nav-profile')).toContainText('Svyatoslav');
    })

    test('Login with invalid password', async ({page}) => {
        await page.goto('/articles/login');
        await expect(page).toHaveURL('/articles/login');

        await page.getByTestId('auth-email').fill('qakravchenko@gmail.com');
        await page.getByTestId('auth-password').fill('testing1');
        await page.getByTestId('auth-submit').click();

        await expect(page.getByTestId('error-messages')).toHaveText('email or password неправильні');
    })

    test('Login with not registered user', async ({page}) => {
        await page.goto('/articles/login');
        await expect(page).toHaveURL('/articles/login');

        await page.getByTestId('auth-email').fill('somebody@gmail.com');
        await expect(page.getByTestId('auth-email')).toHaveValue('somebody@gmail.com');
        await page.getByTestId('auth-password').fill('pass');
        await expect (page.getByTestId('auth-password')).toHaveValue('pass');
        await page.getByTestId('auth-submit').click();

        await expect(page.getByTestId('error-messages')).toHaveText('email or password неправильні');
    })
})