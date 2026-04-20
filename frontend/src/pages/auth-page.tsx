import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../app/auth-context';

type RegisterRole = 'buyer' | 'farmer';

type BuyerFormState = {
  email: string;
  password: string;
  buyerType: 'b2c' | 'b2b';
  displayName: string;
  companyName: string;
  taxId: string;
  phone: string;
};

const initialBuyerForm: BuyerFormState = {
  email: '',
  password: '',
  buyerType: 'b2c',
  displayName: '',
  companyName: '',
  taxId: '',
  phone: '',
};

const initialFarmerForm = {
  email: '',
  password: '',
  displayName: '',
  companyName: '',
  farmTaxId: '',
  pickupAddress: '',
  phone: '',
};

const LOGIN_EMAIL_COOKIE = 'agrotrade-login-email';
const LOGIN_PASSWORD_COOKIE = 'agrotrade-login-password';
const LOGIN_COOKIE_DAYS = 30;

function readCookie(name: string): string {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function setCookie(name: string, value: string, days: number) {
  const maxAge = Math.max(Math.floor(days * 24 * 60 * 60), 0);
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, login, registerBuyer, registerFarmer, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerRole, setRegisterRole] = useState<RegisterRole>('buyer');
  const [loginForm, setLoginForm] = useState(() => ({
    email: readCookie(LOGIN_EMAIL_COOKIE),
    password: readCookie(LOGIN_PASSWORD_COOKIE),
  }));
  const [buyerForm, setBuyerForm] = useState(initialBuyerForm);
  const [farmerForm, setFarmerForm] = useState(initialFarmerForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const roleParam = searchParams.get('role');

    if (modeParam === 'register' || modeParam === 'login') {
      setMode(modeParam);
    }

    if (roleParam === 'buyer' || roleParam === 'farmer') {
      setRegisterRole(roleParam);
    }
  }, [searchParams]);

  const submitLabel = useMemo(() => {
    if (isLoading) {
      return 'Сохраняем...';
    }

    if (mode === 'login') {
      return 'Войти';
    }

    return registerRole === 'buyer'
      ? 'Зарегистрировать покупателя'
      : 'Зарегистрировать фермера';
  }, [isLoading, mode, registerRole]);

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      if (mode === 'login') {
        await login(loginForm);
        setCookie(LOGIN_EMAIL_COOKIE, loginForm.email.trim().toLowerCase(), LOGIN_COOKIE_DAYS);
        setCookie(LOGIN_PASSWORD_COOKIE, loginForm.password, LOGIN_COOKIE_DAYS);
      } else if (registerRole === 'buyer') {
        const isBusinessBuyer = buyerForm.buyerType === 'b2b';
        await registerBuyer({
          ...buyerForm,
          companyName: isBusinessBuyer ? buyerForm.companyName || undefined : undefined,
          taxId: isBusinessBuyer ? buyerForm.taxId || undefined : undefined,
          phone: buyerForm.phone || undefined,
        });
        setCookie(LOGIN_EMAIL_COOKIE, buyerForm.email.trim().toLowerCase(), LOGIN_COOKIE_DAYS);
        setCookie(LOGIN_PASSWORD_COOKIE, buyerForm.password, LOGIN_COOKIE_DAYS);
      } else {
        await registerFarmer({
          ...farmerForm,
          farmTaxId: farmerForm.farmTaxId.trim(),
          pickupAddress: farmerForm.pickupAddress || undefined,
          phone: farmerForm.phone || undefined,
        });
        setCookie(LOGIN_EMAIL_COOKIE, farmerForm.email.trim().toLowerCase(), LOGIN_COOKIE_DAYS);
        setCookie(LOGIN_PASSWORD_COOKIE, farmerForm.password, LOGIN_COOKIE_DAYS);
      }

      navigate('/dashboard');
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Что-то пошло не так');
    }
  };

  return (
    <div className="page-stack">
      <section className="panel auth-layout">
        <div className="section-header">
          <div>
            <span className="eyebrow">Доступ в систему</span>
            <h1>Вход и регистрация AgroTrade</h1>
          </div>
          <p>
            Админ входит через готовый seed-аккаунт, фермер и покупатель
            регистрируются сами.
          </p>
        </div>

        <div className="mode-switch auth-mode-switch">
          <button
            className={mode === 'login' ? 'button primary' : 'button secondary'}
            onClick={() => setMode('login')}
            type="button"
          >
            Вход
          </button>
          <button
            className={mode === 'register' ? 'button primary' : 'button secondary'}
            onClick={() => setMode('register')}
            type="button"
          >
            Регистрация
          </button>
        </div>

        {mode === 'register' ? (
          <div className="mode-switch auth-mode-switch auth-mode-switch-nested">
            <button
              className={
                registerRole === 'buyer' ? 'button primary' : 'button secondary'
              }
              onClick={() => setRegisterRole('buyer')}
              type="button"
            >
              Покупатель
            </button>
            <button
              className={
                registerRole === 'farmer' ? 'button primary' : 'button secondary'
              }
              onClick={() => setRegisterRole('farmer')}
              type="button"
            >
              Фермер
            </button>
          </div>
        ) : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === 'login' ? (
            <>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Пароль
                <input
                  required
                  minLength={8}
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
            </>
          ) : registerRole === 'buyer' ? (
            <>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={buyerForm.email}
                  onChange={(event) =>
                    setBuyerForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Пароль
                <input
                  required
                  minLength={8}
                  type="password"
                  value={buyerForm.password}
                  onChange={(event) =>
                    setBuyerForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Тип покупателя
                <select
                  value={buyerForm.buyerType}
                  onChange={(event) =>
                    setBuyerForm((current) => ({
                      ...current,
                      buyerType: event.target.value as 'b2c' | 'b2b',
                    }))
                  }
                >
                  <option value="b2c">B2C</option>
                  <option value="b2b">B2B</option>
                </select>
              </label>
              <label>
                Имя / контакт
                <input
                  required
                  value={buyerForm.displayName}
                  onChange={(event) =>
                    setBuyerForm((current) => ({
                      ...current,
                      displayName: event.target.value,
                    }))
                  }
                />
              </label>
              {buyerForm.buyerType === 'b2b' ? (
                <>
                  <label>
                    Компания
                    <input
                      required
                      value={buyerForm.companyName}
                      onChange={(event) =>
                        setBuyerForm((current) => ({
                          ...current,
                          companyName: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    ИНН / рег. номер
                    <input
                      required
                      value={buyerForm.taxId}
                      onChange={(event) =>
                        setBuyerForm((current) => ({
                          ...current,
                          taxId: event.target.value,
                        }))
                      }
                    />
                  </label>
                </>
              ) : null}
              <label>
                Телефон
                <input
                  value={buyerForm.phone}
                  onChange={(event) =>
                    setBuyerForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={farmerForm.email}
                  onChange={(event) =>
                    setFarmerForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Пароль
                <input
                  required
                  minLength={8}
                  type="password"
                  value={farmerForm.password}
                  onChange={(event) =>
                    setFarmerForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Имя
                <input
                  required
                  value={farmerForm.displayName}
                  onChange={(event) =>
                    setFarmerForm((current) => ({
                      ...current,
                      displayName: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Хозяйство / компания
                <input
                  required
                  value={farmerForm.companyName}
                  onChange={(event) =>
                    setFarmerForm((current) => ({
                      ...current,
                      companyName: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                ИНН хозяйства
                <input
                  required
                  value={farmerForm.farmTaxId}
                  onChange={(event) =>
                    setFarmerForm((current) => ({
                      ...current,
                      farmTaxId: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Телефон
                <input
                  value={farmerForm.phone}
                  onChange={(event) =>
                    setFarmerForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Адрес самовывоза
                <input
                  value={farmerForm.pickupAddress}
                  onChange={(event) =>
                    setFarmerForm((current) => ({
                      ...current,
                      pickupAddress: event.target.value,
                    }))
                  }
                />
              </label>
            </>
          )}

          {error ? <p className="error-text full-width">{error}</p> : null}

          <div className="full-width form-actions">
            <button className="button primary" disabled={isLoading} type="submit">
              {submitLabel}
            </button>
          </div>
        </form>

        <div className="callout">
          <strong>Админ для демо:</strong> `admin@agrotrade.local` / `Admin123!`
        </div>
      </section>
    </div>
  );
}
