import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../app/auth-context';
import { api, formatDate, formatMoney } from '../shared/api/client';
import { placeholders } from '../shared/placeholders';
import type { Campaign, DeliveryMode, Order } from '../shared/types';

const initialOrderForm = {
  volume: '',
  deliveryMode: 'pickup' as DeliveryMode,
  deliveryAddress: '',
  deliveryComment: '',
  firstDeliveryDate: '',
};

const initialQuoteForm = {
  deliveryFrequency: 'once' as 'once' | 'weekly' | 'daily',
  requestedVolume: '',
  batchVolume: '',
  deliveryAddress: '',
};

export function CampaignPage() {
  const { id } = useParams();
  const location = useLocation();
  const { session } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [orderForm, setOrderForm] = useState(initialOrderForm);
  const [quoteForm, setQuoteForm] = useState(initialQuoteForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadCampaign = async (campaignId: string) => {
    const item = await api.getCampaign(campaignId);
    setCampaign(item);
    setError(null);
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);
    void loadCampaign(id)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить кампанию');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isB2BBuyer =
    session?.user.role === 'buyer' && session.user.buyerProfile?.buyerType === 'b2b';

  const totalAmount = useMemo(() => {
    const volume = Number((isB2BBuyer ? quoteForm.requestedVolume : orderForm.volume) || 0);
    if (!campaign || !Number.isFinite(volume)) {
      return 0;
    }

    return volume * campaign.unitPrice;
  }, [campaign, isB2BBuyer, orderForm.volume, quoteForm.requestedVolume]);

  const prepaymentAmount = useMemo(() => {
    if (!campaign) {
      return 0;
    }

    return (totalAmount * campaign.prepaymentPercent) / 100;
  }, [campaign, totalAmount]);

  const isFarmerOwner =
    session?.user.role === 'farmer' && session.user.id === campaign?.farmer.id;
  const showBackToCatalog = location.state?.fromCatalog === true;

  if (!id) {
    return <Navigate to="/" replace />;
  }

  const handleOrderSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      setError('Для оформления заявки нужно войти как покупатель');
      return;
    }

    if (session.user.role !== 'buyer') {
      setError('Оформлять заказы может только покупатель');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const quoteComment = isB2BBuyer
        ? [
            '[Запрос коммерческого предложения]',
            `Компания: ${session.user.buyerProfile?.companyName || 'Не указана'}`,
            `ИНН/Tax ID: ${session.user.buyerProfile?.taxId || 'Не указан'}`,
            `Email: ${session.user.email}`,
            `Телефон: ${session.user.phone || 'Не указан'}`,
            `Желаемый объем: ${quoteForm.requestedVolume || '-'}`,
            `Частота поставок: ${quoteForm.deliveryFrequency}`,
            `Адрес доставки: ${quoteForm.deliveryAddress || '-'}`,
          ].join('\n')
        : '';

      const mergedComment = [orderForm.deliveryComment.trim(), quoteComment]
        .filter(Boolean)
        .join('\n\n');

      const order = await api.createOrder(session.accessToken, {
        campaignId: id,
        volume: Number(isB2BBuyer ? quoteForm.requestedVolume : orderForm.volume),
        deliveryMode: isB2BBuyer ? 'full_delivery' : orderForm.deliveryMode,
        deliveryAddress:
          isB2BBuyer
            ? quoteForm.deliveryAddress || undefined
            : orderForm.deliveryMode === 'pickup'
              ? undefined
              : orderForm.deliveryAddress || undefined,
        deliveryComment: mergedComment || undefined,
        firstDeliveryDate:
          orderForm.deliveryMode === 'partial_delivery'
            ? orderForm.firstDeliveryDate || undefined
            : undefined,
        quoteDeliveryFrequency: isB2BBuyer ? quoteForm.deliveryFrequency : undefined,
        quoteRequestedTotalVolume: isB2BBuyer
          ? Number(quoteForm.requestedVolume)
          : undefined,
        quoteBatchVolume:
          isB2BBuyer && ['weekly', 'daily'].includes(quoteForm.deliveryFrequency)
            ? Number(quoteForm.batchVolume)
            : undefined,
      });
      setCreatedOrder(order);
      await loadCampaign(id);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Не удалось создать заказ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMockPay = async () => {
    if (!session || !createdOrder) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const paidOrder = await api.mockPay(session.accessToken, createdOrder.id);
      setCreatedOrder(paidOrder);
      if (campaign?.id) {
        await loadCampaign(campaign.id);
      }
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Не удалось провести оплату');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        {showBackToCatalog ? (
          <Link className="button secondary" to="/catalog">
            Назад в каталог
          </Link>
        ) : null}

        {loading ? <p>Загружаем кампанию...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {campaign ? (
          <>
            {isFarmerOwner ? (
              <section className="card farmer-owner-banner">
                <h3>Просмотр собственной кампании</h3>
                <p>
                  Вы просматриваете собственную кампанию. Оформление предзаказа на свою
                  кампанию недоступно.
                </p>
                <div className="form-actions">
                  <Link className="button secondary" to="/dashboard">
                    Вернуться в кабинет
                  </Link>
                </div>
              </section>
            ) : null}
            <div className={isFarmerOwner ? 'campaign-layout campaign-layout-wide' : 'campaign-layout'}>
            <div className="page-stack">
              <div className="section-header">
                <div>
                  <span className="eyebrow">
                    {campaign.product.name} / {campaign.product.unit}
                  </span>
                  <h1>{campaign.title}</h1>
                  <p>{campaign.description || 'Описание кампании пока не заполнено.'}</p>
                </div>
              </div>
              <div className="campaign-gallery">
                {(campaign.imageUrls.length > 0
                  ? campaign.imageUrls
                  : placeholders.campaignCovers
                ).map((imageUrl) => (
                  <img
                    alt={`Фото кампании ${campaign.title}`}
                    className="campaign-cover"
                    key={imageUrl}
                    src={imageUrl}
                  />
                ))}
              </div>

              <div className="card-grid">
                <article className="card">
                  <h3>Условия кампании</h3>
                  <dl className="detail-list">
                    <div>
                      <dt>Сезон</dt>
                      <dd>{campaign.season}</dd>
                    </div>
                    <div>
                      <dt>Цена</dt>
                      <dd>{formatMoney(campaign.unitPrice)}</dd>
                    </div>
                    <div>
                      <dt>Предоплата</dt>
                      <dd>{campaign.prepaymentPercent}%</dd>
                    </div>
                    <div>
                      <dt>Общий объем</dt>
                      <dd>
                        {campaign.totalVolume} {campaign.product.unit}
                      </dd>
                    </div>
                    <div>
                      <dt>Свободно</dt>
                      <dd>
                        {campaign.availableVolume ?? campaign.totalVolume}{' '}
                        {campaign.product.unit}
                      </dd>
                    </div>
                    <div>
                      <dt>Минимальная партия</dt>
                      <dd>
                        {campaign.minOrderVolume} {campaign.product.unit}
                      </dd>
                    </div>
                    <div>
                      <dt>Дедлайн</dt>
                      <dd>{formatDate(campaign.preorderDeadline)}</dd>
                    </div>
                    <div>
                      <dt>Фермер</dt>
                      <dd>
                        <Link to={`/farmers/${campaign.farmer.id}`}>
                          {campaign.farmer.farmerProfile?.companyName ||
                            campaign.farmer.email}
                        </Link>
                      </dd>
                    </div>
                  </dl>
                </article>

                <article className="card">
                  <h3>Pipeline заявки</h3>
                  <ol className="steps-list">
                    <li>Ввести объем и выбрать способ доставки.</li>
                    <li>Система фиксирует цену и считает предоплату.</li>
                    <li>После mock-оплаты заказ переходит в статус `reserved`.</li>
                  </ol>
                </article>
              </div>
            </div>

            {!isFarmerOwner ? (
              <aside className="card sticky-card">
                <h3>{isB2BBuyer ? 'Запрос КП' : 'Оформить бронь'}</h3>
                <form className="form-grid" onSubmit={handleOrderSubmit}>
                {!isB2BBuyer ? (
                  <>
                    <label>
                      Объем
                      <input
                        min={campaign.minOrderVolume}
                        required
                        step="0.1"
                        type="number"
                        value={orderForm.volume}
                        onChange={(event) =>
                          setOrderForm((current) => ({
                            ...current,
                            volume: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label>
                      Способ доставки
                      <select
                        value={orderForm.deliveryMode}
                        onChange={(event) =>
                          setOrderForm((current) => ({
                            ...current,
                            deliveryMode: event.target.value as DeliveryMode,
                          }))
                        }
                      >
                        <option value="pickup">Самовывоз</option>
                        <option value="full_delivery">Привезти всю партию</option>
                        <option value="partial_delivery">Привезти по частям</option>
                      </select>
                    </label>

                    {orderForm.deliveryMode !== 'pickup' ? (
                      <label className="full-width">
                        Адрес доставки
                        <input
                          required
                          value={orderForm.deliveryAddress}
                          onChange={(event) =>
                            setOrderForm((current) => ({
                              ...current,
                              deliveryAddress: event.target.value,
                            }))
                          }
                        />
                      </label>
                    ) : null}

                    {orderForm.deliveryMode === 'partial_delivery' ? (
                      <label className="full-width">
                        Первая желаемая дата поставки
                        <input
                          required
                          type="date"
                          value={orderForm.firstDeliveryDate}
                          onChange={(event) =>
                            setOrderForm((current) => ({
                              ...current,
                              firstDeliveryDate: event.target.value,
                            }))
                          }
                        />
                      </label>
                    ) : null}

                    <label className="full-width">
                      Комментарий
                      <textarea
                        rows={3}
                        value={orderForm.deliveryComment}
                        onChange={(event) =>
                          setOrderForm((current) => ({
                            ...current,
                            deliveryComment: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </>
                ) : null}

                {isB2BBuyer ? (
                  <div className="full-width quote-request-box">
                    <h4>Запрос коммерческого предложения (для B2B)</h4>
                    <p>
                      Для B2B-заявки данные передаются фермеру в комментарии к заказу.
                    </p>
                    <div className="form-grid">
                      <label>
                        Требуемый общий объем ({campaign.product.unit})
                        <input
                          min={campaign.minOrderVolume}
                          required
                          step="0.1"
                          type="number"
                          value={quoteForm.requestedVolume}
                          onChange={(event) =>
                            setQuoteForm((current) => ({
                              ...current,
                              requestedVolume: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label>
                        Частота поставок
                        <select
                          value={quoteForm.deliveryFrequency}
                          onChange={(event) =>
                            setQuoteForm((current) => ({
                              ...current,
                              deliveryFrequency: event.target.value as
                                | 'once'
                                | 'weekly'
                                | 'daily',
                            }))
                          }
                        >
                          <option value="once">Разовая поставка</option>
                          <option value="weekly">Еженедельно</option>
                          <option value="daily">Ежедневно</option>
                        </select>
                      </label>
                      {['weekly', 'daily'].includes(quoteForm.deliveryFrequency) ? (
                        <label className="full-width">
                          Требуемая партия доставки ({campaign.product.unit})
                          <input
                            min={0.1}
                            required
                            step="0.1"
                            type="number"
                            value={quoteForm.batchVolume}
                            onChange={(event) =>
                              setQuoteForm((current) => ({
                                ...current,
                                batchVolume: event.target.value,
                              }))
                            }
                          />
                        </label>
                      ) : null}
                      <label className="full-width">
                        Адрес доставки
                        <input
                          required
                          value={quoteForm.deliveryAddress}
                          onChange={(event) =>
                            setQuoteForm((current) => ({
                              ...current,
                              deliveryAddress: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>
                ) : null}

                <div className="summary-box full-width">
                  <div>
                    <span>Итоговая сумма</span>
                    <strong>{formatMoney(totalAmount)}</strong>
                  </div>
                  <div>
                    <span>Предоплата</span>
                    <strong>{formatMoney(prepaymentAmount)}</strong>
                  </div>
                </div>

                <div className="full-width form-actions">
                  <button className="button primary" disabled={submitting} type="submit">
                    {isB2BBuyer ? 'Запросить коммерческое предложение' : 'Создать заказ'}
                  </button>
                </div>
                </form>
                {createdOrder ? (
                  <div className="callout">
                    <p>
                      Заказ создан. Статус: <strong>{createdOrder.status}</strong>
                    </p>
                    <p>Предоплата: {formatMoney(createdOrder.prepaymentAmount)}</p>
                    {createdOrder.status === 'pending_payment' ? (
                      <button
                        className="button primary"
                        disabled={submitting}
                        onClick={handleMockPay}
                        type="button"
                      >
                        Подтвердить mock-оплату
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </aside>
            ) : null}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
