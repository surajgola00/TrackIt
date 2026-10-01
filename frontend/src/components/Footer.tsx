import React from 'react';

interface FooterProps {
  busId: string;
  sessionId: string | number | null;
  lastUpdated: string;
}

export const Footer: React.FC<FooterProps> = ({ busId, sessionId, lastUpdated }) => {
  return (
    <footer className="fixed bottom-0 w-full border-t-4 md:border-t-8 border-black bg-white text-black px-4 md:px-8 py-3 md:py-6 z-50">
      <div className="flex flex-row justify-between items-center gap-4">
        <div className="flex flex-row gap-4 md:gap-12 overflow-x-auto no-scrollbar">
          <div className="flex flex-col min-w-max">
            <span className="font-label text-[8px] md:text-[10px] tracking-widest opacity-50 uppercase">BUS ID</span>
            <span className="font-black text-sm md:text-2xl uppercase">{busId}</span>
          </div>
          <div className="flex flex-col border-l-2 md:border-l-4 border-black pl-4 md:pl-8 min-w-max">
            <span className="font-label text-[8px] md:text-[10px] tracking-widest opacity-50 uppercase">SESSION</span>
            <span className="font-black text-sm md:text-2xl uppercase">{sessionId || "N/A"}</span>
          </div>
          <div className="flex flex-col border-l-2 md:border-l-4 border-black pl-4 md:pl-8 min-w-max">
            <span className="font-label text-[8px] md:text-[10px] tracking-widest opacity-50 uppercase">UPDATED</span>
            <span className="font-black text-sm md:text-2xl uppercase">{lastUpdated}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
