import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';

export const SignalControlPreview = () => {
  const { approaches, activeCorridors } = useTraffic();
  const emergency = activeCorridors && activeCorridors.length > 0 ? activeCorridors[0] : { active: false };

  return (
    <div className="bg-(--bg-surface) border border-(--border-warm) rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-extrabold text-(--text-main)">
          Signal Control Preview
        </h3>
        {emergency.active && (
          <Badge variant="critical" size="sm">
            PRIORITY OVERRIDE
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {Object.entries(approaches).map(([dir, app]) => {
          const isGreen = app.currentLight === 'GREEN';
          return (
            <div
              key={dir}
              className="bg-(--bg-surface-warm) border border-(--border-warm) rounded-[var(--radius-md)] p-3.5 text-center"
            >
              <div className="text-[12px] font-bold text-(--text-muted) mb-2">
                {dir.toUpperCase()}
              </div>

              {/* Physical Signal Box UI */}
              <div className="inline-flex flex-col gap-1.5 bg-slate-800 py-2 px-2.5 rounded-2xl mb-2.5">
                <div
                  className={`w-4.5 h-4.5 rounded-full ${!isGreen ? 'bg-red-500 shadow-[0_0_10px_#EF4444]' : 'bg-slate-600'}`}
                />
                <div
                  className="w-4.5 h-4.5 rounded-full bg-slate-600"
                />
                <div
                  className={`w-4.5 h-4.5 rounded-full ${isGreen ? 'bg-green-500 shadow-[0_0_10px_#22C55E]' : 'bg-slate-600'}`}
                />
              </div>

              <div className={`text-[13px] font-extrabold ${isGreen ? 'text-(--status-healthy)' : 'text-(--status-critical)'}`}>
                {app.currentLight} ({app.greenSec}s)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
