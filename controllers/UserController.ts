import { APIRequestContext, expect } from '@playwright/test';

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
}

export interface UserResponseData {
  email: string;
  username: string;
  bio: string;
  image: string;
  token: string;
}

interface UserApiEnvelope {
  user: UserResponseData;
}

/**
 * API-контролер для роботи з користувачами Dojo Articles (/api/users, /api/users/login)
 */
export class UserController {
  private readonly apiUrl: string;

  constructor(
    private readonly request: APIRequestContext,
    baseUrl = 'http://104.168.59.50'
  ) {
    this.apiUrl = baseUrl;
  }

  /**
   * Створення нового користувача через POST /api/users
   */
  async registerUser(payload: CreateUserPayload): Promise<UserResponseData> {
    const response = await this.request.post(`${this.apiUrl}/api/users`, {
      data: {
        user: {
          username: payload.username,
          email: payload.email,
          password: payload.password,
        },
      },
    });

    expect(response.ok(), 'Запит реєстрації POST /api/users має бути успішним').toBeTruthy();
    expect(response.status()).toBe(201);

    const body = (await response.json()) as UserApiEnvelope;

    expect(body.user).toBeDefined();
    expect(body.user.username).toBe(payload.username);
    expect(body.user.email).toBe(payload.email);
    expect(typeof body.user.token).toBe('string');
    expect(body.user.token.trim().length).toBeGreaterThan(0);

    return body.user;
  }

  /**
   * Авторизація користувача через POST /api/users/login
   */
  async loginUser(email: string, password: string): Promise<UserResponseData> {
    const response = await this.request.post(`${this.apiUrl}/api/users/login`, {
      data: {
        user: {
          email,
          password,
        },
      },
    });

    expect(response.ok(), 'Запит входу POST /api/users/login має бути успішним').toBeTruthy();
    expect(response.status()).toBe(200);

    const body = (await response.json()) as UserApiEnvelope;

    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(email);
    expect(typeof body.user.token).toBe('string');
    expect(body.user.token.trim().length).toBeGreaterThan(0);

    return body.user;
  }
}
