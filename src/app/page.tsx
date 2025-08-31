import { Suspense } from 'react';
import { db, features, lanes } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { RoadmapGrid } from '@/components/roadmap-grid';
import { CreateFeatureForm } from '@/components/create-feature-form';
import { PublishButton } from '@/components/publish-button';
import { ActivityTicker } from '@/components/activity-ticker';
import { AnalyticsPanel } from '@/components/analytics-panel';
import { getQuarterRange } from '@/lib/utils';

const getDraftData = async () => {
  const [draftFeatures, allLanes] = await Promise.all([
    db.select().from(features).where(eq(features.status, 'draft')),
    db.select().from(lanes).orderBy(lanes.order),
  ]);

  return { features: draftFeatures, lanes: allLanes };
};

export default async function DraftWorkspace() {
  const { features: draftFeatures, lanes: allLanes } = await getDraftData();
  const quarters = getQuarterRange();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roadmap Draft</h1>
            <p className="text-gray-600 mt-1">Plan and organize your product features</p>
          </div>
          <div className="flex gap-4">
            <ActivityTicker />
            <PublishButton />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-9 space-y-6">
            <RoadmapGrid features={draftFeatures} lanes={allLanes} quarters={quarters} />
            <CreateFeatureForm lanes={allLanes} quarters={quarters} />
          </div>

          <div className="col-span-3">
            <Suspense
              fallback={
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              }
            >
              <AnalyticsPanel />
            </Suspense>
          </div>
        </div>

        {draftFeatures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No features yet. Create your first feature to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
