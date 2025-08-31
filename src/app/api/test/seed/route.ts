import { NextResponse } from 'next/server';
import { db, lanes, features } from '@/lib/db';

export const POST = async () => {
  // This endpoint is only for testing - no additional checks needed
  // since it's under /api/test/ path

  const seedLanes = [
    { id: 'platform', name: 'Platform', order: 0 },
    { id: 'ux', name: 'UX', order: 1 },
    { id: 'growth', name: 'Growth', order: 2 },
  ];

  const seedFeatures = [
    {
      id: 'test-f1',
      title: 'Test Feature 1',
      laneId: 'platform',
      startQuarter: 20_251,
      endQuarter: 20_251,
      status: 'draft' as const,
      color: '#3B82F6',
    },
    {
      id: 'test-f2',
      title: 'Test Feature 2',
      laneId: 'ux',
      startQuarter: 20_253,
      endQuarter: 20_253,
      status: 'draft' as const,
      color: '#8B5CF6',
    },
    {
      id: 'test-f3',
      title: 'Test Feature 3',
      laneId: 'growth',
      startQuarter: 20_255,
      endQuarter: 20_255,
      status: 'draft' as const,
      color: '#10B981',
    },
  ];

  try {
    await db.delete(features);
    await db.delete(lanes);

    await db.insert(lanes).values(seedLanes);
    await db.insert(features).values(seedFeatures);

    return NextResponse.json({
      success: true,
      lanes: seedLanes.length,
      features: seedFeatures.length,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
};
