'use client';

import { CityData } from '@/data/citiesData';
import WhatsHotFeed, { WhatsHotItem } from '@/components/WhatsHotFeed';
import NodeIntelligencePanel from '@/components/NodeIntelligencePanel';

export default function RightPanel({
  activeYear,
  hotItems,
  activeCity,
  activeSimulations,
  onClearCity,
  onHotItemClick,
}: {
  activeYear: number;
  hotItems: WhatsHotItem[];
  activeCity: CityData | null;
  activeSimulations: {
    seaLevelRise: number;
    fusionBreakthrough: boolean;
    agiEmergence: boolean;
    popDecline: boolean;
    renewableTransition: boolean;
    arcticDominance: boolean;
    semiDisruptions: boolean;
  };
  onClearCity: () => void;
  onHotItemClick?: (item: WhatsHotItem) => void;
}) {
  return (
    <aside className="ce-right" aria-label="Intelligence panel">
      <div
        className="ce-right__track"
        data-view={activeCity ? 'intel' : 'feed'}
      >
        <div className="ce-right__pane">
          <WhatsHotFeed
            activeYear={activeYear}
            items={hotItems}
            onItemClick={onHotItemClick}
          />
        </div>
        <div className="ce-right__pane">
          {activeCity && (
            <NodeIntelligencePanel
              city={activeCity}
              activeYear={activeYear}
              activeSimulations={activeSimulations}
              onClose={onClearCity}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
