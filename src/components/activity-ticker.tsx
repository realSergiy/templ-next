'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

export const ActivityTicker = () => {
  const [activity, setActivity] = useState<string>('Connecting...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/activity');

    eventSource.addEventListener('open', () => {
      setIsConnected(true);
      setActivity('Connected');
    });

    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'viewers') {
          setActivity(`${data.value} viewers online`);
        } else if (data.type === 'hint') {
          setActivity(data.value);
        }
      } catch (e) {
        console.error('Error parsing SSE data:', e);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setActivity('Reconnecting...');
    };

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
