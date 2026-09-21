import { test, expect } from '@playwright/test';

test.describe('New user registration', () => {
    test('Successful registration with valid data', async ({ page }) => {
        const timestamp = Date.now();
        const username = `user_${timestamp}`;
        const email = `qa_${timestamp}@gmail.com`;

        await page.goto('/articles');
        await expect(page).toHaveURL(/\/articles$/);
        await expect(page.getByTestId('nav-sign-up')).toBeVisible();
        await page.getByTestId('nav-sign-up').click();
        await expect(page).toHaveURL(/\/articles\/register/);

        await page.getByTestId('auth-username').fill(username);
        await page.getByTestId('auth-email').fill(email);
        await page.getByTestId('auth-password').fill('Testing1');
        await page.getByTestId('register-confirm-password').fill('Testing1');
        await page.getByTestId('register-newsletter').check();
        await page.getByTestId('register-terms').check();
        await page.getByTestId('auth-submit').click();

        await expect(page).toHaveURL(/\/articles$/);
        await expect(page.getByTestId('nav-profile')).toBeVisible();
    });

    test('Registration with existed email', async ({page}) => {
        await page.goto('/articles');
        await expect(page).toHaveURL('/articles');
        await page.getByTestId('nav-sign-up').click();
        await expect(page).toHaveURL('/articles/register');

        await page.getByTestId('auth-username').fill('Svyatoslav');
        await expect(page.getByTestId('auth-username')).toHaveValue('Svyatoslav');
        await page.getByTestId('auth-email').fill('qa@gmail.com');
        await page.getByTestId('auth-password').fill('Testing1');
        await page.getByTestId('register-confirm-password').fill('Testing1');
        await page.getByTestId('register-terms').check();
        await page.getByTestId('auth-submit').click();

        await expect(page.getByTestId('error-messages')).toHaveText('body email або username вже зайняті');
    });

    test('Registration with empty "Email" field', async ({page}) => {
        await page.goto('articles/register');
        await expect(page).toHaveURL('articles/register');
        
        await page.getByTestId('auth-username').fill('Svyatoslav');
        await page.getByTestId('auth-email').fill('');
        await page.getByTestId('auth-password').fill('Testing1');
        await page.getByTestId('register-confirm-password').fill('Testing1');
        await page.getByTestId('register-terms').check();
        await page.getByTestId('auth-submit').click();

        await expect(page.getByTestId('error-messages')).toHaveText('email некоректний email');
    });
});

test.describe('Login', () => {
    test('Successful login with existed user', async ({page}) => {
        await page.goto('/articles/login');
        await expect(page).toHaveURL('/articles/login');

        await page.getByTestId('auth-email').fill('qakravchenko@gmail.com');
        await page.getByTestId('auth-password').fill('Testing1');
        await page.getByTestId('auth-submit').click();     

        await expect(page).toHaveURL('/articles');
        await expect(page.getByTestId('nav-profile')).toContainText('Svyatoslav');
    });

    test('Login with invalid password', async ({page}) => {
        await page.goto('/articles/login');
        await expect(page).toHaveURL('/articles/login');

        await page.getByTestId('auth-email').fill('qakravchenko@gmail.com');
        await page.getByTestId('auth-password').fill('testing1');
        await page.getByTestId('auth-submit').click();

        await expect(page.getByTestId('error-messages')).toHaveText('email or password неправильні');
    });

    test('Login with not registered user', async ({page}) => {
        await page.goto('/articles/login');
        await expect(page).toHaveURL('/articles/login');

        await page.getByTestId('auth-email').fill('somebody@gmail.com');
        await expect(page.getByTestId('auth-email')).toHaveValue('somebody@gmail.com');
        await page.getByTestId('auth-password').fill('pass');
        await expect (page.getByTestId('auth-password')).toHaveValue('pass');
        await page.getByTestId('auth-submit').click();

        await expect(page.getByTestId('error-messages')).toHaveText('email or password неправильні');
    });
});