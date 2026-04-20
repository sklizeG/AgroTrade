import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';

export function RootLayout() {
  const { session, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="app-brand" to="/">
          <span className="app-brand-mark" aria-hidden />
          АгроКруг
        </Link>

        <div className="app-header-center">
          <nav className="app-nav">
            <NavLink
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
              to="/"
              end
            >
              Главная
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
              to="/farmers"
            >
              Фермерам
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
              to="/restaurants"
            >
              Ресторанам
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
              to="/catalog"
            >
              Каталог
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
              to="/contacts"
            >
              Контакты
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'app-nav-link active' : 'app-nav-link'
              }
              to="/dashboard"
            >
              Кабинет
            </NavLink>
          </nav>
        </div>

        <div className="app-header-actions">
          {session ? (
            <>
              <span className="app-user-role">{session.user.role}</span>
              <button className="button secondary small" onClick={logout} type="button">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link className="button secondary small" to="/auth">
                Войти
              </Link>
              <Link className="button primary small" to="/auth">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="app-main page-transition" key={location.pathname}>
        <Outlet />
      </main>

      <footer className="app-footer">
        <section className="app-footer-brand">
          <Link className="app-brand" to="/">
            <span className="app-brand-mark" aria-hidden />
            АгроКруг
          </Link>
          <p>
            Платформа предзаказов, которая соединяет фермеров, рестораны и оптовых
            покупателей напрямую.
          </p>
        </section>

        <section className="app-footer-links">
          <h3>Фермерам</h3>
          <Link to="/farmers">Преимущества платформы</Link>
          <Link to="/auth">Регистрация фермера</Link>
          <Link to="/dashboard">Личный кабинет</Link>
          <Link to="/catalog">Актуальные кампании</Link>
        </section>

        <section className="app-footer-links">
          <h3>Ресторанам</h3>
          <Link to="/restaurants">Как это работает</Link>
          <Link to="/catalog">Каталог поставщиков</Link>
          <Link to="/auth">Регистрация покупателя</Link>
          <Link to="/dashboard">Управление заказами</Link>
        </section>

        <section className="app-footer-contacts">
          <h3>Контакты</h3>
          <a href="mailto:Ivvpull@yandex.ru">Ivvpull@yandex.ru</a>
          <a href="tel:+79029442410">+7 902 944-24-10</a>
          <address>поселок ясная поляна, ул. Богатырская 164</address>
        </section>
      </footer>
    </div>
  );
}
