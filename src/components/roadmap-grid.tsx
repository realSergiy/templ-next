'use client';

import { useState, useOptimistic, useTransition, useEffect, useRef } from 'react';
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
    (state, update: { type: 'delete'; id: string } | { type: 'update'; feature: Feature }) => {
      if (update.type === 'delete') {
        return state.filter(f => f.id !== update.id);
      }
      return state.map(f => (f.id === update.feature.id ? update.feature : f));
    },
  );
  const [isPending, startTransition] = useTransition();
  const [draggedFeature, setDraggedFeature] = useState<Feature | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const gridWidth = 1200;
  const laneHeight = 80;
  const headerHeight = 40;
  const startQuarter = quarters[0];
  if (!startQuarter) {
    throw new Error('No quarters available');
  }
  const totalQuarters = quarters.length;

  const handleDelete = (id: string) => {
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

  const handleDragStart = (e: React.MouseEvent, feature: Feature) => {
    e.preventDefault();
    e.stopPropagation();

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const featureLaneIndex = lanes.findIndex(l => l.id === feature.laneId);
    const featureX =
      (getQuarterPosition(feature.startQuarter, startQuarter, totalQuarters) / 100) * gridWidth;
    const featureY = headerHeight + featureLaneIndex * laneHeight + 10;

    setDragOffset({
      x: e.clientX - rect.left - featureX,
      y: e.clientY - rect.top - featureY,
    });

    setDraggedFeature(feature);
    setIsDragging(true);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging || !draggedFeature) return;
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleDragEnd = (e: MouseEvent) => {
      if (!isDragging || !draggedFeature || !svgRef.current) {
        setIsDragging(false);
        setDraggedFeature(undefined);
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - headerHeight;

      const quarterIndex = Math.floor((x / gridWidth) * totalQuarters);
      const newStartQuarter = quarters[quarterIndex];
      const laneIndex = Math.floor(y / laneHeight);
      const newLaneId = lanes[laneIndex]?.id;

      if (
        !newStartQuarter ||
        !newLaneId ||
        (newStartQuarter === draggedFeature.startQuarter && newLaneId === draggedFeature.laneId)
      ) {
        setIsDragging(false);
        setDraggedFeature(undefined);
        return;
      }

      const duration = draggedFeature.endQuarter - draggedFeature.startQuarter;
      const newEndQuarter = newStartQuarter + duration;

      const updatedFeature = {
        ...draggedFeature,
        laneId: newLaneId,
        startQuarter: newStartQuarter,
        endQuarter: newEndQuarter,
      };

      startTransition(async () => {
        addOptimisticUpdate({ type: 'update', feature: updatedFeature });
        const result = await updateFeature({
          id: draggedFeature.id,
          laneId: newLaneId,
          startQuarter: newStartQuarter,
          endQuarter: newEndQuarter,
        });

        if (result.success) {
          setFeatures(prev => prev.map(f => (f.id === draggedFeature.id ? updatedFeature : f)));
        } else {
          setFeatures(initialFeatures);
        }
      });

      setIsDragging(false);
      setDraggedFeature(undefined);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.body.style.userSelect = '';
      };
    }
  }, [
    isDragging,
    draggedFeature,
    dragOffset,
    startQuarter,
    totalQuarters,
    gridWidth,
    headerHeight,
    laneHeight,
    quarters,
    lanes,
    addOptimisticUpdate,
    startTransition,
    setFeatures,
    initialFeatures,
  ]);

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200">
      <svg
        ref={svgRef}
        width={gridWidth}
        height={headerHeight + lanes.length * laneHeight}
        className="overflow-visible"
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
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
          if (laneIndex === -1) return;

          const isBeingDragged = draggedFeature?.id === feature.id && isDragging;
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
              className="group"
              style={{
                cursor: isBeingDragged ? 'grabbing' : 'grab',
                opacity: isBeingDragged ? 0.5 : 1,
              }}
              onMouseDown={e => {
                handleDragStart(e, feature);
              }}
            >
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={4}
                fill={feature.color ?? '#3b82f6'}
                fillOpacity={isPending ? 0.6 : 0.9}
                className="transition-opacity"
              />
              <foreignObject x={x} y={y} width={width} height={height} pointerEvents="none">
                <div className="h-full flex items-center justify-between px-3 text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <GripHorizontal className="w-4 h-4 opacity-60" />
                    <span className="text-sm font-medium truncate">{feature.title}</span>
                    {feature.linkUrl && <Link className="w-3 h-3" />}
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(feature.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                    aria-label="Delete feature"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </foreignObject>
            </g>
          );
        })}

        {isDragging &&
          draggedFeature &&
          svgRef.current &&
          (() => {
            const rect = svgRef.current.getBoundingClientRect();
            const x = mousePosition.x - rect.left - dragOffset.x;
            const y = mousePosition.y - rect.top - dragOffset.y;
            const width =
              (getQuarterWidth(
                draggedFeature.startQuarter,
                draggedFeature.endQuarter,
                totalQuarters,
              ) /
                100) *
              gridWidth;
            const height = laneHeight - 20;

            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={4}
                  fill={draggedFeature.color ?? '#3b82f6'}
                  fillOpacity={0.8}
                />
                <foreignObject x={x} y={y} width={width} height={height}>
                  <div className="h-full flex items-center px-3 text-white">
                    <GripHorizontal className="w-4 h-4 opacity-60 mr-2" />
                    <span className="text-sm font-medium truncate">{draggedFeature.title}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })()}
      </svg>
    </div>
  );
};
