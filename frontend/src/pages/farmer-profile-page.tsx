import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api, formatMoney } from '../shared/api/client';
import { useAuth } from '../app/auth-context';
import { placeholders } from '../shared/placeholders';
import type { FarmerPublicProfile } from '../shared/types';

function formatReviewDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  const datePart = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart} в ${timePart}`;
}

export function FarmerProfilePage() {
  const { farmerId } = useParams();
  const { session } = useAuth();
  const [profile, setProfile] = useState<FarmerPublicProfile | null>(null);
  const [reviewForm, setReviewForm] = useState({
    authorName: session?.user.buyerProfile?.companyName || session?.user.buyerProfile?.displayName || '',
    rating: '5',
    comment: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingOwnReview, setEditingOwnReview] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (id: string) => {
    const data = await api.getFarmerPublicProfile(id);
    setProfile(data);
  };

  useEffect(() => {
    if (!farmerId) {
      return;
    }

    void api
      .getFarmerPublicProfile(farmerId)
      .then((data) => setProfile(data))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить профиль фермера');
      })
      .finally(() => setLoading(false));
  }, [farmerId]);

  const campaigns = profile?.campaigns ?? [];
  const farmer = profile;
  const currentBuyerReview =
    session?.user.role === 'buyer'
      ? profile?.receivedReviews.find((review) => review.buyerId === session.user.id)
      : undefined;
  const buyerAuthorName =
    session?.user.buyerProfile?.companyName ||
    session?.user.buyerProfile?.displayName ||
    session?.user.email ||
    '';

  const stats = useMemo(() => {
    const totalVolume = campaigns.reduce((sum, item) => sum + item.totalVolume, 0);
    return {
      totalProducts: campaigns.length,
      totalVolume,
    };
  }, [campaigns]);

  const orderedReviews = useMemo(() => {
    if (!profile) {
      return [];
    }

    if (!currentBuyerReview) {
      return profile.receivedReviews;
    }

    return [
      currentBuyerReview,
      ...profile.receivedReviews.filter((review) => review.id !== currentBuyerReview.id),
    ];
  }, [profile, currentBuyerReview]);

  const canLeaveReview = session?.user.role === 'buyer' && !!farmerId;

  useEffect(() => {
    if (!canLeaveReview) {
      return;
    }

    setReviewForm((current) => ({
      authorName: currentBuyerReview?.authorName || buyerAuthorName,
      rating: String(currentBuyerReview?.rating ?? current.rating),
      comment: currentBuyerReview?.comment || '',
    }));
  }, [canLeaveReview, currentBuyerReview, buyerAuthorName]);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || !farmerId) {
      return;
    }
    setSubmittingReview(true);
    setError(null);
    try {
      if (currentBuyerReview) {
        await api.updateFarmerReview(session.accessToken, farmerId, currentBuyerReview.id, {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        });
        setEditingOwnReview(false);
      } else {
        await api.createFarmerReview(session.accessToken, farmerId, {
          authorName: buyerAuthorName,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        });
      }
      await loadProfile(farmerId);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить отзыв');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!farmerId) {
    return <Navigate to="/catalog" replace />;
  }

  return (
    <div className="farmer-profile">
      {loading ? <p>Загружаем карточку фермера...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && !error && !profile ? (
        <section className="panel">
          <h1>Фермер не найден</h1>
          <p>Похоже, у этого фермера пока нет опубликованных кампаний.</p>
          <Link className="button secondary" to="/catalog">
            Вернуться в каталог
          </Link>
        </section>
      ) : null}

      {farmer ? (
        <>
          <div className="farmer-profile-grid">
            <div className="farmer-profile-left">
              <section className="farmer-card-block">
                <img
                  alt={farmer.farmerProfile?.displayName || 'Фермер'}
                  className="profile-avatar"
                  src={farmer.farmerProfile?.avatarUrl || placeholders.farmerAvatar}
                />
                <h1>{farmer.farmerProfile?.companyName || 'Фермерское хозяйство'}</h1>
                <p>
                  {farmer.farmerProfile?.about ||
                    `${
                      farmer.farmerProfile?.displayName || 'Поставщик фермерской продукции'
                    }. Работает через предзаказы с фиксированными условиями по объему, цене и срокам.`}
                </p>
                <p className="farmer-card-note">
                  Регион: {farmer.farmerProfile?.region || 'не указан'}. Сертификация:{' '}
                  {farmer.farmerProfile?.certification || 'не указана'}.
                </p>
              </section>

              <section className="farmer-card-block farmer-stats-row">
                <article>
                  <h3>Летний объем</h3>
                  <p>{stats.totalVolume.toFixed(1)} кг</p>
                </article>
                <article>
                  <h3>Годовой объем</h3>
                  <p>{(stats.totalVolume * 2.8).toFixed(1)} кг</p>
                </article>
                <article>
                  <h3>Средний рейтинг</h3>
                  <p>
                    {profile?.averageRating ? `${profile.averageRating} / 5` : 'нет оценок'}
                  </p>
                </article>
              </section>

              <section className="farmer-card-block">
                <h2>Отзывы покупателей</h2>
                <div className="farmer-reviews-list">
                  {orderedReviews.map((review) => {
                    const isOwnReview = currentBuyerReview?.id === review.id;

                    return (
                      <article key={review.id}>
                        <div className="farmer-review-head">
                          <h4>
                            {review.authorName} · {review.rating}/5
                            {isOwnReview ? (
                              <span className="farmer-review-badge">Ваш отзыв</span>
                            ) : null}
                          </h4>
                          <span className="farmer-review-date">
                            {formatReviewDateTime(review.createdAt)}
                          </span>
                        </div>

                        {isOwnReview && editingOwnReview ? (
                          <form className="form-grid" onSubmit={submitReview}>
                            <label>
                              Оценка
                              <select
                                value={reviewForm.rating}
                                onChange={(event) =>
                                  setReviewForm((current) => ({
                                    ...current,
                                    rating: event.target.value,
                                  }))
                                }
                              >
                                <option value="5">5</option>
                                <option value="4">4</option>
                                <option value="3">3</option>
                                <option value="2">2</option>
                                <option value="1">1</option>
                              </select>
                            </label>
                            <label className="full-width">
                              Комментарий
                              <textarea
                                required
                                rows={3}
                                value={reviewForm.comment}
                                onChange={(event) =>
                                  setReviewForm((current) => ({
                                    ...current,
                                    comment: event.target.value,
                                  }))
                                }
                              />
                            </label>
                            <div className="full-width form-actions">
                              <button
                                className="button secondary small"
                                onClick={() => setEditingOwnReview(false)}
                                type="button"
                              >
                                Отмена
                              </button>
                              <button
                                className="button primary small"
                                disabled={submittingReview}
                                type="submit"
                              >
                                Сохранить изменения
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <p>{review.comment}</p>
                            {isOwnReview ? (
                              <div className="form-actions">
                                <button
                                  className="button secondary small"
                                  onClick={() => setEditingOwnReview(true)}
                                  type="button"
                                >
                                  Отредактировать
                                </button>
                              </div>
                            ) : null}
                          </>
                        )}
                      </article>
                    );
                  })}
                  {profile && profile.receivedReviews.length === 0 ? (
                    <p>Пока нет отзывов.</p>
                  ) : null}
                </div>
                {canLeaveReview && !currentBuyerReview ? (
                  <form className="form-grid" onSubmit={submitReview}>
                    <label>
                      Оценка
                      <select
                        value={reviewForm.rating}
                        onChange={(event) =>
                          setReviewForm((current) => ({ ...current, rating: event.target.value }))
                        }
                      >
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                      </select>
                    </label>
                    <label className="full-width">
                      Отзыв
                      <textarea
                        required
                        rows={3}
                        value={reviewForm.comment}
                        onChange={(event) =>
                          setReviewForm((current) => ({ ...current, comment: event.target.value }))
                        }
                      />
                    </label>
                    <div className="full-width form-actions">
                      <button className="button primary small" disabled={submittingReview} type="submit">
                        Отправить отзыв
                      </button>
                    </div>
                  </form>
                ) : null}
              </section>

              <section className="farmer-card-block">
                <h2>Контакты и условия поставки</h2>
                <div className="farmer-contacts-grid">
                  <article>
                    <h4>Email</h4>
                    <p>{farmer.email}</p>
                  </article>
                  <article>
                    <h4>Телефон</h4>
                    <p>{farmer.phone || 'Не указан'}</p>
                  </article>
                </div>
                <p className="farmer-card-note">
                  Условия поставки:{' '}
                  {farmer.farmerProfile?.supplyTerms ||
                    farmer.farmerProfile?.pickupAddress ||
                    'Самовывоз или по договоренности'}
                  .
                </p>
                <div className="hero-actions">
                  <a className="button secondary small" href={`mailto:${farmer.email}`}>
                    Запросить прайс
                  </a>
                  <Link className="button primary small" to="/catalog">
                    Связаться
                  </Link>
                </div>
              </section>
            </div>

            <div className="farmer-profile-right">
              <section className="farmer-card-block">
                <div className="farmer-section-top">
                  <h2>Ассортимент фермера</h2>
                  <span>Доступно товаров: {stats.totalProducts}</span>
                </div>
                <div className="farmer-products-grid">
                  {campaigns.map((campaign) => (
                    <article key={campaign.id} className="farmer-product-card">
                      <img
                        alt={campaign.title}
                        className="campaign-cover"
                        src={campaign.imageUrls[0] || placeholders.campaignCovers[1]}
                      />
                      <h3>{campaign.title}</h3>
                      <p>{campaign.product.name}</p>
                      <p>
                        {formatMoney(campaign.unitPrice)} / {campaign.product.unit}
                      </p>
                      <div className="hero-actions">
                        <a className="button secondary small" href={`mailto:${farmer.email}`}>
                          Запросить
                        </a>
                        <Link className="button primary small" to={`/campaigns/${campaign.id}`}>
                          Заказать
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="farmer-card-block">
                <div className="farmer-section-top">
                  <h2>График поставок и доступность</h2>
                  <span>Отзывы: {profile?.reviewsCount ?? 0}</span>
                </div>
                <div className="farmer-schedule-grid">
                  <article>
                    <h4>Пн–Ср</h4>
                    <p>Отгрузка с 08:00 до 15:00</p>
                  </article>
                  <article>
                    <h4>Чт–Пт</h4>
                    <p>Отгрузка с 10:00 до 17:00</p>
                  </article>
                  <article>
                    <h4>Сб</h4>
                    <p>По предварительной заявке</p>
                  </article>
                </div>
              </section>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

