import React from 'react';

export const swatchColors = [
  { name: 'Obsidian Charcoal', hex: '#151717', textDark: false },
  { name: 'Ocean Teal', hex: '#125b63', textDark: false },
  { name: 'Sea Green Jade', hex: '#238480', textDark: false },
  { name: 'Pine Teal', hex: '#155a5a', textDark: false },
  { name: 'Deep Marine', hex: '#063f4a', textDark: false },
  { name: 'Steel Teal', hex: '#317c82', textDark: false },
  { name: 'Sage Teal', hex: '#34807f', textDark: false },
  { name: 'Forest Teal', hex: '#074041', textDark: false },
  { name: 'Warm Chestnut', hex: '#8d5535', textDark: false },
  { name: 'Terracotta', hex: '#ae5a34', textDark: false },
];

export const PaletteBar: React.FC<{ className?: string; showLabels?: boolean }> = ({
  className = '',
  showLabels = false,
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700">
          <span className="uppercase tracking-wider text-[11px] text-slate-400">Design Color Palette</span>
          <span className="text-[11px] text-brand-500 font-mono">#151717 &rarr; #fd5800</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 sm:gap-2 h-14 sm:h-16 w-full">
        {swatchColors.map((swatch) => (
          <div
            key={swatch.hex}
            title={`${swatch.name} (${swatch.hex})`}
            style={{ backgroundColor: swatch.hex }}
            className="flex-1 h-full rounded-lg sm:rounded-xl transition-transform hover:scale-105 cursor-pointer shadow-sm relative group"
          >
            <span className="opacity-0 group-hover:opacity-100 absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-900 text-white font-mono text-[9px] rounded whitespace-nowrap z-20 pointer-events-none transition-opacity">
              {swatch.hex}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaletteBar;
