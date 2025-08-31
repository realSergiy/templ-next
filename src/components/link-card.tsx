'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import ky from 'ky';

type OGData = {
  title: string;
  description: string;
  image: string | undefined;
};

type Props = {
  url: string;
};

export const LinkCard = ({ url }: Props) => {
  const [ogData, setOGData] = useState<OGData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOGData = async () => {
      try {
        const data = await ky
          .get('/api/unfurl', {
            searchParams: { url },
          })
          .json<OGData>();

        setOGData(data);
      } catch (e) {
        if (e instanceof Error && 'response' in e) {
          const kyError = e as { response: { status: number } };
          if (kyError.response.status === 429) {
            setError(true);
            return;
          }
        }
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchOGData();
  }, [url]);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !ogData) {
    const domain = new URL(url).hostname;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition"
      >
        <div className="flex items-start gap-3">
          <img
            src={`/og?title=${encodeURIComponent(domain)}&domain=${encodeURIComponent(domain)}`}
            alt=""
            className="w-12 h-12 rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{domain}</p>
            <p className="text-xs text-gray-500">Link preview unavailable</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      </a>
    );
  }

  const domain = new URL(url).hostname;
  const imageUrl =
    ogData.image ??
    `/og?title=${encodeURIComponent(ogData.title)}&domain=${encodeURIComponent(domain)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="w-full h-32 object-cover"
          onError={e => {
            e.currentTarget.src = `/og?title=${encodeURIComponent(ogData.title)}&domain=${encodeURIComponent(domain)}`;
          }}
        />
      )}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 line-clamp-1">{ogData.title}</p>
        {ogData.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ogData.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          {domain}
        </p>
      </div>
    </a>
  );
};
