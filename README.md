# Dojo Playwright Tests

## Install

```bash
npm ci
npx playwright install --with-deps
```

## Run All Tests

```bash
npx playwright test
```

## Run API Preparation & Profile Avatar UI Test

```bash
npx playwright test tests/profile-avatar.spec.ts
```

## Report

```bash
npx playwright show-report
```

---

## Дослідження проєкту Dojo Articles (п. 1 та п. 6)

### 1. Де зберігається стан входу та як це визначено
- **Механізм зберігання:** стан авторизації зберігається в `localStorage` браузера для origin `http://104.168.59.50` під ключем `qa-dojo.token`. Масив `cookies` залишається порожнім.
- **Як визначено:** через `DevTools → Application → Local Storage` після входу/реєстрації та зіставлення значення `qa-dojo.token` із полем `user.token` у JSON-відповіді API у вкладці `DevTools → Network`.

### 2. Запити реєстрації, входу, налаштувань профілю та передача авторизації
- **Реєстрація користувача:**
  - **Метод і URL:** `POST /api/users`
  - **Тіло запиту:** `{ "user": { "username": "<string>", "email": "<string>", "password": "<string>" } }`
  - **Статус і структура відповіді:** `201 Created`, `{ "user": { "email", "username", "bio", "image", "token" } }`
- **Вхід користувача:**
  - **Метод і URL:** `POST /api/users/login`
  - **Тіло запиту:** `{ "user": { "email": "<string>", "password": "<string>" } }`
  - **Статус і структура відповіді:** `200 OK`, `{ "user": { "email", "username", "bio", "image", "token" } }`
- **Передача даних авторизації в наступних запитах:**
  - Усі авторизовані запити передають HTTP-заголовок: `Authorization: Token <токен>`.
  - Перевірка поточної сесії під час завантаження SPA виконується запитом `GET /api/user` (статус `200 OK`).
- **Збереження налаштувань профілю:**
  - **Метод і URL:** `PUT /api/user`
  - **Заголовок:** `Authorization: Token <токен>`
  - **Тіло запиту:** `{ "user": { "image": "<url>", "username": "<string>", "bio": "<string>", "email": "<string>" } }` (опціонально `"password"`)
  - **Статус і структура відповіді:** `200 OK`, `{ "user": { "email", "username", "bio", "image", "token" } }`

### 3. Передумови двох UI-сценаріїв у Dojo Articles, які можна готувати через API

#### Сценарій 1: Редагування або видалення власної статті через UI
- **Потрібні дані / стан:** авторизований користувач-автор та вже опублікована ним стаття з відомим `slug`.
- **API-операції підготовки:**
  1. `POST /api/users` — створення нового користувача та отримання його `user.token`.
  2. `POST /api/articles` (із заголовком `Authorization: Token <токен>` і тілом `{ "article": { "title", "description", "body", "tagList" } }`) — швидке створення статті без проходження форми редактора в UI та отримання `article.slug`.
  3. Передача `qa-dojo.token` у `localStorage` через `storageState`.
- **Дія, яка залишається в UI:** відкриття сторінки статті `/articles/article/<slug>` або редактора `/articles/editor/<slug>`, зміна заголовка/тексту статті чи натискання кнопки видалення та перевірка результату в інтерфейсі.

#### Сценарій 2: Перевірка персональної стрічки `Your Feed` та додавання статті в обране (Favorites)
- **Потрібні дані / стан:** користувач-автор з опублікованою статтею та основний користувач, який підписаний на цього автора.
- **API-операції підготовки:**
  1. `POST /api/users` + `POST /api/articles` — створення автора та публікація тестової статті через API.
  2. `POST /api/users` — створення основного тестового користувача.
  3. `POST /api/profiles/<author_username>/follow` (із заголовком `Authorization: Token <токен>`) — підписка основного користувача на автора через API.
  4. Ініціалізація браузерного контексту з токеном основного користувача в `storageState`.
- **Дія, яка залишається в UI:** відкриття `/articles`, перехід на вкладку `Your Feed`, перевірка наявності статті автора в стрічці та натискання кнопки лайку (`preview-favorite-button-<slug>`) з перевіркою лічильника в UI.
