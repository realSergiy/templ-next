'use client';

import { useState, useOptimistic, useTransition } from 'react';
import type { Feature, Lane } from '@/lib/db';
import { quarterToString, getQuarterPosition, getQuarterWidth } from '@/lib/utils';
import { updateFeature, deleteFeature } from '@/app/actions';
import { Trash2, GripHorizontal, Link } from 'lucide-react';

type Props = {
  features: Feature[];
  lanes: Lane[];
  quarters: number[];
};

export const RoadmapGrid = ({ features: initialFeatures, lanes, quarters }: Props) => {
  const [features, setFeatures] = useState(initialFeatures);
  const [optimisticFeatures, addOptimisticUpdate] = useOptimistic(
    features,
    (state, update: { type: 'update' | 'delete'; feature?: Feature; id?: string }) => {
      if (update.type === 'delete') {
        return state.filter(f => f.id !== update.id);
      }
      if (update.type === 'update' && update.feature) {
        return state.map(f => (f.id === update.feature!.id ? update.feature! : f));
      }
      return state;
    },
  );
  const [isPending, startTransition] = useTransition();
  const [draggedFeature, setDraggedFeature] = useState<Feature | null>(null);

  const gridWidth = 1200;
  const laneHeight = 80;
  const headerHeight = 40;
  const startQuarter = quarters[0]!;
  const totalQuarters = quarters.length;

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      addOptimisticUpdate({ type: 'delete', id });
      const result = await deleteFeature({ id });
      if (result.success) {
        setFeatures(prev => prev.filter(f => f.id !== id));
      } else {
        setFeatures(initialFeatures);
      }
    });
  };

  const handleDragStart = (feature: Feature) => {
    setDraggedFeature(feature);
  };

  const handleDragEnd = async (e: React.DragEvent, feature: Feature) => {
    if (!draggedFeature) return;

    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top - headerHeight;

    const quarterIndex = Math.floor((x / gridWidth) * totalQuarters);
    const newStartQuarter = quarters[quarterIndex];
    const laneIndex = Math.floor(y / laneHeight);
    const newLaneId = lanes[laneIndex]?.id;

    if (!newStartQuarter || !newLaneId) return;

    const duration = feature.endQuarter - feature.startQuarter;
    const newEndQuarter = newStartQuarter + duration;

    const updatedFeature = {
      ...feature,
      laneId: newLaneId,
      startQuarter: newStartQuarter,
      endQuarter: newEndQuarter,
    };

    startTransition(async () => {
      addOptimisticUpdate({ type: 'update', feature: updatedFeature });
      const result = await updateFeature({
        id: feature.id,
        laneId: newLaneId,
        startQuarter: newStartQuarter,
        endQuarter: newEndQuarter,
      });

      if (result.success) {
        setFeatures(prev => prev.map(f => (f.id === feature.id ? updatedFeature : f)));
      } else {
        setFeatures(initialFeatures);
      }
    });

    setDraggedFeature(null);
  };

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200">
      <svg
        width={gridWidth}
        height={headerHeight + lanes.length * laneHeight}
        className="overflow-visible"
      >
        <rect width={gridWidth} height={headerHeight} fill="#f9fafb" />
        {quarters.map((quarter, i) => {
          const x = (i / totalQuarters) * gridWidth;
          return (
            <g key={quarter}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={headerHeight + lanes.length * laneHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={x + gridWidth / totalQuarters / 2}
                y={headerHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-gray-600"
              >
                {quarterToString(quarter)}
              </text>
            </g>
          );
        })}

        {lanes.map((lane, i) => {
          const y = headerHeight + i * laneHeight;
          return (
            <g key={lane.id}>
              <rect
                x={0}
                y={y}
                width={gridWidth}
                height={laneHeight}
                fill={i % 2 === 0 ? '#ffffff' : '#fafafa'}
              />
              <line x1={0} y1={y} x2={gridWidth} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text
                x={10}
                y={y + laneHeight / 2}
                dominantBaseline="middle"
                className="text-sm font-medium fill-gray-700"
              >
                {lane.name}
              </text>
            </g>
          );
        })}

        {optimisticFeatures.map(feature => {
          const laneIndex = lanes.findIndex(l => l.id === feature.laneId);
          if (laneIndex === -1) return null;

          const x =
            (getQuarterPosition(feature.startQuarter, startQuarter, totalQuarters) / 100) *
            gridWidth;
          const width =
            (getQuarterWidth(feature.startQuarter, feature.endQuarter, totalQuarters) / 100) *
            gridWidth;
          const y = headerHeight + laneIndex * laneHeight + 10;
          const height = laneHeight - 20;

          return (
            <g
              key={feature.id}
              className="cursor-move group"
              onMouseDown={() => { handleDragStart(feature); }}
              onMouseUp={e => handleDragEnd(e as unknown as React.DragEvent, feature)}
            >
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={4}
                fill={feature.color || '#3b82f6'}
                fillOpacity={isPending ? 0.6 : 0.9}
                className="transition-opacity"
              />
              <foreignObject x={x} y={y} width={width} height={height}>
                <div className="h-full flex items-center justify-between px-3 text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <GripHorizontal className="w-4 h-4 opacity-60" />
                    <span className="text-sm font-medium truncate">{feature.title}</span>
                    {feature.linkUrl && <Link className="w-3 h-3" />}
                  </div>
                  <button
                    onClick={() => handleDelete(feature.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
