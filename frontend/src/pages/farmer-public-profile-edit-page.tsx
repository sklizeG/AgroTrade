import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/auth-context';
import { api } from '../shared/api/client';

const initialForm = {
  displayName: '',
  avatarUrl: '',
  companyName: '',
  region: '',
  certification: '',
  pickupAddress: '',
  supplyTerms: '',
  about: '',
};

export function FarmerPublicProfileEditPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || session.user.role !== 'farmer') {
      return;
    }

    void api
      .getMeProfile(session.accessToken)
      .then((meData) =>
        setForm({
          displayName: meData.farmerProfile?.displayName || '',
          avatarUrl: meData.farmerProfile?.avatarUrl || '',
          companyName: meData.farmerProfile?.companyName || '',
          region: meData.farmerProfile?.region || '',
          certification: meData.farmerProfile?.certification || '',
          pickupAddress: meData.farmerProfile?.pickupAddress || '',
          supplyTerms: meData.farmerProfile?.supplyTerms || '',
          about: meData.farmerProfile?.about || '',
        }),
      )
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить профиль'),
      )
      .finally(() => setLoading(false));
  }, [session]);

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
      await api.updateMyFarmerPublicProfile(session.accessToken, {
        displayName: form.displayName || undefined,
        avatarUrl: form.avatarUrl || undefined,
        companyName: form.companyName || undefined,
        region: form.region || undefined,
        certification: form.certification || undefined,
        pickupAddress: form.pickupAddress || undefined,
        supplyTerms: form.supplyTerms || undefined,
        about: form.about || undefined,
      });
      navigate('/dashboard');
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Не удалось сохранить публичную информацию',
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
          <h1>Редактирование публичной информации</h1>
        </div>
      </div>

      {loading ? <p>Загружаем профиль...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading ? (
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Имя фермера
            <input
              value={form.displayName}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayName: event.target.value }))
              }
            />
          </label>
          <label>
            URL аватарки
            <input
              placeholder="https://..."
              value={form.avatarUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, avatarUrl: event.target.value }))
              }
            />
          </label>
          <label>
            Название хозяйства / компании
            <input
              value={form.companyName}
              onChange={(event) =>
                setForm((current) => ({ ...current, companyName: event.target.value }))
              }
            />
          </label>
          <label>
            Регион
            <input
              value={form.region}
              onChange={(event) =>
                setForm((current) => ({ ...current, region: event.target.value }))
              }
            />
          </label>
          <label>
            Сертификация
            <input
              value={form.certification}
              onChange={(event) =>
                setForm((current) => ({ ...current, certification: event.target.value }))
              }
            />
          </label>
          <label>
            Адрес самовывоза
            <input
              value={form.pickupAddress}
              onChange={(event) =>
                setForm((current) => ({ ...current, pickupAddress: event.target.value }))
              }
            />
          </label>
          <label>
            Условия поставки
            <input
              value={form.supplyTerms}
              onChange={(event) =>
                setForm((current) => ({ ...current, supplyTerms: event.target.value }))
              }
            />
          </label>
          <label className="full-width">
            Описание хозяйства
            <textarea
              rows={4}
              value={form.about}
              onChange={(event) =>
                setForm((current) => ({ ...current, about: event.target.value }))
              }
            />
          </label>
          <div className="full-width form-actions">
            <button
              className="button secondary"
              onClick={() => navigate('/dashboard')}
              type="button"
            >
              Отмена
            </button>
            <button className="button primary" disabled={submitting} type="submit">
              Сохранить публичную информацию
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
