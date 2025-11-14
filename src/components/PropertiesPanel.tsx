
import React from 'react';
import { Settings, Palette, Volume2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PropertiesPanelProps {
  selectedClip: number | null;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedClip }) => {
  return (
    <div className="h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-400" />
        <h3 className="text-white font-medium">Properties</h3>
      </div>

      {selectedClip ? (
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="video" className="text-xs">Video</TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">Audio</TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">Effects</TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="space-y-4 mt-4">
            <div>
              <label className="text-gray-300 text-sm font-medium">Opacity</label>
              <Slider
                defaultValue={[100]}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium">Scale</label>
              <Slider
                defaultValue={[100]}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium">Rotation</label>
              <Slider
                defaultValue={[0]}
                min={-180}
                max={180}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-400">X</span>
                  <input
                    type="number"
                    defaultValue={0}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-400">Y</span>
                  <input
                    type="number"
                    defaultValue={0}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4 mt-4">
            <div>
              <label className="text-gray-300 text-sm font-medium">Volume</label>
              <Slider
                defaultValue={[100]}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium">Pan</label>
              <Slider
                defaultValue={[0]}
                min={-100}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <Button variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
              <Volume2 className="w-4 h-4 mr-2" />
              Add Audio Effect
            </Button>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 justify-start">
                <Palette className="w-4 h-4 mr-2" />
                Color Correction
              </Button>
              <Button variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 justify-start">
                <Layers className="w-4 h-4 mr-2" />
                Blur
              </Button>
              <Button variant="outline" className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Sharpen
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a clip to view properties</p>
        </div>
      )}
    </div>
  );
};
