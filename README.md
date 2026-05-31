# AgroTrade MVP

AgroTrade - MVP-платформа для предзаказов фермерской продукции между фермерами и покупателями (B2C/B2B) с админ-панелью.

## Кратко о проекте

- фермер создает кампании предзаказа (объем, цена, дедлайн, условия);
- покупатель бронирует объем и оплачивает mock-предоплату;
- админ управляет пользователями, заказами и кампаниями;
- есть публичные страницы каталога, карточка фермера и личные кабинеты ролей.

## Технологический стек

### Backend (`backend/`)

- `NestJS`
- `Prisma ORM`
- `PostgreSQL`
- `JWT` аутентификация
- `Swagger` документация API

### Frontend (`frontend/`)

- `React`
- `TypeScript`
- `Vite`
- `React Router`

### Инфраструктура

- `Docker Compose` для PostgreSQL

## Быстрый запуск (локально)

### 1) Поднимите PostgreSQL

```bash
docker compose up -d
```

### 2) Установите зависимости

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3) Настройте `.env` файлы

Скопируйте примеры:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`

На Windows (PowerShell) можно так:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
Copy-Item .\frontend\.env.example .\frontend\.env
```

### 4) Инициализируйте БД

```bash
cd backend
npx prisma generate
npm run db:push
npm run db:seed
```

### 5) Запустите backend

```bash
cd backend
npm run start:dev
```

Backend будет доступен по адресу: `http://127.0.0.1:5051`  
Swagger: `http://127.0.0.1:5051/api/docs`

### 6) Запустите frontend

```bash
cd frontend
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:5173`

### 7) Поднимите локальную CRM (EspoCRM)

```bash
cd crm/espocrm
docker compose up -d
```

CRM будет доступна по адресу: `http://localhost:8085`  
Логин администратора CRM: `admin`  
Пароль администратора CRM: `admin123`

После первого входа выполните настройки из `crm/espocrm/README.md`:

- сущность `Lead` + 7 кастомных полей для `Order`;
- роль `Менеджер` (права на `Contact` как на скриншоте: чтение/добавление/изменение/импорт = `свои`, удаление/экспорт = `нет доступа`);
- пользователь `manager` с этой ролью.

### 8) Включите интеграцию backend -> CRM

В `backend/.env`:

```env
CRM_ENABLED=true
CRM_BASE_URL="http://127.0.0.1:8085"
CRM_USERNAME="admin"
CRM_PASSWORD="admin123"
CRM_LEAD_CURRENCY=RUB
```

Проверка статуса интеграции (под админ JWT):

- `GET /api/admin/crm/status`

### 9) Поднимите BPMS (Camunda, ПР-06)

```powershell
cd "E:\AgroTrade 2\bpms\camunda"
docker compose up -d
node "E:\AgroTrade 2\bpms\camunda\scripts\seed-identity.mjs"
```

Camunda UI: `http://localhost:8080/camunda/app/` (логин `demo` / `demo`)  
Консоль задач (автообновление): `http://localhost:5173/bpms-console?order={id}`  
Tasklist для ролей: `agromanager` / `agroadmin` / `agrofarmer` (см. `bpms/camunda/README.md`)

В `backend/.env` добавьте:

```env
BPMS_ENABLED=true
BPMS_BASE_URL="http://127.0.0.1:8080"
BPMS_USERNAME="demo"
BPMS_PASSWORD="demo"
BPMS_PROCESS_KEY=OrderProcessing
```

После оформления заказа на сайте (при включённых CRM и BPMS) в Camunda Cockpit появится экземпляр процесса **OrderProcessing** (интеграция CRM→BPMS).

- `GET /api/admin/bpms/status` — статус BPMS  
- Отчёт ПР-06: `docs/PR-06-BPMS-REPORT.md`

## Данные администратора по умолчанию

- email: `admin@agrotrade.local`
- password: `Admin123!`

## Основные API endpoints

- `POST /api/auth/register/buyer`
- `POST /api/auth/register/farmer`
- `POST /api/auth/login`
- `GET /api/campaigns`
- `GET /api/farmers/:id/profile`
- `POST /api/orders`
- `POST /api/payments/mock/:orderId/pay`
- `GET /api/admin/users`
- `GET /api/docs`
