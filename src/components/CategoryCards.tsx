'use client';

import { EarthMode } from './CesiumGlobeContent';

const categories = [
  { id: 'Climate Recovery',          label: 'CLIMATE'     },
  { id: 'Clean Energy',              label: 'ENERGY'      },
  { id: 'Biodiversity',              label: 'BIOSPHERE'   },
  { id: 'AI Infrastructure',          label: 'AI NET'      },
  { id: 'Smart Cities',              label: 'CITIES'      },
  { id: 'Transportation Networks',   label: 'TRANSPORT'   },
  { id: 'Ocean Monitoring',          label: 'OCEANS'      },
  { id: 'Population Growth',          label: 'PEOPLE'      },
  { id: 'Water Systems',             label: 'WATER'       },
  { id: 'Satellite Network',         label: 'ORBITAL'     },
];

interface CategoryCardsProps {
  activeCategory:    string;
  setActiveCategory: (cat: string) => void;
  earthMode?:        EarthMode;
}

export default function CategoryCards({ activeCategory, setActiveCategory, earthMode = 'realistic' }: CategoryCardsProps) {
  const isCyber = earthMode === 'cyber';
  return (
    <div
      className="fixed z-30 flex items-center gap-5"
      style={{ bottom: '52px', right: '40px', animation: 'fade-up 0.9s 0.6s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 0', fontSize: '8px', fontWeight: isActive ? 400 : 300,
              letterSpacing: '0.35em', textTransform: 'uppercase',
              color: isActive
                ? (isCyber ? '#00f0ff' : 'rgba(255,255,255,0.80)')
                : (isCyber ? 'rgba(0,240,255,0.25)' : 'rgba(255,255,255,0.25)'),
              textShadow: isActive && isCyber ? '0 0 12px rgba(0,240,255,0.60)' : 'none',
              borderBottom: isActive
                ? `1px solid ${isCyber ? 'rgba(0,240,255,0.55)' : 'rgba(255,255,255,0.40)'}`
                : '1px solid transparent',
              transition: 'color 0.4s ease, border-color 0.4s ease, text-shadow 0.4s ease',
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
