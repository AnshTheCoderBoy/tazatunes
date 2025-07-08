
import React, { useState, useRef, useEffect } from 'react';
import { Music, Radio, Play, Pause, Volume2, SkipBack, SkipForward, Upload, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { MusicPlayer } from '@/components/MusicPlayer';
import { RadioPlayer } from '@/components/RadioPlayer';
import { NewsSection } from '@/components/NewsSection';

const Index = () => {
  const [activeTab, setActiveTab] = useState('music');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              TazaTunes
            </span>
          </h1>
          <p className="text-xl text-gray-300">Your personal music player and news hub</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/20 border border-white/10">
              <TabsTrigger 
                value="music" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 transition-all"
              >
                <Music className="w-4 h-4 mr-2" />
                My Music
              </TabsTrigger>
              <TabsTrigger 
                value="radio" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 transition-all"
              >
                <Radio className="w-4 h-4 mr-2" />
                Internet Radio
              </TabsTrigger>
              <TabsTrigger 
                value="news" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 transition-all"
              >
                <Newspaper className="w-4 h-4 mr-2" />
                News
              </TabsTrigger>
            </TabsList>

            <TabsContent value="music">
              <MusicPlayer />
            </TabsContent>

            <TabsContent value="radio">
              <RadioPlayer />
            </TabsContent>

            <TabsContent value="news">
              <NewsSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
