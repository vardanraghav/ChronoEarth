'use client';

const categories = [
  { id: 'Ocean Monitoring',  label: 'OCEAN'      },
  { id: 'Biodiversity',      label: 'BIOSPHERE'  },
  { id: 'Clean Energy',      label: 'ENERGY'     },
  { id: 'Satellite Network', label: 'ORBITAL'    },
];

interface CategoryCardsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function CategoryCards({ activeCategory, setActiveCategory }: CategoryCardsProps) {
  return (
    <div
      className="fixed z-30 flex items-center gap-6"
      style={{
        bottom: '52px',
        right: '40px',
        animation: 'fade-up 0.9s 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background:   'none',
              border:       'none',
              cursor:       'pointer',
              padding:      '4px 0',
              fontSize:     '8px',
              fontWeight:   300,
              letterSpacing:'0.35em',
              textTransform:'uppercase',
              color: isActive
                ? 'rgba(255,255,255,0.80)'
                : 'rgba(255,255,255,0.25)',
              borderBottom: isActive
                ? '1px solid rgba(255,255,255,0.4)'
                : '1px solid transparent',
              transition: 'color 0.4s ease, border-color 0.4s ease',
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
