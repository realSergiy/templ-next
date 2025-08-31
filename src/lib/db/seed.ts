import { db, lanes, features } from './index';

const seedLanes = [
  { id: 'platform', name: 'Platform', order: 0 },
  { id: 'ux', name: 'UX', order: 1 },
  { id: 'growth', name: 'Growth', order: 2 },
];

const seedFeatures = [
  {
    id: 'f1',
    title: 'API Gateway',
    laneId: 'platform',
    startQuarter: 20_251,
    endQuarter: 20_252,
    status: 'draft' as const,
    color: '#3B82F6',
    linkUrl: 'https://github.com/kong/gateway',
  },
  {
    id: 'f2',
    title: 'Design System 2.0',
    laneId: 'ux',
    startQuarter: 20_251,
    endQuarter: 20_251,
    status: 'draft' as const,
    color: '#8B5CF6',
  },
  {
    id: 'f3',
    title: 'Microservices Migration',
    laneId: 'platform',
    startQuarter: 20_252,
    endQuarter: 20_254,
    status: 'draft' as const,
    color: '#3B82F6',
    linkUrl: 'https://microservices.io/',
  },
  {
    id: 'f4',
    title: 'User Onboarding Flow',
    laneId: 'ux',
    startQuarter: 20_252,
    endQuarter: 20_253,
    status: 'draft' as const,
    color: '#8B5CF6',
  },
  {
    id: 'f5',
    title: 'SEO Optimization',
    laneId: 'growth',
    startQuarter: 20_251,
    endQuarter: 20_252,
    status: 'draft' as const,
    color: '#10B981',
    linkUrl: 'https://developers.google.com/search/docs',
  },
  {
    id: 'f6',
    title: 'Analytics Dashboard',
    laneId: 'growth',
    startQuarter: 20_253,
    endQuarter: 20_254,
    status: 'draft' as const,
    color: '#10B981',
  },
];

export const seed = async () => {
  console.log('🌱 Seeding database...');

  await db.delete(features);
  await db.delete(lanes);

  await db.insert(lanes).values(seedLanes);
  await db.insert(features).values(seedFeatures);

  console.log('✅ Database seeded successfully!');
};

seed().catch(console.error);
