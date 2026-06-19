'use client';

import { useRouter } from 'next/navigation';
import { CityData, generateCityIntelligence } from '@/data/citiesData';
import { getExtendedCityData, getCitySlug } from '@/data/citiesExtendedData';

const COUNTRY_FLAGS: Record<string, string> = {
  India: '🇮🇳',
  Japan: '🇯🇵',
  'South Korea': '🇰🇷',
  Singapore: '🇸🇬',
  'United Arab Emirates': '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  'United Kingdom': '🇬🇧',
  France: '🇫🇷',
  Germany: '🇩🇪',
  'United States': '🇺🇸',
  USA: '🇺🇸',
  China: '🇨🇳',
  Russia: '🇷🇺',
  Canada: '🇨🇦',
  Australia: '🇦🇺',
  Brazil: '🇧🇷',
};

const AI_HUBS = new Set([
  'Singapore', 'Tokyo', 'New York', 'London', 'Shanghai', 'Dubai',
  'New Delhi', 'Delhi', 'Mumbai', 'Bengaluru', 'Seoul', 'Beijing',
  'Los Angeles', 'Paris', 'Berlin',
]);

function riskLabel(score: number) {
  if (score >= 70) return 'HIGH';
  if (score >= 45) return 'MODERATE';
  return 'LOW';
}

function getPredictions(city: CityData) {
  const ext = getExtendedCityData(city.name);
  if (ext.futureProjects?.length) {
    return ext.futureProjects.slice(0, 3).map((p) => p.name);
  }
  return [
    'Autonomous Port Network',
    'Quantum Trade Exchange',
    'AI Governance Platform',
  ];
}

export default function NodeIntelligencePanel({
  city,
  activeYear,
  activeSimulations,
  onClose,
}: {
  city: CityData;
  activeYear: number;
  activeSimulations: {
    seaLevelRise: number;
    fusionBreakthrough: boolean;
    agiEmergence: boolean;
    popDecline: boolean;
    renewableTransition: boolean;
    arcticDominance: boolean;
    semiDisruptions: boolean;
  };
  onClose: () => void;
}) {
  const router = useRouter();
  const stats = generateCityIntelligence(city, activeYear, activeSimulations);
  const flag = COUNTRY_FLAGS[city.country] ?? '🌐';
  const hubType = AI_HUBS.has(city.name) ? 'AI HUB' : 'INTEL NODE';
  const fusionAccess = activeSimulations.fusionBreakthrough || activeYear >= 2040 ? 'YES' : 'NO';
  const predictions = getPredictions(city);

  return (
    <div className="ce-intel">
      <button type="button" className="ce-intel__back" onClick={onClose}>
        ← BACK
      </button>

      <div className="ce-intel__rule" />

      <div className="ce-intel__header">
        <h2 className="ce-intel__city">{city.name.toUpperCase()}</h2>
        <span className="ce-intel__flag">{flag}</span>
      </div>
      <div className="ce-intel__hub">{hubType}</div>

      <div className="ce-intel__rule" />

      <dl className="ce-intel__stats">
        <div className="ce-intel__stat">
          <dt>Population</dt>
          <dd>{stats.population.toFixed(1)}M</dd>
        </div>
        <div className="ce-intel__stat">
          <dt>AI Readiness</dt>
          <dd>{Math.round(stats.smartCityIndex)}</dd>
        </div>
        <div className="ce-intel__stat">
          <dt>Fusion Access</dt>
          <dd>{fusionAccess}</dd>
        </div>
        <div className="ce-intel__stat">
          <dt>Climate Risk</dt>
          <dd>{riskLabel(stats.climateRisk)}</dd>
        </div>
      </dl>

      <div className="ce-intel__rule" />

      <div className="ce-intel__section">
        <div className="ce-intel__sectionTitle">PREDICTIONS</div>
        <ul className="ce-intel__list">
          {predictions.map((p) => (
            <li key={p}>• {p}</li>
          ))}
        </ul>
      </div>

      <div className="ce-intel__rule" />

      <button
        type="button"
        className="ce-intel__cta"
        onClick={() => router.push(`/city/${getCitySlug(city.name)}`)}
      >
        Explore Intelligence
      </button>
    </div>
  );
}
