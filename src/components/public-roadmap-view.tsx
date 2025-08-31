import type { Feature, Lane } from '@/lib/db';
import { quarterToString, getQuarterPosition, getQuarterWidth, getQuarterRange } from '@/lib/utils';
import { Link } from 'lucide-react';

type Props = {
  features: Feature[];
  lanes: Lane[];
};

export const PublicRoadmapView = ({ features, lanes }: Props) => {
  const quarters = getQuarterRange();
  const gridWidth = 1200;
  const laneHeight = 80;
  const headerHeight = 40;
  const startQuarter = quarters[0];
  if (!startQuarter) {
    throw new Error('No quarters available');
  }
  const totalQuarters = quarters.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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

        {features.map(feature => {
          const laneIndex = lanes.findIndex(l => l.id === feature.laneId);
          if (laneIndex === -1) return;

          const x =
            (getQuarterPosition(feature.startQuarter, startQuarter, totalQuarters) / 100) *
            gridWidth;
          const width =
            (getQuarterWidth(feature.startQuarter, feature.endQuarter, totalQuarters) / 100) *
            gridWidth;
          const y = headerHeight + laneIndex * laneHeight + 10;
          const height = laneHeight - 20;

          return (
            <g key={feature.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={4}
                fill={feature.color ?? '#3b82f6'}
                fillOpacity={0.9}
              />
              <foreignObject x={x} y={y} width={width} height={height}>
                <div className="h-full flex items-center px-3 text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{feature.title}</span>
                    {feature.linkUrl && <Link className="w-3 h-3 flex-shrink-0" />}
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
