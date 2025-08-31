'use client';

import { useState, useTransition } from 'react';
import { createFeature } from '@/app/actions';
import type { Lane } from '@/lib/db';
import { quarterToString } from '@/lib/utils';
import { Plus } from 'lucide-react';

type Props = {
  lanes: Lane[];
  quarters: number[];
};

export const CreateFeatureForm = ({ lanes, quarters }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      const result = await createFeature({
        title: formData.get('title') as string,
        laneId: formData.get('laneId') as string,
        startQuarter: Number(formData.get('startQuarter')),
        endQuarter: Number(formData.get('endQuarter')),
        linkUrl: (formData.get('linkUrl') as string) || undefined,
        color: (formData.get('color') as string) || undefined,
      });

      if (result.success) {
        setIsOpen(false);
      } else {
        setError(result.error || 'Failed to create feature');
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); }}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <Plus className="w-4 h-4" />
        Add Feature
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Create New Feature</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="laneId" className="block text-sm font-medium text-gray-700 mb-1">
            Lane
          </label>
          <select
            id="laneId"
            name="laneId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a lane</option>
            {lanes.map(lane => (
              <option key={lane.id} value={lane.id}>
                {lane.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="color"
            id="color"
            name="color"
            defaultValue="#3b82f6"
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>

        <div>
          <label htmlFor="startQuarter" className="block text-sm font-medium text-gray-700 mb-1">
            Start Quarter
          </label>
          <select
            id="startQuarter"
            name="startQuarter"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select quarter</option>
            {quarters.map(q => (
              <option key={q} value={q}>
                {quarterToString(q)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="endQuarter" className="block text-sm font-medium text-gray-700 mb-1">
            End Quarter
          </label>
          <select
            id="endQuarter"
            name="endQuarter"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select quarter</option>
            {quarters.map(q => (
              <option key={q} value={q}>
                {quarterToString(q)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Link URL (optional)
          </label>
          <input
            type="url"
            id="linkUrl"
            name="linkUrl"
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isPending ? 'Creating...' : 'Create Feature'}
        </button>
        <button
          type="button"
          onClick={() => { setIsOpen(false); }}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
