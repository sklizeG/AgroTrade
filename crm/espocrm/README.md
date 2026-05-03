# EspoCRM local setup

## Run

```powershell
cd "E:\AgroTrade 2\crm\espocrm"
docker compose up -d
```

CRM URL: `http://localhost:8085`

Default credentials:

- `admin` / `admin123`

## Required CRM configuration for AgroTrade

Main entity: `Lead` (used as Order card from AgroTrade).

При **регистрации** покупателя или фермера backend создаёт или обновляет запись **`Contact`** (поиск по `emailAddress`): имя, телефон, компания (`accountName`), служебное описание с ID пользователя и ролью. Дополнительные поля в Entity Manager для Contact не обязательны.

В Espo: **Administration → Settings → Currency** добавьте **RUB** в список валют и при необходимости сделайте её валютой по умолчанию (иначе API может вернуть `validCurrency` для `opportunityAmountCurrency`).

Backend заполняет **стандартные** поля лида: `firstName` / `lastName` (из профиля покупателя), `emailAddress`, `phoneNumber`, `opportunityAmount` (сумма заказа), связь **Кампания** через запись `Campaign` (по названию кампании AgroTrade запись ищется или создаётся). В поле **Описание** остаётся только служебный текст (ID заказа, статус, объём). Дополнительные поля ниже — по желанию.

Create custom fields in `Administration -> Entity Manager -> Lead`:

1. `agroOrderId` (`varchar`)
2. `agroOrderStatus` (`enum`)
3. `agroOrderTotalAmount` (`currency`)
4. `agroOrderVolume` (`float`)
5. `agroBuyerEmail` (`email`)
6. `agroBuyerPhone` (`phone`)
7. `agroCampaignTitle` (`varchar`)

For `agroOrderStatus` enum set options:

- `pending_payment`
- `reserved`
- `confirmed`
- `partially_delivered`
- `delivered`
- `cancelled`

## Roles

Create role `Менеджер` in `Administration -> Roles`.

Set scope permissions for `Contact` exactly as:

- Read: `own`
- Create: `own`
- Edit: `own`
- Delete: `no`
- Export: `no`
- Import: `own`

Create user `manager` and assign this role.

Administrator role remains full access (default admin user).
