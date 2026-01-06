
import React from 'react';
import { NumerologyIndicator } from '../types';

interface Props {
  indicator: NumerologyIndicator;
}

const IndicatorCard: React.FC<Props> = ({ indicator }) => {
  const isPower = indicator.category === 'Power';
  
  return (
    <div className="group p-9 border border-gray-100 rounded-[2.5rem] bg-white luxury-shadow transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between min-h-[350px] overflow-hidden relative">
      {/* Dynamic Background Gradient */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${indicator.colorHex}, transparent)` }}
      />
      
      {/* Visual Color Glow */}
      <div 
        className="absolute -right-8 -top-8 w-36 h-36 rounded-full blur-[60px] opacity-10 transition-all duration-1000 group-hover:opacity-40 group-hover:scale-150 pointer-events-none"
        style={{ backgroundColor: indicator.colorHex }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.5em] font-black text-gray-500">
            {indicator.name}
          </span>
          <div className="flex flex-col items-end">
             <div 
              className="w-3.5 h-3.5 rounded-full mb-1" 
              style={{ 
                backgroundColor: indicator.colorHex,
                boxShadow: `0 0 20px ${indicator.colorHex}`
              }}
            />
            <span className="text-[8px] text-gray-400 font-mono font-bold tracking-tight">{indicator.colorHex}</span>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-6xl font-bold tracking-tighter mb-2 transition-transform duration-700 group-hover:scale-110 origin-left leading-none" style={{ color: indicator.colorHex }}>
            {indicator.value}
          </h3>
          <div className="h-[2px] w-12 bg-gray-50 mb-4 group-hover:w-full transition-all duration-700" style={{ backgroundColor: `${indicator.colorHex}66` }} />
          <p className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-400">
            {isPower ? "Power" : "Growth"}
          </p>
        </div>

        <p className="text-[14px] leading-[1.8] text-gray-700 font-medium text-justify">
          {indicator.description}
        </p>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-100 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: indicator.colorHex }} />
          <span className="text-[11px] italic font-black text-gray-500">
            {indicator.color}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IndicatorCard;
