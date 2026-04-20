import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../shared/api/client';

const initialForm = {
  name: '',
  phone: '',
};

export function ContactsPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.createFeedbackRequest({
        name: form.name,
        phone: form.phone,
      });
      setForm(initialForm);
      setSuccessMessage(
        'Спасибо за обращение! Наш менеджер свяжется с вами в течение часа.',
      );
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contacts-page">
      <section className="panel contacts-hero">
        <h1>Спасибо, что пользуетесь сервисом АгроКруг</h1>
        <p>
          Мы ценим ваше доверие. Оставьте заявку, и команда поддержки поможет по любому
          вопросу о работе платформы.
        </p>
      </section>

      <section className="panel contacts-layout">
        <article className="card">
          <h2>Оставить заявку на обратную связь</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Имя
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label>
              Номер телефона
              <input
                required
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </label>
            <div className="full-width form-actions">
              <button className="button primary" disabled={submitting} type="submit">
                Отправить заявку
              </button>
            </div>
          </form>

          {error ? <p className="error-text">{error}</p> : null}
          {successMessage ? <p className="callout">{successMessage}</p> : null}
        </article>

        <article className="card contacts-extra">
          <h2>Мы на связи</h2>
          <p>
            Ниже размещены кнопки социальных сетей. Ссылки можно будет добавить позже для
            быстрого перехода.
          </p>
          <div className="contacts-socials">
            <button className="contacts-social-button" type="button">
              YT
            </button>
            <button className="contacts-social-button" type="button">
              TG
            </button>
          </div>
          <p className="contacts-mail">Ivvpull@yandex.ru</p>
        </article>
      </section>
    </div>
  );
}
