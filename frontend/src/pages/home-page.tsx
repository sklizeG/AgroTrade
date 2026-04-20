import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate, formatMoney } from '../shared/api/client';
import { placeholders } from '../shared/placeholders';
import type { Campaign } from '../shared/types';
import { useAuth } from '../app/auth-context';

export function HomePage() {
  const { session } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [partnerRatings, setPartnerRatings] = useState<Record<string, number | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const partnerFarmers = useMemo(() => {
    const unique = new Map<
      string,
      { id: string; name: string; avatarUrl: string; companyName: string }
    >();

    campaigns.forEach((campaign) => {
      const farmerId = campaign.farmer.id;
      if (unique.has(farmerId)) {
        return;
      }

      const companyName =
        campaign.farmer.farmerProfile?.companyName || campaign.farmer.email;
      unique.set(farmerId, {
        id: farmerId,
        name: campaign.farmer.farmerProfile?.displayName || companyName,
        companyName,
        avatarUrl: campaign.farmer.farmerProfile?.avatarUrl || placeholders.farmerAvatar,
      });
    });

    return Array.from(unique.values()).slice(0, 8);
  }, [campaigns]);

  useEffect(() => {
    if (partnerFarmers.length === 0) {
      setPartnerRatings({});
      return;
    }

    let isCancelled = false;

    void Promise.all(
      partnerFarmers.map(async (farmer) => {
        try {
          const profile = await api.getFarmerPublicProfile(farmer.id);
          return { farmerId: farmer.id, rating: profile.averageRating ?? null };
        } catch {
          return { farmerId: farmer.id, rating: null };
        }
      }),
    ).then((items) => {
      if (isCancelled) {
        return;
      }
      const next: Record<string, number | null> = {};
      items.forEach((item) => {
        next[item.farmerId] = item.rating;
      });
      setPartnerRatings(next);
    });

    return () => {
      isCancelled = true;
    };
  }, [partnerFarmers]);

  useEffect(() => {
    void api
      .getCampaigns()
      .then((items) => {
        setCampaigns(items);
        setError(null);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить каталог');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing">
      <section className="landing-hero" id="main">
        <div className="landing-hero-main">
          <h1>Прямые поставки свежих продуктов от фермеров в рестораны</h1>
          <p>
            АгроКруг - прозрачная платформа для честной торговли, где фермеры
            продают, а рестораны закупают быстро и выгодно.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/auth?mode=register&role=farmer">
              Зарегистрироваться как фермер
            </Link>
            <Link className="button secondary" to="/auth?mode=register&role=buyer">
              Зарегистрироваться как покупатель
            </Link>
            <Link className="button secondary" to="/catalog">
              Посмотреть каталог
            </Link>
          </div>
        </div>
        <div className="landing-card">
          <h3>Наши партнеры</h3>
          <div className="partners-grid">
            {partnerFarmers.map((farmer) => (
              <Link
                className="partner-card"
                key={farmer.id}
                title={farmer.companyName}
                to={`/farmers/${farmer.id}`}
              >
                <img alt={farmer.name} className="partner-avatar" src={farmer.avatarUrl} />
                <h4>{farmer.name}</h4>
                <p>
                  Рейтинг:{' '}
                  {partnerRatings[farmer.id] ? `${partnerRatings[farmer.id]} / 5` : 'нет оценок'}
                </p>
              </Link>
            ))}
            {partnerFarmers.length === 0 ? <p>Пока нет активных партнеров.</p> : null}
          </div>
        </div>
      </section>

      <section className="landing-grid" id="farmers">
        <article className="landing-card">
          <h3>Для фермеров</h3>
          <p>Доступ к стабильным заказам и аналитике спроса.</p>
        </article>
        <article className="landing-card">
          <h3>Почему АгроКруг</h3>
          <p>Прозрачная торговля, быстрые выплаты и честная логистика.</p>
        </article>
        <article className="landing-card" id="restaurants">
          <h3>Для ресторанов</h3>
          <p>Проверенные поставщики, удобные заказы и контроль поставок.</p>
        </article>
      </section>

      <section className="landing-card">
        <h3>Как это работает - 3 шага</h3>
        <div className="landing-grid">
          <article className="step-card">
            <div className="step-icon step-icon-register" aria-hidden>
              <svg fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M6.5 18.5c.9-2.5 2.9-3.7 5.5-3.7s4.6 1.2 5.5 3.7" />
                <path d="M18.3 6.8h-2.8M16.9 5.4v2.8" />
              </svg>
            </div>
            <h4>1. Регистрация</h4>
            <p>Создайте профиль и укажите нужные данные.</p>
          </article>
          <article className="step-card">
            <div className="step-icon step-icon-orders" aria-hidden>
              <svg fill="none" viewBox="0 0 24 24">
                <path d="M4.8 6.5h14.4" />
                <path d="M4.8 11.2h14.4" />
                <path d="M4.8 15.9h8.2" />
                <circle cx="17.6" cy="15.9" r="1.7" />
              </svg>
            </div>
            <h4>2. Получение заказов</h4>
            <p>Покупатели оставляют заявки и подтверждают оплаты.</p>
          </article>
          <article className="step-card">
            <div className="step-icon step-icon-delivery" aria-hidden>
              <svg fill="none" viewBox="0 0 24 24">
                <path d="M3.8 8.2h11.6v7.6H3.8z" />
                <path d="M15.4 10.2h2.9l1.9 2.1v3.5h-4.8" />
                <circle cx="8" cy="17.4" r="1.7" />
                <circle cx="17.4" cy="17.4" r="1.7" />
              </svg>
            </div>
            <h4>3. Доставка и оплата</h4>
            <p>Доставляйте продукцию и закрывайте поставки в системе.</p>
          </article>
        </div>
      </section>

      <section className="panel home-campaigns-section" id="catalog">
        <div className="section-header">
          <div>
            <span className="eyebrow">Каталог кампаний</span>
            <h2>Активные предложения фермеров</h2>
          </div>
          <p>Откройте полный каталог и выберите подходящие кампании предзаказов.</p>
        </div>

        {loading ? <p>Загружаем кампании...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="card-grid">
          {campaigns.slice(0, 3).map((campaign) => (
            <article className="card" key={campaign.id}>
              <img
                alt={campaign.title}
                className="campaign-cover"
                src={campaign.imageUrls[0] || placeholders.campaignCovers[0]}
              />
              <div className="card-meta">
                <span>{campaign.product.name}</span>
                <span>{campaign.product.unit}</span>
              </div>
              <h3>{campaign.title}</h3>
              <p>{campaign.description || 'Описание пока не заполнено.'}</p>
              <dl className="detail-list">
                <div>
                  <dt>Цена</dt>
                  <dd>{formatMoney(campaign.unitPrice)}</dd>
                </div>
                <div>
                  <dt>Минимальный объем</dt>
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
                    {campaign.farmer.farmerProfile?.companyName ||
                      campaign.farmer.email}
                  </dd>
                </div>
              </dl>
              <Link className="button secondary" to={`/campaigns/${campaign.id}`}>
                Открыть кампанию
              </Link>
            </article>
          ))}
        </div>

        {!loading && !error && campaigns.length === 0 ? (
          <p>Пока нет опубликованных кампаний.</p>
        ) : null}
        {!loading && !error && campaigns.length > 0 ? (
          <div className="hero-actions home-campaigns-actions">
            <Link className="button primary" to="/catalog">
              Открыть все кампании
            </Link>
          </div>
        ) : null}
      </section>

      {!session ? (
        <section className="landing-card" id="contacts">
          <h3>Начните работу уже сегодня</h3>
          <p>
            Присоединийся к нашему сообществу и получай качественную продукцию уже
            завтра!
          </p>
          <div className="hero-actions">
            <Link className="button secondary" to="/auth">
              Войти
            </Link>
            <Link className="button primary" to="/auth?mode=register">
              Зарегистрироваться
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
