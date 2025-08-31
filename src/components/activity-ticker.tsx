'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

type ActivityData = {
  type: 'viewers' | 'hint';
  value: string | number;
};

export const ActivityTicker = () => {
  const [activity, setActivity] = useState<string>('Connecting...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/activity');

    eventSource.addEventListener('open', () => {
      setIsConnected(true);
      setActivity('Connected');
    });

    eventSource.addEventListener('message', event => {
      try {
        const rawData = JSON.parse(event.data as string) as unknown;

        // Type guard to ensure data is correct shape
        if (
          typeof rawData === 'object' &&
          rawData !== null &&
          'type' in rawData &&
          'value' in rawData &&
          (rawData.type === 'viewers' || rawData.type === 'hint') &&
          (typeof rawData.value === 'string' || typeof rawData.value === 'number')
        ) {
          const data = rawData as ActivityData;
          if (data.type === 'viewers') {
            setActivity(`${data.value} viewers online`);
          } else {
            setActivity(String(data.value));
          }
        }
      } catch (e) {
        console.error('Error parsing SSE data:', e);
      }
    });

    eventSource.addEventListener('error', () => {
      setIsConnected(false);
      setActivity('Reconnecting...');
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200">
      <Activity className={`w-4 h-4 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
      <span className="text-sm text-gray-600">{activity}</span>
    </div>
  );
};
