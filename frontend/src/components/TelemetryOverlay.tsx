import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface TelemetryOverlayProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const TelemetryOverlay: React.FC<TelemetryOverlayProps> = ({
  onZoomIn,
  onZoomOut
}) => {
  return (
    <div className="absolute bottom-24 right-4 md:bottom-32 md:right-8 flex flex-col gap-4 z-[1000]">
      <div className="bg-white border-2 md:border-4 border-black p-2 md:p-4 shadow-brutal flex flex-col gap-2 md:gap-4">
        <button 
          onClick={onZoomIn}
          className="w-10 h-10 md:w-12 md:h-12 border-2 md:border-4 border-black flex items-center justify-center hover:bg-black hover:text-white transition-none"
        >
          <Plus size={20} className="md:w-6 md:h-6" strokeWidth={3} />
        </button>
        <button 
          onClick={onZoomOut}
          className="w-10 h-10 md:w-12 md:h-12 border-2 md:border-4 border-black flex items-center justify-center hover:bg-black hover:text-white transition-none"
        >
          <Minus size={20} className="md:w-6 md:h-6" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
