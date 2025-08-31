import { unstable_cache } from 'next/cache';
import { db, publishedRoadmap } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { PublicRoadmapView } from '@/components/public-roadmap-view';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const getPublishedRoadmap = unstable_cache(
  async () => {
    const latest = await db
      .select()
      .from(publishedRoadmap)
      .orderBy(desc(publishedRoadmap.publishedAt))
      .limit(1);

    if (latest.length === 0) {
      return null;
    }

    return JSON.parse(latest[0]!.data);
  },
  ['published-roadmap'],
  {
    tags: ['roadmap:published'],
    revalidate: 3600,
  },
);

export default async function PublicRoadmap() {
  const roadmapData = await getPublishedRoadmap();

  if (!roadmapData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Published Roadmap</h1>
          <p className="text-gray-600 mb-6">The roadmap hasn't been published yet.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Draft
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Roadmap</h1>
            <p className="text-gray-600 mt-1">
              Published on {new Date(roadmapData.publishedAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Draft
          </Link>
        </div>

        <PublicRoadmapView features={roadmapData.features} lanes={roadmapData.lanes} />
      </div>
    </div>
  );
}
