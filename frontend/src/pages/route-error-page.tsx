import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

function ErrorFallback({ message }: { message: string }) {
  return (
    <section className="panel route-error">
      <h1>Страница не найдена</h1>
      <p>{message}</p>
      <div className="form-actions">
        <Link className="button primary" to="/">
          На главную
        </Link>
        <Link className="button secondary" to="/bpms-console">
          Консоль BPMS
        </Link>
      </div>
    </section>
  );
}

export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Произошла ошибка при загрузке страницы';

  return <ErrorFallback message={message} />;
}

export function NotFoundPage() {
  return (
    <ErrorFallback message="Страница не существует или адрес введён неверно." />
  );
}
