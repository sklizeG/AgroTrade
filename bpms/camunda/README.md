# Camunda BPMS (ПР-06) для AgroTrade

Локальный **Camunda Platform 7 Run** — BPMN-процесс «Обработка заказа AgroTrade» и интеграция **CRM (EspoCRM) → BPMS** через backend.

## Запуск

```powershell
cd "E:\AgroTrade 2\bpms\camunda"
docker compose up -d
```

Подождите ~30–60 сек., пока поднимется Tomcat.

**После каждого `docker compose up` (или пересоздания контейнера) обязательно выполните seed** — иначе в Camunda останется только `demo`, а роли `agromanager` / `agroadmin` / `agrofarmer` не будут созданы:

```powershell
node "E:\AgroTrade 2\bpms\camunda\scripts\seed-identity.mjs"
```

| Сервис | URL | Логин |
|--------|-----|-------|
| Cockpit (карта процесса) | http://localhost:8080/camunda/app/cockpit/ | `demo` / `demo` |
| **Консоль задач (автообновление)** | http://localhost:5173/bpms-console?order={id} | — |
| Tasklist (задачи) | http://localhost:8080/camunda/app/tasklist/ | см. ниже |
| Admin (пользователи) | http://localhost:8080/camunda/app/admin/ | `demo` / `demo` |
| REST API | http://localhost:8080/engine-rest | Basic `demo:demo` |

BPMN-файл `bpmn/order-processing.bpmn` деплоится автоматически при старте контейнера.

## Роли (ПР-05 → BPMS)

После первого запуска создайте пользователей процесса:

```powershell
cd "E:\AgroTrade 2"
node bpms/camunda/scripts/seed-identity.mjs
```

| Пользователь Camunda | Пароль | Группа | Роль AgroTrade |
|----------------------|--------|--------|----------------|
| `agromanager` | `manager123` | `manager` | Менеджер |
| `agroadmin` | `admin123` | `admin` | Администратор |
| `agrofarmer` | `farmer123` | `farmer` | Фермер |

## Процесс OrderProcessing

7 пользовательских задач, 3 роли-участника:

1. **Менеджер** — проверить заявку  
2. **Менеджер** — контроль оплаты (если `status == pending_payment`)  
3. **Администратор** — подтвердить резерв  
4. **Фермер** — подготовить продукцию  
5. **Менеджер** — организовать отгрузку  
6. **Менеджер** — подтвердить доставку  
7. **Администратор** — закрыть заказ  

**Эквивалент канбана:** Tasklist (колонки «Assigned to me» / «Available») + Cockpit (диаграмма с подсветкой текущего шага).

## Интеграция CRM → BPMS (бонус +5)

В `backend/.env`:

```env
CRM_ENABLED=true
BPMS_ENABLED=true
BPMS_BASE_URL="http://127.0.0.1:8080"
BPMS_USERNAME="demo"
BPMS_PASSWORD="demo"
BPMS_PROCESS_KEY=OrderProcessing
```

Цепочка:

1. Покупатель оформляет заказ на сайте.  
2. Backend создаёт **Lead** в EspoCRM (`crm.service.ts`).  
3. При успехе вызывается `BpmsService.startOrderProcess()` — старт процесса с переменными заказа.  
4. В Cockpit появляется экземпляр с `businessKey=order-{uuid}`.

Проверка статуса интеграции (JWT admin):

- `GET /api/admin/bpms/status`

Код интеграции: `backend/src/modules/bpms/bpms.service.ts`, вызов из `backend/src/modules/crm/crm.service.ts` (`pushOrder`).

## Демо для отчёта (Этап 4)

1. Запустите EspoCRM, Camunda, backend, frontend.  
2. Оформите 3–4 заказа с сайта.  
3. В **Cockpit → Processes → OrderProcessing** откройте экземпляры.  
4. В **[консоли задач](http://localhost:5173/bpms-console/)** (автообновление) или Tasklist прогоните карточку до конца.  
5. После **mock-оплаты** на сайте переменная `status` в Camunda автоматически станет `reserved`.  
6. Запишите скринкаст 2–3 мин. (карта процесса + консоль задач).

Полный текст отчёта: [`docs/PR-06-BPMS-REPORT.md`](../../docs/PR-06-BPMS-REPORT.md).

## Ошибка входа «Wrong credentials or missing access rights»

1. **Контейнер пересоздан** — снова запустите `seed-identity.mjs` (см. выше).
2. **Неверный логин** — используйте `agromanager` (без `_`), не `agro_manager`.
3. **Нет прав на приложение** — seed выдаёт ACCESS к Tasklist/Cockpit; для Admin нужен `agroadmin` или `demo`.
4. **Для демо без входа в Tasklist** — используйте [консоль задач](http://localhost:5173/bpms-console/) (логин не нужен, REST через `demo`).
