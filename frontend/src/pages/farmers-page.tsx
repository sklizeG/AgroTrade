import { Link } from 'react-router-dom';
import { useAuth } from '../app/auth-context';

const howToSteps = [
  {
    title: 'Регистрация и профиль',
    text: 'Создайте аккаунт фермера, укажите хозяйство, ИНН и контакты. Модерация занимает до одного рабочего дня.',
  },
  {
    title: 'Кампания предзаказа',
    text: 'Выберите культуру из каталога или добавьте свою, задайте объём, цену, предоплату и срок приёма заявок.',
  },
  {
    title: 'Публикация и сделки',
    text: 'После публикации рестораны и оптовые покупатели бронируют объёмы. Вы видите заказы и статусы оплаты в кабинете.',
  },
];

const faqItems = [
  {
    q: 'Сколько стоит размещение на платформе?',
    a: 'На этапе MVP комиссия не взимается: вы работаете по прозрачной схеме предзаказа, а мы развиваем совместно экосистему.',
  },
  {
    q: 'Как формируется цена и предоплата?',
    a: 'Цену и процент предоплаты вы задаёте сами в кампании. Покупатель видит итог до подтверждения бронирования.',
  },
  {
    q: 'Что если не наберётся нужный объём?',
    a: 'Вы задаёте дедлайн и минимальный объём заказа. Если условия не выполняются, можно закрыть кампанию без обязательств по недобору.',
  },
  {
    q: 'Как происходит доставка и логистика?',
    a: 'В заказе фиксируется режим: самовывоз с поля, полная или частичная доставка. Детали согласуете с покупателем в кабинете.',
  },
];

const successStories = [
  {
    title: '«Теплицы Липецк» — салаты круглый год',
    text: 'За два сезона вывели на платформу 12 ресторанов: предзаказы на микрозелень и салатный микс помогли загрузить теплицы на 40% раньше обычного.',
    meta: 'Липецкая область · овощи',
  },
  {
    title: '«Ягодная долина» — клубника без посредников',
    text: 'Кампания на урожай 2025 закрылась за три недели до сбора: рестораны забронировали 18 тонн по фиксированной цене.',
    meta: 'Краснодарский край · ягоды',
  },
  {
    title: '«ЗерноПлюс» — крупы для сетей',
    text: 'Прямые контракты с HoReCa: пшеничная и гречневая крупа отгружается партиями по графику из элеватора.',
    meta: 'Ростовская область · крупы',
  },
];

const sidebarTips = [
  'Добавьте фото поля или продукции — кампании с визуалом получают больше просмотров.',
  'Укажите реалистичные сроки отгрузки: рестораны планируют меню на недели вперёд.',
  'Отвечайте на заявки в течение 24 часов — так выше рейтинг доверия.',
];

export function FarmersPage() {
  const { session } = useAuth();

  return (
    <div className="farmers-landing">
      <div className="farmers-landing-grid">
        <div className="farmers-main">
          <section className="farmers-block farmers-hero">
            <div className="farmers-hero-copy">
              <span className="farmers-eyebrow">Страница для фермеров</span>
              <h1>АгроКруг — продавайте урожай ресторанам и опту по предзаказу</h1>
              <p>
                Размещайте кампании предзаказа, получайте бронирования объёма с фиксированной ценой и
                планируйте логистику заранее — без лишних звеньев между полем и кухней.
              </p>
              <ul className="farmers-hero-bullets">
                <li>Прямой спрос от B2B и ресторанов</li>
                <li>Прозрачные условия и предоплата</li>
                <li>Личный кабинет и статусы заказов</li>
              </ul>
            </div>
            <div className="farmers-hero-visual" aria-hidden>
              <div className="farmers-hero-visual-inner">
                <span>Предзаказ</span>
                <strong>от поля до сделки</strong>
              </div>
            </div>
          </section>

          <section className="farmers-block">
            <h2 className="farmers-section-title">Как начать</h2>
            <div className="farmers-cards-3">
              {howToSteps.map((step) => (
                <article key={step.title} className="farmers-card">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="farmers-block">
            <h2 className="farmers-section-title">Часто задаваемые вопросы</h2>
            <div className="farmers-faq-grid">
              {faqItems.map((item) => (
                <article key={item.q} className="farmers-faq-item">
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="farmers-block">
            <h2 className="farmers-section-title">Успешные кейсы фермеров</h2>
            <div className="farmers-cards-3">
              {successStories.map((story) => (
                <article key={story.title} className="farmers-card farmers-card-story">
                  <h3>{story.title}</h3>
                  <p>{story.text}</p>
                  <span className="farmers-card-meta">{story.meta}</span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="farmers-sidebar">
          <section className="farmers-block farmers-sidebar-card">
            <h2 className="farmers-sidebar-title">Контактный менеджер</h2>
            <p className="farmers-sidebar-lead">
              Поможем подключить хозяйство, настроить первую кампанию и ответим на вопросы по
              договорам и логистике.
            </p>
            <p className="farmers-manager-name">Анна Морозова</p>
            <p className="farmers-manager-role">партнёрский отдел · пн–пт, 9:00–18:00 (МСК)</p>
            <div className="farmers-sidebar-actions">
              <a className="button secondary small" href="mailto:partner@agrokrug.ru">
                Написать
              </a>
              <a className="button primary small" href="tel:+78001234567">
                Позвонить
              </a>
            </div>
          </section>

          <section className="farmers-block farmers-sidebar-card farmers-sidebar-tips">
            <h2 className="farmers-sidebar-title">Подсказки</h2>
            <ul>
              {sidebarTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {!session ? (
        <section className="farmers-cta-banner" aria-label="Призыв к регистрации">
          <p>Присоединяйтесь к АгроКруг — расширяйте продажи уже сегодня</p>
          <div className="farmers-cta-actions">
            <Link className="button primary small" to="/auth">
              Зарегистрироваться
            </Link>
            <Link className="button secondary small" to="/catalog">
              Смотреть каталог
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
