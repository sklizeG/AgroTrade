import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './bpms-console-page.css';

const ENGINE = '/engine-rest';
const AUTH = `Basic ${btoa('demo:demo')}`;

const TASK_ROLES: Record<string, string> = {
  Task_ManagerReview: 'manager',
  Task_ManagerPaymentFollowup: 'manager',
  Task_AdminConfirm: 'admin',
  Task_FarmerPrepare: 'farmer',
  Task_ManagerShipment: 'manager',
  Task_ManagerDelivery: 'manager',
  Task_AdminClose: 'admin',
};

const ROLE_USERS: Record<string, string> = {
  manager: 'agromanager',
  admin: 'agroadmin',
  farmer: 'agrofarmer',
};

type CamundaTask = {
  id: string;
  name?: string;
  taskDefinitionKey: string;
};

type ProcessVariables = {
  status?: { value?: string };
};

async function camundaApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${ENGINE}${path}`, {
    ...options,
    headers: {
      Authorization: AUTH,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  if (res.status === 204) {
    return null as T;
  }

  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  return null as T;
}

export function BpmsConsolePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order') ?? '');
  const [roleFilter, setRoleFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('—');
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<CamundaTask[]>([]);
  const [hasActiveInstance, setHasActiveInstance] = useState(false);
  const [lastRefresh, setLastRefresh] = useState('');
  const busyRef = useRef(false);

  const refresh = useCallback(async () => {
    if (busyRef.current) {
      return;
    }

    const trimmedOrderId = orderId.trim();
    if (!trimmedOrderId) {
      setError(null);
      setStatus('—');
      setInstanceId(null);
      setTasks([]);
      setHasActiveInstance(false);
      return;
    }

    busyRef.current = true;
    setBusy(true);
    setError(null);

    try {
      const businessKey = `order-${trimmedOrderId}`;
      const instances = await camundaApi<{ id: string }[]>(
        `/process-instance?businessKey=${encodeURIComponent(businessKey)}&active=true`,
      );

      if (!instances.length) {
        setHasActiveInstance(false);
        setInstanceId(null);
        setStatus('—');
        setTasks([]);
      } else {
        setHasActiveInstance(true);
        setInstanceId(instances[0].id);

        const vars = await camundaApi<ProcessVariables>(
          `/process-instance/${instances[0].id}/variables`,
        );
        setStatus(vars.status?.value ?? '—');

        let activeTasks = await camundaApi<CamundaTask[]>(
          `/task?processInstanceBusinessKey=${encodeURIComponent(businessKey)}&active=true`,
        );

        if (roleFilter) {
          activeTasks = activeTasks.filter(
            (task) => TASK_ROLES[task.taskDefinitionKey] === roleFilter,
          );
        }

        setTasks(activeTasks);
      }

      setLastRefresh(new Date().toLocaleTimeString());
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Не удалось загрузить задачи');
      setTasks([]);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [orderId, roleFilter]);

  useEffect(() => {
    const fromUrl = searchParams.get('order') ?? '';
    if (fromUrl && fromUrl !== orderId) {
      setOrderId(fromUrl);
    }
  }, [searchParams, orderId]);

  useEffect(() => {
    if (!autoRefresh) {
      void refresh();
      return;
    }

    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 2000);

    return () => window.clearInterval(timer);
  }, [autoRefresh, refresh]);

  const handleOrderChange = (value: string) => {
    setOrderId(value);
    const trimmed = value.trim();
    if (trimmed) {
      setSearchParams({ order: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const completeTask = async (taskId: string, role: string) => {
    const userId = ROLE_USERS[role] ?? 'demo';

    try {
      await camundaApi(`/task/${taskId}/claim`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    } catch {
      /* уже назначена */
    }

    await camundaApi(`/task/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ variables: {} }),
    });

    await refresh();
  };

  const statusClass =
    status === 'reserved' ? 'ok' : status === 'pending_payment' ? 'wait' : '';

  return (
    <div className="bpms-console">
      <header className="bpms-console-header">
        <h1>Консоль задач Camunda</h1>
        <p>
          Автообновление каждые 2 сек. После mock-оплаты status в процессе станет{' '}
          <strong>reserved</strong>.
        </p>
      </header>

      <div className="bpms-console-main">
        <div className="bpms-console-toolbar">
          <label>
            ID заказа (без префикса order-)
            <input
              placeholder="cmo79..."
              type="text"
              value={orderId}
              onChange={(event) => handleOrderChange(event.target.value)}
            />
          </label>

          <label>
            Роль (фильтр задач)
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="">Все роли</option>
              <option value="manager">manager — agromanager</option>
              <option value="admin">admin — agroadmin</option>
              <option value="farmer">farmer — agrofarmer</option>
            </select>
          </label>

          <label className="bpms-console-checkbox">
            <input
              checked={autoRefresh}
              type="checkbox"
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />
            Автообновление
          </label>

          <button className="button secondary" disabled={busy} type="button" onClick={() => void refresh()}>
            Обновить сейчас
          </button>
        </div>

        <div className="bpms-console-status">
          {!orderId.trim() ? (
            <span className="bpms-pill wait">Укажите ID заказа</span>
          ) : error ? (
            <span className="bpms-pill err">{error}</span>
          ) : !hasActiveInstance ? (
            <span className="bpms-pill ok">Процесс завершён или не найден</span>
          ) : (
            <>
              <span className={`bpms-pill ${statusClass}`}>status: {status}</span>
              {instanceId ? (
                <span>
                  · instance: <code>{instanceId.slice(0, 8)}…</code>
                </span>
              ) : null}
              <span>
                · businessKey: <code>order-{orderId.trim()}</code>
              </span>
            </>
          )}
          {lastRefresh ? <span className="bpms-last-refresh">Обновлено: {lastRefresh}</span> : null}
        </div>

        {!orderId.trim() ? (
          <p className="bpms-empty">
            Введите ID заказа из AgroTrade или откройте страницу с параметром{' '}
            <code>?order=...</code>
          </p>
        ) : null}

        {orderId.trim() && !error && hasActiveInstance && !tasks.length ? (
          <p className="bpms-empty">
            Нет активных задач для выбранной роли. Подождите автообновление или смените фильтр.
          </p>
        ) : null}

        <div className="bpms-task-list">
          {tasks.map((task) => {
            const role = TASK_ROLES[task.taskDefinitionKey] ?? '?';
            const user = ROLE_USERS[role] ?? 'demo';

            return (
              <article className="bpms-task-card" key={task.id}>
                <h3>{task.name ?? task.taskDefinitionKey}</h3>
                <p className="bpms-task-meta">
                  Роль: <strong>{role}</strong> · пользователь: <code>{user}</code>
                </p>
                <button
                  type="button"
                  onClick={() => void completeTask(task.id, role)}
                >
                  Выполнить задачу
                </button>
              </article>
            );
          })}
        </div>

        <div className="bpms-links">
          <Link to="/">← На главную</Link>
          {' · '}
          <a href="http://localhost:8080/camunda/app/cockpit/" rel="noopener noreferrer" target="_blank">
            Cockpit
          </a>
          {' · '}
          <a href="http://localhost:8080/camunda/app/tasklist/" rel="noopener noreferrer" target="_blank">
            Tasklist
          </a>
        </div>
      </div>
    </div>
  );
}
