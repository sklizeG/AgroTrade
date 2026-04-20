import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/auth-context';
import { api } from '../shared/api/client';

const initialForm = {
  productName: '',
  productUnit: 'кг',
  productDescription: '',
  title: '',
  season: '2026',
  description: '',
  imageUrlsText: '',
  totalVolume: '',
  minOrderVolume: '',
  unitPrice: '',
  prepaymentPercent: '20',
  preorderDeadline: '',
  availableFrom: '',
};

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

export function FarmerCampaignCreatePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (session.user.role !== 'farmer') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createCampaign(session.accessToken, {
        productName: form.productName,
        productUnit: form.productUnit,
        productDescription: form.productDescription || undefined,
        title: form.title,
        season: form.season,
        description: form.description || undefined,
        imageUrls: normalizeImageUrls(form.imageUrlsText),
        totalVolume: Number(form.totalVolume),
        minOrderVolume: Number(form.minOrderVolume),
        unitPrice: Number(form.unitPrice),
        prepaymentPercent: Number(form.prepaymentPercent),
        preorderDeadline: new Date(form.preorderDeadline).toISOString(),
        availableFrom: form.availableFrom
          ? new Date(form.availableFrom).toISOString()
          : undefined,
      });
      navigate('/dashboard');
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Не удалось создать кампанию');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Кабинет фермера</span>
          <h1>Создание кампании предзаказа</h1>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Продукт
          <input
            required
            value={form.productName}
            onChange={(event) =>
              setForm((current) => ({ ...current, productName: event.target.value }))
            }
          />
        </label>
        <label>
          Единица измерения
          <input
            required
            value={form.productUnit}
            onChange={(event) =>
              setForm((current) => ({ ...current, productUnit: event.target.value }))
            }
          />
        </label>
        <label className="full-width">
          Название кампании
          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
        </label>
        <label>
          Сезон
          <input
            required
            value={form.season}
            onChange={(event) =>
              setForm((current) => ({ ...current, season: event.target.value }))
            }
          />
        </label>
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
          Минимальная партия
          <input
            required
            step="0.1"
            type="number"
            value={form.minOrderVolume}
            onChange={(event) =>
              setForm((current) => ({ ...current, minOrderVolume: event.target.value }))
            }
          />
        </label>
        <label>
          Цена за единицу
          <input
            required
            step="0.01"
            type="number"
            value={form.unitPrice}
            onChange={(event) =>
              setForm((current) => ({ ...current, unitPrice: event.target.value }))
            }
          />
        </label>
        <label>
          Предоплата, %
          <input
            required
            max="100"
            min="1"
            type="number"
            value={form.prepaymentPercent}
            onChange={(event) =>
              setForm((current) => ({ ...current, prepaymentPercent: event.target.value }))
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
              setForm((current) => ({ ...current, preorderDeadline: event.target.value }))
            }
          />
        </label>
        <label>
          Доступно с
          <input
            type="datetime-local"
            value={form.availableFrom}
            onChange={(event) =>
              setForm((current) => ({ ...current, availableFrom: event.target.value }))
            }
          />
        </label>
        <label className="full-width">
          Описание продукта
          <input
            value={form.productDescription}
            onChange={(event) =>
              setForm((current) => ({ ...current, productDescription: event.target.value }))
            }
          />
        </label>
        <label className="full-width">
          Описание кампании
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
        </label>
        <label className="full-width">
          Фото кампании (каждый URL с новой строки)
          <textarea
            rows={3}
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
            Создать кампанию
          </button>
        </div>
      </form>
    </section>
  );
}
