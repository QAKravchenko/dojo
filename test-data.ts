export interface ArticlesTestData {
  userEmail: string;
  userPassword: string;
  searchKeyword: string;
  expectedBadgeText: string;
  expectedArticleTitle: string;
}

export interface EnvironmentTestData {
  articles: ArticlesTestData;
}

const defaultTestData: EnvironmentTestData = {
  articles: {
    userEmail: 'olena@example.com',
    userPassword: 'password',
    searchKeyword: 'WebdriverIO',
    expectedBadgeText: '1 article',
    expectedArticleTitle: 'Очікування у WebdriverIO без зайвих sleep',
  },
};

export function getTestData(_projectName?: string): EnvironmentTestData {
  return defaultTestData;
}
