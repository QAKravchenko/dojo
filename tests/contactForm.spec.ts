import { test, expect, Page } from '@playwright/test';
import path from 'path';

type Priority = 'low' | 'medium' | 'high';

// ============================================================================
// 1. Базовая задача
// ============================================================================

interface BasicContactScenario {
  scenarioName: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  priority?: Priority;
  attachment?: string;
  copyMe?: boolean;
  isSuccess: boolean;
  expectedErrors?: string[];
}

const basicScenarios: BasicContactScenario[] = [
  {
    scenarioName: '1. Все поля',
    name: 'Олена',
    email: 'olena@example.com',
    message: 'Знайшла помилку на сторінці статті.',
    subject: 'bug',
    priority: 'high',
    attachment: 'screenshot.png',
    copyMe: true,
    isSuccess: true,
  },
  {
    scenarioName: '2. Только обязательные поля',
    name: 'Павло',
    email: 'pavlo@example.com',
    message: 'Маю питання щодо статті.',
    isSuccess: true,
  },
  {
    scenarioName: '3. Только необязательные поля',
    name: '',
    email: '',
    message: '',
    subject: 'feature',
    priority: 'low',
    attachment: 'screenshot.png',
    copyMe: true,
    isSuccess: false,
    expectedErrors: [
      "name обов'язкове поле",
      'email некоректний email',
      "message обов'язкове поле",
    ],
  },
];

test.describe('Форма обратной связи: базовая задача', () => {
  for (const scenario of basicScenarios) {
    test(`Базовый тест — ${scenario.scenarioName}`, async ({ page }) => {
      // Открываем форму в исходном состоянии
      await page.goto('/articles/contact');
      await expect(page.getByTestId('contact-form')).toBeVisible();

      // Заполняем текстовые поля, если значения переданы
      if (scenario.name) {
        await page.getByTestId('contact-name').fill(scenario.name);
      }
      if (scenario.email) {
        await page.getByTestId('contact-email').fill(scenario.email);
      }
      if (scenario.message) {
        await page.getByTestId('contact-message').fill(scenario.message);
      }

      // Заполняем необязательные поля, если они указаны в наборе данных
      if (scenario.subject) {
        await page.getByTestId('contact-subject').selectOption(scenario.subject);
      }
      if (scenario.priority) {
        await page.getByTestId(`contact-priority-${scenario.priority}`).check();
      }
      if (scenario.attachment) {
        await page
          .getByTestId('contact-attachments')
          .setInputFiles(path.join(__dirname, scenario.attachment));
        await expect(page.getByTestId('contact-attachment-list')).toContainText(scenario.attachment);
      }
      if (scenario.copyMe) {
        await page.getByTestId('contact-copy-me').check();
      }

      // Нажимаем кнопку отправки
      await page.getByTestId('contact-submit').click();

      // Проверяем ожидаемый результат
      if (scenario.isSuccess) {
        await expect(page.getByTestId('error-messages')).toBeHidden();
        await expect(page.getByTestId('contact-success')).toBeVisible();
        await expect(page.getByTestId('contact-success')).toContainText(scenario.email);
      } else {
        await expect(page.getByTestId('contact-success')).toBeHidden();
        await expect(page.getByTestId('error-messages')).toBeVisible();
        await expect(page.getByTestId('error-messages').locator('p')).toHaveText(
          scenario.expectedErrors ?? []
        );
      }
    });
  }
});

// ============================================================================
// 2. Продвинутый уровень
// ============================================================================

// Группировка всех локаторов формы в одной функции
function getContactFormLocators(page: Page) {
  return {
    form: page.getByTestId('contact-form'),
    name: page.getByTestId('contact-name'),
    email: page.getByTestId('contact-email'),
    subject: page.getByTestId('contact-subject'),
    priority: {
      low: page.getByTestId('contact-priority-low'),
      medium: page.getByTestId('contact-priority-medium'),
      high: page.getByTestId('contact-priority-high'),
    },
    message: page.getByTestId('contact-message'),
    attachments: page.getByTestId('contact-attachments'),
    attachmentList: page.getByTestId('contact-attachment-list'),
    copyMe: page.getByTestId('contact-copy-me'),
    submit: page.getByTestId('contact-submit'),
    reset: page.getByTestId('contact-reset'),
    errorMessages: page.getByTestId('error-messages'),
    successMessage: page.getByTestId('contact-success'),
  };
}

type ContactFormLocators = ReturnType<typeof getContactFormLocators>;

interface AdvancedContactScenario {
  scenarioName: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  priority?: Priority;
  attachment?: string;
  copyMe?: boolean;
  verifyResult: (locators: ContactFormLocators) => Promise<void>;
}

const advancedScenarios: AdvancedContactScenario[] = [
  {
    scenarioName: '1. Все поля',
    name: 'Олена',
    email: 'olena@example.com',
    message: 'Знайшла помилку на сторінці статті.',
    subject: 'bug',
    priority: 'high',
    attachment: 'screenshot.png',
    copyMe: true,
    verifyResult: async (locators) => {
      await expect(locators.errorMessages).toBeHidden();
      await expect(locators.successMessage).toBeVisible();
      await expect(locators.successMessage).toContainText('olena@example.com');
    },
  },
  {
    scenarioName: '2. Только обязательные поля',
    name: 'Павло',
    email: 'pavlo@example.com',
    message: 'Маю питання щодо статті.',
    verifyResult: async (locators) => {
      await expect(locators.errorMessages).toBeHidden();
      await expect(locators.successMessage).toBeVisible();
      await expect(locators.successMessage).toContainText('pavlo@example.com');
    },
  },
  {
    scenarioName: '3. Только необязательные поля',
    name: '',
    email: '',
    message: '',
    subject: 'feature',
    priority: 'low',
    attachment: 'screenshot.png',
    copyMe: true,
    verifyResult: async (locators) => {
      await expect(locators.successMessage).toBeHidden();
      await expect(locators.errorMessages).toBeVisible();
      await expect(locators.errorMessages.locator('p')).toHaveText([
        "name обов'язкове поле",
        'email некоректний email',
        "message обов'язкове поле",
      ]);
    },
  },
];

test.describe('Форма обратной связи: продвинутый уровень', () => {
  for (const scenario of advancedScenarios) {
    test(`Продвинутый тест — ${scenario.scenarioName}`, async ({ page }) => {
      const locators = getContactFormLocators(page);

      // Открываем форму в исходном состоянии
      await page.goto('/articles/contact');
      await expect(locators.form).toBeVisible();

      // Заполняем основные текстовые поля (если заданы непустые значения)
      if (scenario.name) {
        await locators.name.fill(scenario.name);
      }
      if (scenario.email) {
        await locators.email.fill(scenario.email);
      }
      if (scenario.message) {
        await locators.message.fill(scenario.message);
      }

      // Заполняем необязательные поля только если они указаны в наборе данных
      if (scenario.subject) {
        await locators.subject.selectOption(scenario.subject);
      }
      if (scenario.priority) {
        await locators.priority[scenario.priority].check();
      }
      if (scenario.attachment) {
        await locators.attachments.setInputFiles(path.join(__dirname, scenario.attachment));
        await expect(locators.attachmentList).toContainText(scenario.attachment);
      }
      if (scenario.copyMe) {
        await locators.copyMe.check();
      }

      // Отправляем форму и вызываем асинхронный метод проверки из объекта сценария
      await locators.submit.click();
      await scenario.verifyResult(locators);
    });
  }
});
