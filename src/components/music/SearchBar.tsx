
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchBar = ({ searchQuery, setSearchQuery, onSearch, isLoading }: SearchBarProps) => {
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for songs, artists..."
              className="bg-black/20 border-white/10 text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>
          <Button
            onClick={onSearch}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={isLoading}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
