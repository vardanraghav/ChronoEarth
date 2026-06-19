'use client';

export type WhatsHotItem = {
  year: number;
  category: string;
  headline: string;
  summary?: string;
  time?: string;
  confidence?: string;
};

export default function WhatsHotFeed({
  items,
  title = "WHAT'S HOT",
  onItemClick,
}: {
  activeYear?: number;
  items: WhatsHotItem[];
  title?: string;
  onItemClick?: (item: WhatsHotItem) => void;
}) {
  const visible = items.slice(0, 4);

  return (
    <div className="ce-hot" aria-label="What's hot feed">
      <div className="ce-hot__title">{title}</div>

      <div className="ce-hot__list" role="list">
        {visible.map((it, idx) => (
          <button
            key={`${it.headline}-${idx}`}
            type="button"
            className="ce-hot__item"
            onClick={() => onItemClick?.(it)}
          >
            <div className="ce-hot__meta">
              <span className="ce-hot__category">{it.category}</span>
              {it.confidence && (
                <span className="ce-hot__confidence">Confidence {it.confidence}</span>
              )}
            </div>
            <div className="ce-hot__headline">{it.headline}</div>
            {it.summary && <div className="ce-hot__summary">{it.summary}</div>}
            {it.time && <div className="ce-hot__time">{it.time}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
