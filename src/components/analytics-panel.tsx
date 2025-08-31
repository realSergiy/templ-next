import { db, features, lanes } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { BarChart3 } from 'lucide-react';

const getAnalytics = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const [draftFeatures, allLanes] = await Promise.all([
    db.select().from(features).where(eq(features.status, 'draft')),
    db.select().from(lanes),
  ]);

  const laneStats = allLanes.map(lane => {
    const laneFeatures = draftFeatures.filter(f => f.laneId === lane.id);
    return {
      lane: lane.name,
      count: laneFeatures.length,
    };
  });

  const activeQuarters = new Set<number>();

  for (const feature of draftFeatures) {
    for (let q = feature.startQuarter; q <= feature.endQuarter; q++) {
      activeQuarters.add(q);
    }
  }

  return {
    totalFeatures: draftFeatures.length,
    laneStats,
    activeQuarters: activeQuarters.size,
    averageDuration:
      draftFeatures.length > 0
        ? Math.round(
            draftFeatures.reduce(
              (accumulator, f) => accumulator + (f.endQuarter - f.startQuarter + 1),
              0,
            ) / draftFeatures.length,
          )
        : 0,
  };
};

export const AnalyticsPanel = async () => {
  const analytics = await getAnalytics();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Analytics</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Total Features</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalFeatures}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Features by Lane</p>
          <div className="space-y-2">
            {analytics.laneStats.map(stat => (
              <div key={stat.lane} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{stat.lane}</span>
                <span className="text-sm font-medium text-gray-900">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Quarters</span>
            <span className="text-sm font-medium text-gray-900">{analytics.activeQuarters}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Duration</span>
            <span className="text-sm font-medium text-gray-900">
              {analytics.averageDuration} quarter{analytics.averageDuration === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
