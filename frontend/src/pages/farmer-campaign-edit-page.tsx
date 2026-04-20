import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../app/auth-context';
import { api, formatDate } from '../shared/api/client';
import type { Campaign } from '../shared/types';

type EditFormState = {
  totalVolume: string;
  preorderDeadline: string;
  imageUrlsText: string;
};

function toDatetimeLocalValue(value?: string | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function normalizeImageUrls(text: string) {
  return Array.from(
    new Set(
      text
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, 6);
}

export function FarmerCampaignEditPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<EditFormState>({
    totalVolume: '',
    preorderDeadline: '',
    imageUrlsText: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || session.user.role !== 'farmer' || !campaignId) {
      return;
    }

    setLoading(true);
    setError(null);

    void api
      .getFarmerCampaigns(session.accessToken)
      .then((campaigns) => {
        const found = campaigns.find((item) => item.id === campaignId);
        if (!found) {
          throw new Error('Кампания не найдена');
        }
        setCampaign(found);
        setForm({
          totalVolume: String(found.totalVolume),
          preorderDeadline: toDatetimeLocalValue(found.preorderDeadline),
          imageUrlsText: found.imageUrls.join('\n'),
        });
      })
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error ? reason.message : 'Не удалось загрузить кампанию',
        );
      })
      .finally(() => setLoading(false));
  }, [campaignId, session]);

  const limitsHint = useMemo(() => {
    if (!campaign) {
      return '';
    }

    const minVolume = (campaign.totalVolume * 0.6).toFixed(2);
    const maxVolume = (campaign.totalVolume * 1.4).toFixed(2);
    return `Разрешенный диапазон общего объема: ${minVolume} - ${maxVolume} ${campaign.product.unit}. Дедлайн можно сместить максимум на 2 месяца.`;
  }, [campaign]);

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (session.user.role !== 'farmer') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!campaignId) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!campaign) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.updateCampaign(session.accessToken, campaign.id, {
        totalVolume: Number(form.totalVolume),
        preorderDeadline: new Date(form.preorderDeadline).toISOString(),
        imageUrls: normalizeImageUrls(form.imageUrlsText),
      });
      navigate('/dashboard');
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : 'Не удалось сохранить изменения кампании',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Кабинет фермера</span>
          <h1>Редактирование кампании предзаказа</h1>
        </div>
      </div>

      {loading ? <p>Загружаем кампанию...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {campaign ? (
        <>
          <section className="card compact">
            <h3>{campaign.title}</h3>
            <p>
              Продукт: {campaign.product.name} ({campaign.product.unit})
            </p>
            <p>Текущий дедлайн: {formatDate(campaign.preorderDeadline)}</p>
            <p>{limitsHint}</p>
          </section>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Общий объем
              <input
                required
                step="0.1"
                type="number"
                value={form.totalVolume}
                onChange={(event) =>
                  setForm((current) => ({ ...current, totalVolume: event.target.value }))
                }
              />
            </label>
            <label>
              Дедлайн предзаказа
              <input
                required
                type="datetime-local"
                value={form.preorderDeadline}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    preorderDeadline: event.target.value,
                  }))
                }
              />
            </label>
            <label className="full-width">
              Фото кампании (каждый URL с новой строки)
              <textarea
                rows={4}
                value={form.imageUrlsText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrlsText: event.target.value }))
                }
              />
            </label>
            <div className="full-width form-actions">
              <button
                className="button secondary"
                onClick={() => navigate('/dashboard')}
                type="button"
              >
                Отменить
              </button>
              <button className="button primary" disabled={submitting} type="submit">
                Сохранить
              </button>
            </div>
          </form>
        </>
      ) : null}
    </section>
  );
}
