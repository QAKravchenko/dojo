import { test as base, expect } from '@playwright/test';
import {
  UserController,
  CreateUserPayload,
  UserResponseData,
} from '../controllers/UserController';
import { SettingsPage } from '../pages/SettingsPage';

export interface CreatedTestUser extends CreateUserPayload {
  token: string;
  image: string;
  bio: string;
}

type AuthFixtures = {
  userController: UserController;
  createdUser: CreatedTestUser;
  authToken: string;
  settingsPage: SettingsPage;
};

export const test = base.extend<AuthFixtures>({
  // 1. Фікстура контролера користувача з власним APIRequestContext і гарантованим dispose()
  userController: async ({ playwright, baseURL }, use) => {
    const origin = baseURL ? new URL(baseURL).origin : 'http://104.168.59.50';
    const apiContext = await playwright.request.newContext({
      baseURL: origin,
    });

    try {
      const controller = new UserController(apiContext, origin);
      await use(controller);
    } finally {
      await apiContext.dispose();
    }
  },

  // 2. Фікстура створення нового унікального користувача через API перед тестом
  createdUser: async ({ userController }, use) => {
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const payload: CreateUserPayload = {
      username: `user_${uniqueSuffix}`,
      email: `user_${uniqueSuffix}@example.com`,
      password: 'Password123!',
    };

    const registeredUser: UserResponseData = await userController.registerUser(payload);

    await use({
      ...payload,
      token: registeredUser.token,
      image: registeredUser.image,
      bio: registeredUser.bio,
    });
  },

  // 3. Фікстура токена створеного користувача
  authToken: async ({ createdUser }, use) => {
    expect(createdUser.token).toBeTruthy();
    expect(typeof createdUser.token).toBe('string');
    expect(createdUser.token.trim().length).toBeGreaterThan(0);

    await use(createdUser.token);
  },

  // 4. Перевизначення storageState для передачі токена нового користувача в localStorage браузера
  storageState: async ({ authToken, baseURL }, use) => {
    const origin = baseURL ? new URL(baseURL).origin : 'http://104.168.59.50';

    await use({
      cookies: [],
      origins: [
        {
          origin,
          localStorage: [
            {
              name: 'qa-dojo.token',
              value: authToken,
            },
          ],
        },
      ],
    });
  },

  // 5. Фікстура Page Object для сторінки налаштувань профілю
  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await use(settingsPage);
  },
});

export { expect };
