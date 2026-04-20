import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../app/auth-context';
import { api, formatDate, formatMoney } from '../shared/api/client';
import { placeholders } from '../shared/placeholders';
import type { Campaign, FeedbackRequest, Order, Product, User } from '../shared/types';

const initialProductForm = {
  name: '',
  unit: 'кг',
  description: '',
};

const initialFarmerPublicInfo = {
  displayName: '',
  avatarUrl: '',
  companyName: '',
  region: '',
  certification: '',
  pickupAddress: '',
  supplyTerms: '',
  about: '',
};

const initialBuyerPublicForm = {
  displayName: '',
  avatarUrl: '',
  companyName: '',
  taxId: '',
};

export function DashboardPage() {
  const { session, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adminCampaigns, setAdminCampaigns] = useState<Campaign[]>([]);
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [farmerPublicInfo, setFarmerPublicInfo] = useState(initialFarmerPublicInfo);
  const [buyerPublicForm, setBuyerPublicForm] = useState(initialBuyerPublicForm);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }

    setLoading(true);
    setError(null);

    const load = async () => {
      if (session.user.role === 'buyer') {
        const [ordersData, productsData] = await Promise.all([
          api.getBuyerOrders(session.accessToken),
          api.getProducts(),
        ]);
        setOrders(ordersData);
        setProducts(productsData);
        setBuyerPublicForm({
          displayName: session.user.buyerProfile?.displayName || '',
          avatarUrl: session.user.buyerProfile?.avatarUrl || '',
          companyName: session.user.buyerProfile?.companyName || '',
          taxId: session.user.buyerProfile?.taxId || '',
        });
        return;
      }

      if (session.user.role === 'farmer') {
        const [ordersData, campaignsData, productsData, meData] = await Promise.all([
          api.getFarmerOrders(session.accessToken),
          api.getFarmerCampaigns(session.accessToken),
          api.getProducts(),
          api.getMeProfile(session.accessToken),
        ]);
        setOrders(ordersData);
        setCampaigns(campaignsData);
        setProducts(productsData);
        setFarmerPublicInfo({
          displayName: meData.farmerProfile?.displayName || '',
          avatarUrl: meData.farmerProfile?.avatarUrl || '',
          companyName: meData.farmerProfile?.companyName || '',
          region: meData.farmerProfile?.region || '',
          certification: meData.farmerProfile?.certification || '',
          pickupAddress: meData.farmerProfile?.pickupAddress || '',
          supplyTerms: meData.farmerProfile?.supplyTerms || '',
          about: meData.farmerProfile?.about || '',
        });
        return;
      }

      const [usersData, ordersData, campaignsData, productsData, feedbackData] = await Promise.all([
        api.getAdminUsers(session.accessToken),
        api.getAdminOrders(session.accessToken),
        api.getAdminCampaigns(session.accessToken),
        api.getProducts(),
        api.getAdminFeedbackRequests(session.accessToken),
      ]);

      setUsers(usersData);
      setOrders(ordersData);
      setAdminCampaigns(campaignsData);
      setProducts(productsData);
      setFeedbackRequests(feedbackData);
    };

    void load()
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить кабинет');
      })
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  const refresh = async () => {
    if (!session) {
      return;
    }

    setLoading(true);
    try {
      if (session.user.role === 'buyer') {
        const [ordersData, meData] = await Promise.all([
          api.getBuyerOrders(session.accessToken),
          api.getMeProfile(session.accessToken),
        ]);
        setOrders(ordersData);
        setBuyerPublicForm({
          displayName: meData.buyerProfile?.displayName || '',
          avatarUrl: meData.buyerProfile?.avatarUrl || '',
          companyName: meData.buyerProfile?.companyName || '',
          taxId: meData.buyerProfile?.taxId || '',
        });
      } else if (session.user.role === 'farmer') {
        const [ordersData, campaignsData, meData] = await Promise.all([
          api.getFarmerOrders(session.accessToken),
          api.getFarmerCampaigns(session.accessToken),
          api.getMeProfile(session.accessToken),
        ]);
        setOrders(ordersData);
        setCampaigns(campaignsData);
        setFarmerPublicInfo({
          displayName: meData.farmerProfile?.displayName || '',
          avatarUrl: meData.farmerProfile?.avatarUrl || '',
          companyName: meData.farmerProfile?.companyName || '',
          region: meData.farmerProfile?.region || '',
          certification: meData.farmerProfile?.certification || '',
          pickupAddress: meData.farmerProfile?.pickupAddress || '',
          supplyTerms: meData.farmerProfile?.supplyTerms || '',
          about: meData.farmerProfile?.about || '',
        });
      } else {
        const [usersData, ordersData, campaignsData, feedbackData] = await Promise.all([
          api.getAdminUsers(session.accessToken),
          api.getAdminOrders(session.accessToken),
          api.getAdminCampaigns(session.accessToken),
          api.getAdminFeedbackRequests(session.accessToken),
        ]);
        setUsers(usersData);
        setOrders(ordersData);
        setAdminCampaigns(campaignsData);
        setFeedbackRequests(feedbackData);
      }
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Не удалось обновить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (session.user.role !== 'admin') {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createProduct(session.accessToken, {
        ...productForm,
        description: productForm.description || undefined,
      });
      setProductForm(initialProductForm);
      setProducts(await api.getProducts());
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Не удалось создать продукт');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBuyerPublicProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (session.user.role !== 'buyer') {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.updateMyBuyerPublicProfile(session.accessToken, {
        displayName: buyerPublicForm.displayName || undefined,
        avatarUrl: buyerPublicForm.avatarUrl || undefined,
        companyName: buyerPublicForm.companyName || undefined,
        taxId: buyerPublicForm.taxId || undefined,
      });
      await refresh();
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : 'Не удалось обновить профиль покупателя',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const headerTitle =
    session.user.role === 'buyer'
      ? 'Кабинет покупателя'
      : session.user.role === 'farmer'
        ? 'Кабинет фермера'
        : 'Админ-панель';

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="topbar">
          <div>
            <span className="eyebrow">{session.user.role}</span>
            <h1>{headerTitle}</h1>
            <p>{session.user.email}</p>
          </div>
          <div className="hero-actions">
            <Link className="button secondary" to="/">
              Каталог
            </Link>
            <button className="button secondary" onClick={() => void refresh()} type="button">
              Обновить
            </button>
            <button className="button primary" onClick={logout} type="button">
              Выйти
            </button>
          </div>
        </div>

        {loading ? <p>Загружаем данные...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {session.user.role === 'buyer' ? (
          <div className="page-stack">
            <div className="card-grid">
              <article className="card">
                <h3>Профиль</h3>
                <img
                  alt="Аватар покупателя"
                  className="profile-avatar"
                  src={buyerPublicForm.avatarUrl || placeholders.buyerAvatar}
                />
                <dl className="detail-list">
                  <div>
                    <dt>Покупатель</dt>
                    <dd>{session.user.buyerProfile?.displayName || 'Не указано'}</dd>
                  </div>
                  <div>
                    <dt>Тип</dt>
                    <dd>{session.user.buyerProfile?.buyerType || 'Не указано'}</dd>
                  </div>
                  <div>
                    <dt>Компания</dt>
                    <dd>
                      {session.user.buyerProfile?.companyName || 'Не указана'}
                    </dd>
                  </div>
                  <div>
                    <dt>ИНН</dt>
                    <dd>
                      {session.user.buyerProfile?.taxId || 'Не указан'}
                    </dd>
                  </div>
                </dl>
              </article>
              <article className="card">
                <h3>Редактировать профиль</h3>
                <form className="form-grid" onSubmit={handleUpdateBuyerPublicProfile}>
                  <label>
                    Имя
                    <input
                      value={buyerPublicForm.displayName}
                      onChange={(event) =>
                        setBuyerPublicForm((current) => ({
                          ...current,
                          displayName: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    URL аватарки
                    <input
                      placeholder="https://..."
                      value={buyerPublicForm.avatarUrl}
                      onChange={(event) =>
                        setBuyerPublicForm((current) => ({
                          ...current,
                          avatarUrl: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Компания
                    <input
                      value={buyerPublicForm.companyName}
                      onChange={(event) =>
                        setBuyerPublicForm((current) => ({
                          ...current,
                          companyName: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    ИНН
                    <input
                      value={buyerPublicForm.taxId}
                      onChange={(event) =>
                        setBuyerPublicForm((current) => ({
                          ...current,
                          taxId: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="full-width form-actions">
                    <button className="button primary" disabled={submitting} type="submit">
                      Сохранить профиль
                    </button>
                  </div>
                </form>
              </article>
              <article className="card">
                <h3>Как использовать MVP</h3>
                <ol className="steps-list">
                  <li>Открой нужную кампанию из каталога.</li>
                  <li>Выбери объем и способ доставки.</li>
                  <li>Создай заказ и нажми mock-оплату.</li>
                </ol>
              </article>
            </div>

            <section className="card">
              <h3>Мои заказы</h3>
              <OrdersTable orders={orders} />
            </section>
          </div>
        ) : null}

        {session.user.role === 'farmer' ? (
          <div className="page-stack">
            <section className="card">
              <h3>Публичная информация о хозяйстве</h3>
              <img
                alt="Аватар фермера"
                className="profile-avatar"
                src={farmerPublicInfo.avatarUrl || placeholders.farmerAvatar}
              />
              <dl className="detail-list">
                <div>
                  <dt>Имя фермера</dt>
                  <dd>{farmerPublicInfo.displayName || 'Не указано'}</dd>
                </div>
                <div>
                  <dt>Хозяйство / компания</dt>
                  <dd>{farmerPublicInfo.companyName || 'Не указано'}</dd>
                </div>
                <div>
                  <dt>Регион</dt>
                  <dd>{farmerPublicInfo.region || 'Не указано'}</dd>
                </div>
                <div>
                  <dt>Сертификация</dt>
                  <dd>{farmerPublicInfo.certification || 'Не указано'}</dd>
                </div>
                <div>
                  <dt>Адрес самовывоза</dt>
                  <dd>{farmerPublicInfo.pickupAddress || 'Не указано'}</dd>
                </div>
                <div>
                  <dt>Условия поставки</dt>
                  <dd>{farmerPublicInfo.supplyTerms || 'Не указано'}</dd>
                </div>
                <div>
                  <dt>Описание</dt>
                  <dd>{farmerPublicInfo.about || 'Не указано'}</dd>
                </div>
              </dl>
              <div className="form-actions">
                <Link className="button secondary" to="/dashboard/farmer/public-profile/edit">
                  Редактировать
                </Link>
                <Link className="button primary" to="/dashboard/farmer/campaigns/create">
                  Создать кампанию предзаказа
                </Link>
              </div>
            </section>

            <section className="card">
              <h3>Мои кампании</h3>
              <div className="card-grid">
                {campaigns.map((campaign) => (
                  <article className="card compact" key={campaign.id}>
                    <img
                      alt={campaign.title}
                      className="campaign-cover"
                      src={campaign.imageUrls[0] || placeholders.campaignCovers[0]}
                    />
                    <h4>{campaign.title}</h4>
                    <p>
                      {campaign.product.name}, {campaign.totalVolume} {campaign.product.unit}
                    </p>
                    <p>
                      Забронировано: {campaign.reservedVolume ?? 0} {campaign.product.unit}
                    </p>
                    <p>
                      Остаток: {(campaign.availableVolume ?? campaign.totalVolume)}{' '}
                      {campaign.product.unit}
                    </p>
                    <p>Статус: {campaign.status}</p>
                    <p>Дедлайн: {formatDate(campaign.preorderDeadline)}</p>
                    {campaign.status === 'draft' ? (
                      <button
                        className="button primary"
                        onClick={() =>
                          void api
                            .publishCampaign(session.accessToken, campaign.id)
                            .then(() => refresh())
                            .catch((reason: unknown) =>
                              setError(
                                reason instanceof Error
                                  ? reason.message
                                  : 'Не удалось опубликовать кампанию',
                              ),
                            )
                        }
                        type="button"
                      >
                        Опубликовать
                      </button>
                    ) : null}
                    <Link
                      className="button secondary"
                      to={`/dashboard/farmer/campaigns/${campaign.id}/edit`}
                    >
                      Редактировать
                    </Link>
                    <Link className="button secondary" to={`/campaigns/${campaign.id}`}>
                      Открыть
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            <section className="card">
              <h3>Заказы по моим кампаниям</h3>
              <OrdersTable orders={orders} />
            </section>
          </div>
        ) : null}

        {session.user.role === 'admin' ? (
          <div className="page-stack">
            <div className="card-grid">
              <article className="card">
                <h3>Пользователи</h3>
                <p>{users.length} зарегистрировано</p>
              </article>
              <article className="card">
                <h3>Кампании</h3>
                <p>{adminCampaigns.length} в системе</p>
              </article>
              <article className="card">
                <h3>Заказы</h3>
                <p>{orders.length} всего</p>
              </article>
            </div>

            <section className="card">
              <h3>Создать продукт</h3>
              <form className="form-grid" onSubmit={handleCreateProduct}>
                <label>
                  Название
                  <input
                    required
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Единица измерения
                  <input
                    required
                    value={productForm.unit}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        unit: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="full-width">
                  Описание
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="full-width form-actions">
                  <button className="button primary" disabled={submitting} type="submit">
                    Добавить продукт
                  </button>
                </div>
              </form>
            </section>

            <section className="card">
              <h3>Список пользователей</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Роль</th>
                      <th>Профиль</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          {user.buyerProfile?.displayName ||
                            user.farmerProfile?.companyName ||
                            'admin'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card">
              <h3>Кампании</h3>
              <div className="card-grid">
                {adminCampaigns.map((campaign) => (
                  <article className="card compact" key={campaign.id}>
                    <h4>{campaign.title}</h4>
                    <p>
                      {campaign.product.name} / {campaign.status}
                    </p>
                    <div className="inline-actions">
                      {['draft', 'published', 'closed', 'fulfilled', 'cancelled'].map(
                        (status) => (
                          <button
                            className="button secondary small"
                            key={status}
                            onClick={() =>
                              void api
                                .updateCampaignStatus(
                                  session.accessToken,
                                  campaign.id,
                                  status,
                                )
                                .then(() => refresh())
                                .catch((reason: unknown) =>
                                  setError(
                                    reason instanceof Error
                                      ? reason.message
                                      : 'Не удалось обновить статус кампании',
                                  ),
                                )
                            }
                            type="button"
                          >
                            {status}
                          </button>
                        ),
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="card">
              <h3>Заявки на обратную связь</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Имя</th>
                      <th>Телефон</th>
                      <th>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.name}</td>
                        <td>{request.phone}</td>
                        <td>{formatDate(request.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {feedbackRequests.length === 0 ? <p>Заявок пока нет.</p> : null}
              </div>
            </section>

            <section className="card">
              <h3>Заказы</h3>
              <OrdersTable
                allowStatusActions
                onStatusChange={(orderId, status) =>
                  api.updateOrderStatus(session.accessToken, orderId, status).then(() =>
                    refresh(),
                  )
                }
                orders={orders}
              />
            </section>
          </div>
        ) : null}

        <section className="card">
          <h3>Справочник продуктов</h3>
          <div className="tag-list">
            {products.map((product) => (
              <span className="tag" key={product.id}>
                {product.name} ({product.unit})
              </span>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function OrdersTable({
  orders,
  allowStatusActions = false,
  onStatusChange,
}: {
  orders: Order[];
  allowStatusActions?: boolean;
  onStatusChange?: (orderId: string, status: string) => Promise<void>;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Кампания</th>
            <th>Объем</th>
            <th>Сумма</th>
            <th>Предоплата</th>
            <th>Доставка</th>
            <th>Статус</th>
            <th>Создан</th>
            {allowStatusActions ? <th>Действия</th> : null}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.campaign.title}</td>
              <td>
                {order.volume} {order.campaign.product.unit}
              </td>
              <td>{formatMoney(order.totalAmount)}</td>
              <td>{formatMoney(order.prepaymentAmount)}</td>
              <td>{order.deliveryMode}</td>
              <td>{order.status}</td>
              <td>{formatDate(order.createdAt)}</td>
              {allowStatusActions ? (
                <td>
                  <select
                    defaultValue={order.status}
                    disabled={!onStatusChange || updatingId === order.id}
                    onChange={(event) => {
                      if (!onStatusChange) {
                        return;
                      }

                      setUpdatingId(order.id);
                      void onStatusChange(order.id, event.target.value).finally(() =>
                        setUpdatingId(null),
                      );
                    }}
                  >
                    {[
                      'pending_payment',
                      'reserved',
                      'confirmed',
                      'partially_delivered',
                      'delivered',
                      'cancelled',
                    ].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 ? <p>Пока заказов нет.</p> : null}
    </div>
  );
}
