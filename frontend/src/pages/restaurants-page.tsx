import { Link } from 'react-router-dom';

export function RestaurantsPage() {
  const benefits = [
    {
      title: 'Специальные тарифы',
      text: 'Персональные условия для ресторанных сетей и групп закупок с большим объёмом.',
    },
    {
      title: 'Оптовые поставки',
      text: 'Бронируйте крупные партии заранее и фиксируйте цену до начала сезонного спроса.',
    },
    {
      title: 'Гибкие условия доставки',
      text: 'Самовывоз, полная доставка или частями по графику под ваш производственный цикл.',
    },
    {
      title: 'Интеграция с учётными системами',
      text: 'Прозрачные статусы заказов и выгрузка данных для внутреннего учёта закупок.',
    },
  ];

  const cases = [
    {
      title: 'Bistro Nord',
      text: 'Снизили закупочную цену овощей на 14% за счёт прямого бронирования у фермеров.',
    },
    {
      title: 'Casa Verde',
      text: 'Перешли на сезонные предзаказы и сократили внеплановые закупки в пиковые недели.',
    },
    {
      title: 'Ресторан «Сезон»',
      text: 'Закрывают потребность в зелени и ягодах через кампании с фиксированным графиком поставок.',
    },
  ];

  const reviews = [
    {
      author: 'Шеф-повар, Bistro Nord',
      text: 'Доступ к фермерам стал предсказуемым: видим остатки, сроки и бронь в одном окне.',
    },
    {
      author: 'Закупщик, Casa Verde',
      text: 'Важно, что можно заранее зафиксировать объём и работать без посредников.',
    },
    {
      author: 'Операционный менеджер, «Сезон»',
      text: 'Удобно планировать меню: поставки и цены прозрачны ещё до старта сезона.',
    },
  ];

  return (
    <div className="restaurants-landing">
      <section className="restaurants-block restaurants-hero">
        <div className="restaurants-hero-main">
          <span className="restaurants-eyebrow">Страница для ресторанов (B2B)</span>
          <h1>Поставки для ресторанов: надежно, выгодно, индивидуально</h1>
          <p>
            Работайте напрямую с проверенными фермерами, фиксируйте цены и объемы заранее,
            а также оформляйте коммерческие предложения прямо при создании предзаказа.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/catalog">
              Запросить предзаказ
            </Link>
            <Link className="button secondary" to="/auth">
              Связаться с менеджером
            </Link>
          </div>
        </div>
        <div className="restaurants-hero-side" aria-hidden>
          <div className="restaurants-hero-badge">Индивидуальные предложения</div>
        </div>
      </section>

      <section className="restaurants-block">
        <h2 className="restaurants-section-title">Преимущества для ресторанов</h2>
        <div className="restaurants-benefits-grid">
          {benefits.map((item) => (
            <article className="restaurants-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="restaurants-block">
        <h2 className="restaurants-section-title">Кейсы ресторанов</h2>
        <div className="restaurants-triple-grid">
          {cases.map((item) => (
            <article className="restaurants-card compact" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="restaurants-block">
        <h2 className="restaurants-section-title">Отзывы</h2>
        <div className="restaurants-triple-grid">
          {reviews.map((item) => (
            <article className="restaurants-card compact" key={item.author}>
              <h3>{item.author}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
