import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, formatDate, formatMoney } from '../shared/api/client';
import { placeholders } from '../shared/placeholders';
import type { Campaign } from '../shared/types';

function campaignMatchesQuery(campaign: Campaign, q: string): boolean {
  const hay = [
    campaign.title,
    campaign.season,
    campaign.description,
    campaign.product.name,
    campaign.product.description,
    campaign.farmer.email,
    campaign.farmer.farmerProfile?.companyName,
    campaign.farmer.farmerProfile?.displayName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return hay.includes(q);
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim().toLowerCase() ?? '';
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') ?? '');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minAvailable, setMinAvailable] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'priceAsc' | 'priceDesc' | 'deadline'>(
    'relevance',
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const productOptions = useMemo(
    () => Array.from(new Set(campaigns.map((campaign) => campaign.product.name))).sort(),
    [campaigns],
  );

  const visibleCampaigns = useMemo(() => {
    const maxPriceValue = Number(maxPrice);
    const minAvailableValue = Number(minAvailable);

    const filtered = campaigns.filter((campaign) => {
      if (query && !campaignMatchesQuery(campaign, query)) {
        return false;
      }

      if (
        selectedProducts.length > 0 &&
        !selectedProducts.includes(campaign.product.name)
      ) {
        return false;
      }

      if (maxPrice && Number.isFinite(maxPriceValue) && campaign.unitPrice > maxPriceValue) {
        return false;
      }

      const available = campaign.availableVolume ?? campaign.totalVolume;
      if (minAvailable && Number.isFinite(minAvailableValue) && available < minAvailableValue) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered];
    if (sortBy === 'priceAsc') {
      sorted.sort((a, b) => a.unitPrice - b.unitPrice);
    } else if (sortBy === 'priceDesc') {
      sorted.sort((a, b) => b.unitPrice - a.unitPrice);
    } else if (sortBy === 'deadline') {
      sorted.sort(
        (a, b) =>
          new Date(a.preorderDeadline).getTime() - new Date(b.preorderDeadline).getTime(),
      );
    }

    return sorted;
  }, [campaigns, maxPrice, minAvailable, query, selectedProducts, sortBy]);

  useEffect(() => {
    void api
      .getCampaigns()
      .then((items) => {
        setCampaigns(items);
        setError(null);
      })
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error ? reason.message : 'Не удалось загрузить каталог кампаний',
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearchDraft(searchParams.get('q') ?? '');
  }, [searchParams]);

  const resetFilters = () => {
    setSelectedProducts([]);
    setMaxPrice('');
    setMinAvailable('');
    setSortBy('relevance');
  };

  const toggleProduct = (name: string) => {
    setSelectedProducts((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  const handleCatalogSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchDraft.trim();
    const nextParams = new URLSearchParams(searchParams);
    if (term) {
      nextParams.set('q', term);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
  };

  return (
    <section className="catalog-market">
      <aside className="catalog-filters">
        <div className="catalog-filters-head">
          <h2>Фильтры</h2>
          <button className="button secondary small" onClick={resetFilters} type="button">
            Сбросить
          </button>
        </div>
        <div className="catalog-filter-group">
          <h3>Категория продукта</h3>
          <div className="catalog-check-list">
            {productOptions.map((product) => (
              <label key={product}>
                <input
                  checked={selectedProducts.includes(product)}
                  onChange={() => toggleProduct(product)}
                  type="checkbox"
                />
                <span>{product}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="catalog-filter-group">
          <h3>Максимальная цена за единицу</h3>
          <input
            min={0}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Например, 250"
            step="0.01"
            type="number"
            value={maxPrice}
          />
        </div>

        <div className="catalog-filter-group">
          <h3>Минимальный остаток</h3>
          <input
            min={0}
            onChange={(event) => setMinAvailable(event.target.value)}
            placeholder="Например, 20"
            step="0.1"
            type="number"
            value={minAvailable}
          />
        </div>
      </aside>

      <div className="catalog-content">
        <div className="catalog-head">
          <div>
            <span className="eyebrow">Каталог</span>
            <h1>Кампании предзаказов</h1>
            <p>Карточки кампаний в формате маркетплейса: выбирайте, фильтруйте и бронируйте.</p>
            <form className="catalog-search-form" onSubmit={handleCatalogSearch}>
              <input
                aria-label="Поиск по продуктам или фермам"
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Поиск продукта, региона или фермера"
                type="search"
                value={searchDraft}
              />
              <button className="button secondary small" type="submit">
                Найти
              </button>
            </form>
          </div>
          <div className="catalog-meta">
            <label>
              Сортировка
              <select
                onChange={(event) =>
                  setSortBy(
                    event.target.value as 'relevance' | 'priceAsc' | 'priceDesc' | 'deadline',
                  )
                }
                value={sortBy}
              >
                <option value="relevance">По релевантности</option>
                <option value="priceAsc">Цена: по возрастанию</option>
                <option value="priceDesc">Цена: по убыванию</option>
                <option value="deadline">Сначала ближайший дедлайн</option>
              </select>
            </label>
            <span className="catalog-count">Найдено: {visibleCampaigns.length}</span>
          </div>
        </div>

        {loading ? <p>Загружаем кампании...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="catalog-product-grid">
          {visibleCampaigns.map((campaign) => (
            <article className="catalog-product-card" key={campaign.id}>
              <img
                alt={campaign.title}
                className="campaign-cover"
                src={campaign.imageUrls[0] || placeholders.campaignCovers[0]}
              />
              <div className="catalog-product-top">
                <span className="catalog-pill">{campaign.product.name}</span>
                <strong>{formatMoney(campaign.unitPrice)}</strong>
              </div>
              <h3>{campaign.title}</h3>
              <p>{campaign.description || 'Описание кампании пока не заполнено.'}</p>
              <div className="catalog-product-meta">
                <span>
                  Остаток: {campaign.availableVolume ?? campaign.totalVolume} {campaign.product.unit}
                </span>
                <span>
                  Мин. партия: {campaign.minOrderVolume} {campaign.product.unit}
                </span>
                <span>Дедлайн: {formatDate(campaign.preorderDeadline)}</span>
              </div>
              <div className="catalog-product-footer">
                <small>
                  <Link to={`/farmers/${campaign.farmer.id}`}>
                    {campaign.farmer.farmerProfile?.companyName || campaign.farmer.email}
                  </Link>
                </small>
                <div className="hero-actions">
                  <Link className="button secondary small" to={`/farmers/${campaign.farmer.id}`}>
                    Профиль
                  </Link>
                  <Link
                    className="button primary small"
                    state={{ fromCatalog: true }}
                    to={`/campaigns/${campaign.id}`}
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!loading && !error && campaigns.length === 0 ? (
          <p>Пока нет опубликованных кампаний предзаказов.</p>
        ) : null}

        {!loading && !error && campaigns.length > 0 && visibleCampaigns.length === 0 ? (
          <p>Ничего не найдено по выбранным фильтрам. Попробуйте смягчить условия.</p>
        ) : null}
      </div>
    </section>
  );
}
