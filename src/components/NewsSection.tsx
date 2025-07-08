
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail?: string;
  content?: string;
}

interface NewsResponse {
  items: NewsItem[];
  feed: {
    title: string;
    description: string;
    url: string;
  };
}

const newsFeeds = [
  {
    name: 'NDTV',
    url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
    category: 'Indian News',
    color: 'bg-red-500'
  },
  {
    name: 'India Today',
    url: 'https://www.indiatoday.in/rss/home',
    category: 'Indian News',
    color: 'bg-blue-500'
  },
  {
    name: 'Times of India',
    url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
    category: 'Indian News',
    color: 'bg-orange-500'
  },
  {
    name: 'Zee News Hindi',
    url: 'https://zeenews.india.com/hindi/rss/india.xml',
    category: 'Indian News',
    color: 'bg-green-500'
  },
  {
    name: 'BBC Hindi',
    url: 'http://feeds.bbci.co.uk/hindi/rss.xml',
    category: 'Indian News',
    color: 'bg-purple-500'
  },
  {
    name: 'BBC World',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'International',
    color: 'bg-indigo-500'
  },
  {
    name: 'CNN Top Stories',
    url: 'http://rss.cnn.com/rss/cnn_topstories.rss',
    category: 'International',
    color: 'bg-red-600'
  },
  {
    name: 'Reuters',
    url: 'http://feeds.reuters.com/reuters/topNews',
    category: 'International',
    color: 'bg-gray-600'
  }
];

const fetchNews = async (feedUrl: string): Promise<NewsResponse> => {
  const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const stripHtml = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export const NewsSection = () => {
  const [selectedFeed, setSelectedFeed] = useState(newsFeeds[0]);

  const { data: newsData, isLoading, error, refetch } = useQuery({
    queryKey: ['news', selectedFeed.url],
    queryFn: () => fetchNews(selectedFeed.url),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "News Loading Error",
        description: "Failed to load news. Please try again.",
        variant: "destructive",
      });
    }
  }, [error]);

  const indianFeeds = newsFeeds.filter(feed => feed.category === 'Indian News');
  const internationalFeeds = newsFeeds.filter(feed => feed.category === 'International');

  return (
    <div className="space-y-6">
      {/* Feed Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Indian News</h3>
          <div className="flex flex-wrap gap-2">
            {indianFeeds.map((feed) => (
              <button
                key={feed.name}
                onClick={() => setSelectedFeed(feed)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFeed.name === feed.name
                    ? `${feed.color} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {feed.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">International News</h3>
          <div className="flex flex-wrap gap-2">
            {internationalFeeds.map((feed) => (
              <button
                key={feed.name}
                onClick={() => setSelectedFeed(feed)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFeed.name === feed.name
                    ? `${feed.color} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {feed.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Content */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {selectedFeed.name}
            <Badge variant="secondary" className={`ml-2 ${selectedFeed.color} text-white`}>
              {selectedFeed.category}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : newsData?.items ? (
            <div className="space-y-4">
              {newsData.items.slice(0, 10).map((item, index) => (
                <div key={index} className="border-b border-white/10 pb-4 last:border-b-0">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-white/5 p-3 rounded-lg transition-colors group"
                  >
                    <h4 className="text-white font-medium mb-2 group-hover:text-purple-400 transition-colors">
                      {item.title}
                      <ExternalLink className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    {item.description && (
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {stripHtml(item.description)}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(item.pubDate)}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No news available at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
