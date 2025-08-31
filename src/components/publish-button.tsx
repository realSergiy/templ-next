'use client';

import { useState, useTransition } from 'react';
import { publishRoadmap } from '@/app/actions';
import { Upload } from 'lucide-react';
import Link from 'next/link';

export const PublishButton = () => {
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishRoadmap();
      if (result.success) {
        setIsPublished(true);
        setTimeout(() => {
          setIsPublished(false);
        }, 5000);
      }
    });
  };

  return (
    <>
      <button
        onClick={handlePublish}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        {isPending ? 'Publishing...' : 'Publish'}
      </button>

      {isPublished && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <p className="text-green-800 font-medium mb-2">Roadmap published successfully!</p>
          <Link href="/public" className="text-green-600 hover:text-green-700 underline text-sm">
            View public roadmap →
          </Link>
        </div>
      )}
    </>
  );
};
