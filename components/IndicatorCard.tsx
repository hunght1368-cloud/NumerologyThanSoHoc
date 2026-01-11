
import React from 'react';
import { NumerologyIndicator } from '../types';

interface Props {
  indicator: NumerologyIndicator;
}

const IndicatorCard: React.FC<Props> = ({ indicator }) => {
  const isPower = indicator.category === 'Sức Mạnh';
  
  return (
    <div className="group p-9 border border-gray-100 rounded-[2.5rem] bg-white luxury-shadow transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between min-h-[360px] overflow-hidden relative">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${indicator.colorHex}, transparent)` }}
      />
      
      <div 
        className="absolute -right-8 -top-8 w-36 h-36 rounded-full blur-[60px] opacity-[0.1] transition-all duration-1000 group-hover:opacity-30 group-hover:scale-150 pointer-events-none"
        style={{ backgroundColor: indicator.colorHex }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-900">
            {indicator.name}
          </span>
          <div className="flex flex-col items-end">
             <div 
              className="w-3 h-3 rounded-full mb-1" 
              style={{ backgroundColor: indicator.colorHex }}
            />
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-5xl font-bold tracking-tighter mb-2 transition-transform duration-700 group-hover:scale-110 origin-left leading-none" style={{ color: indicator.colorHex }}>
            {indicator.value}
          </h3>
          <div className="h-[2px] w-10 bg-gray-100 mb-4 group-hover:w-20 transition-all duration-700" style={{ backgroundColor: `${indicator.colorHex}` }} />
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-400">
            Trạng thái: {indicator.category}
          </p>
        </div>

        <p className="text-[14px] leading-[1.7] text-gray-700 font-medium text-justify opacity-90">
          {indicator.description}
        </p>
      </div>
    </div>
  );
};

export default IndicatorCard;
