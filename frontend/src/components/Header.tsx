import React, { useState, useEffect } from 'react';

interface HeaderProps {
  status: "ACTIVE" | "INACTIVE";
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white text-black border-b-4 md:border-b-8 border-black shadow-brutal flex justify-between items-center w-full px-4 md:px-8 h-16 md:h-24 z-50">
      <div className="flex items-center gap-3 md:gap-6">
        <h1 className="font-black uppercase tracking-tighter text-lg md:text-2xl italic">TRACKIT</h1>
        <div className="flex items-center gap-2 md:gap-4 border-l-2 md:border-l-4 border-black pl-3 md:pl-6 h-8 md:h-12">
          <span className="hidden sm:inline font-label text-[10px] md:text-xs uppercase tracking-widest opacity-60">STATUS</span>
          <div className="flex items-center gap-2 bg-black text-white px-2 md:px-4 py-0.5 md:py-1">
            <span className={`w-2 h-2 md:w-3 md:h-3 block ${status === "ACTIVE" ? "bg-[#00FF00]" : "bg-[#FF0000]"}`}></span>
            <span className="font-black text-[10px] md:text-sm uppercase">{status}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-black text-white px-3 md:px-6 py-1 md:py-4 border-2 md:border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-brutal">
        <div className="font-black text-sm md:text-3xl leading-none">{time}</div>
        <div className="hidden md:block font-label text-[10px] tracking-[0.2em] mt-1 opacity-70 uppercase">SYSTEM_CLOCK_UTC</div>
      </div>
    </header>
  );
};
