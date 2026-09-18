import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://104.168.59.50/articles');
  await expect (page).toHaveURL('http://104.168.59.50/articles');
  await page.getByTestId('nav-sign-up').click();
  expect (page.getByTestId('nav-sign-up').isVisible());
  await page.getByTestId('auth-username').fill('Svyatoslav');
  expect (page.getByTestId('auth-username')).toHaveValue('Svyatoslav');
  await page.getByTestId('auth-email').fill('qa1@gmail.com');
  expect (page.getByTestId('auth-email')).toHaveValue('qa@gmail.com');
  await page.getByTestId('auth-password').fill('Testing1');
  expect (page.getByTestId('auth-password')).toHaveValue('Testing1');
  await page.getByTestId('register-confirm-password').fill('Testing1');
  expect (page.getByTestId('register-confirm-password')).toHaveValue('Testing1');
  await page.getByTestId('register-source-course').check();
  expect (page.getByTestId('register-source-course')).toBeChecked();
  await page.getByTestId('register-newsletter').check();
  expect (page.getByTestId('register-newsletter')).toBeChecked();
  await page.getByTestId('register-terms').check();
  expect (page.getByTestId('register-terms')).toBeChecked();
});