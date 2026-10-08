import React, { useState } from 'react';
import { SketchItem } from '../types/visit';
import {
  Maximize2,
  DoorOpen,
  Square,
  Zap,
  Droplets,
  Waves,
  Ruler,
  Trash2,
  RotateCcw,
  LayoutTemplate,
} from 'lucide-react';

interface SketchCanvasProps {
  areaName: string;
  largo: number;
  ancho: number;
  items: SketchItem[];
  readOnly?: boolean;
  onChange: (newItems: SketchItem[]) => void;
}

type ToolType = SketchItem['type'];

export const SketchCanvas: React.FC<SketchCanvasProps> = ({
  areaName,
  largo,
  ancho,
  items,
  readOnly = false,
  onChange,
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>('electric');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null);

  const defaultLabels: Record<ToolType, string> = {
    wall: `${largo || 2.5} m`,
    door: 'Puerta 0.80m',
    window: 'Ventana 1.20m',
    electric: 'Toma 110V / GFCI',
    hydraulic: 'Punto Agua AF/AC',
    sanitary: 'Desagüe / Sifón',
    dimension: `Cota ${largo || 3.0}m`,
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 360 / rect.width;
    const scaleY = 260 / rect.height;
    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;
    // Snap to 10px grid for clean field sketches
    const x = Math.round(rawX / 10) * 10;
    const y = Math.round(rawY / 10) * 10;

    if (activeTool === 'wall' || activeTool === 'dimension') {
      if (!wallStart) {
        setWallStart({ x, y });
      } else {
        const newItem: SketchItem = {
          id: `sk-${Date.now()}`,
          type: activeTool,
          x: wallStart.x,
          y: wallStart.y,
          x2: x,
          y2: y,
          label: customLabel.trim() || defaultLabels[activeTool],
        };
        onChange([...items, newItem]);
        setWallStart(null);
      }
    } else {
      const newItem: SketchItem = {
        id: `sk-${Date.now()}`,
        type: activeTool,
        x,
        y,
        label: customLabel.trim() || defaultLabels[activeTool],
      };
      onChange([...items, newItem]);
    }
  };

  const applyRoomTemplate = () => {
    if (readOnly) return;
    const baseWalls: SketchItem[] = [
      {
        id: `sk-w1-${Date.now()}`,
        type: 'wall',
        x: 40,
        y: 40,
        x2: 320,
        y2: 40,
        label: `${largo || 3.2} m`,
      },
      {
        id: `sk-w2-${Date.now()}`,
        type: 'wall',
        x: 320,
        y: 40,
        x2: 320,
        y2: 220,
        label: `${ancho || 2.4} m`,
      },
      {
        id: `sk-w3-${Date.now()}`,
        type: 'wall',
        x: 320,
        y: 220,
        x2: 40,
        y2: 220,
        label: `${largo || 3.2} m`,
      },
      {
        id: `sk-w4-${Date.now()}`,
        type: 'wall',
        x: 40,
        y: 220,
        x2: 40,
        y2: 40,
        label: `${ancho || 2.4} m`,
      },
      {
        id: `sk-d1-${Date.now()}`,
        type: 'door',
        x: 90,
        y: 220,
        label: 'Acceso 0.80m',
      },
    ];
    onChange(baseWalls);
    setWallStart(null);
  };

  const removeItem = (id: string) => {
    if (readOnly) return;
    onChange(items.filter((i) => i.id !== id));
  };

  const tools: { id: ToolType; label: string; color: string; icon: React.ReactNode }[] = [
    { id: 'wall', label: 'Muro (2 toques)', color: '#1E293B', icon: <Maximize2 className="w-4 h-4" /> },
    { id: 'door', label: 'Puerta', color: '#D97706', icon: <DoorOpen className="w-4 h-4" /> },
    { id: 'window', label: 'Ventana', color: '#0284C7', icon: <Square className="w-4 h-4" /> },
    { id: 'electric', label: 'Eléctrico', color: '#EAB308', icon: <Zap className="w-4 h-4" /> },
    { id: 'hydraulic', label: 'Hidráulico', color: '#2563EB', icon: <Droplets className="w-4 h-4" /> },
    { id: 'sanitary', label: 'Sanitario', color: '#16A34A', icon: <Waves className="w-4 h-4" /> },
    { id: 'dimension', label: 'Cota (2 toques)', color: '#2F3075', icon: <Ruler className="w-4 h-4" /> },
  ];

  return (
    <div className="border border-slate-200 rounded-xl bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Croquis Técnico de Campo — {areaName}
          </h4>
          <p className="text-xs text-slate-500">
            Toque el plano para ubicar puertas, ventanas, puntos eléctricos, hidráulicos, sanitarios y cotas.
          </p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyRoomTemplate}
              className="min-h-[40px] px-3 py-1.5 text-xs font-medium text-[#2F3075] bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              Plantilla Base ({largo || 3.0}x{ancho || 2.4}m)
            </button>
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setWallStart(null);
              }}
              className="min-h-[40px] px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="space-y-3 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {tools.map((t) => {
              const isSelected = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveTool(t.id);
                    setWallStart(null);
                  }}
                  className={`min-h-[42px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#2F3075] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder={`Etiqueta opcional (ej: ${defaultLabels[activeTool]})`}
              className="flex-1 min-h-[40px] px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#2F3075]"
            />
            {wallStart && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                Toque el segundo punto en la cuadrícula para trazar...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Interactive SVG Blueprint Grid */}
      <div className="relative w-full overflow-hidden border border-slate-300 rounded-lg bg-[#F8FAFC]">
        <svg
          viewBox="0 0 360 260"
          onClick={handleSvgClick}
          className={`w-full h-64 sm:h-72 select-none ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
        >
          <defs>
            <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E2E8F0" strokeWidth="0.6" />
            </pattern>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="url(#smallGrid)" />
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#CBD5E1" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="360" height="260" fill="url(#grid)" />

          {/* Compass & Scale Legend */}
          <g transform="translate(12, 16)">
            <text x="0" y="0" fontSize="8" fill="#64748B" fontFamily="monospace">
              ESCALA CAMPO · {areaName.toUpperCase()} ({largo}m × {ancho}m)
            </text>
          </g>

          {/* Active Wall Start Indicator */}
          {wallStart && (
            <circle
              cx={wallStart.x}
              cy={wallStart.y}
              r="5"
              fill="#2F3075"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          )}

          {/* Render Items */}
          {items.map((item) => {
            if (item.type === 'wall' && item.x2 !== undefined && item.y2 !== undefined) {
              const midX = (item.x + item.x2) / 2;
              const midY = (item.y + item.y2) / 2;
              return (
                <g key={item.id}>
                  <line
                    x1={item.x}
                    y1={item.y}
                    x2={item.x2}
                    y2={item.y2}
                    stroke="#0F172A"
                    strokeWidth="4"
                    strokeLinecap="square"
                  />
                  {item.label && (
                    <g transform={`translate(${midX}, ${midY - 6})`}>
                      <rect
                        x="-24"
                        y="-9"
                        width="48"
                        height="13"
                        rx="2"
                        fill="#FFFFFF"
                        fillOpacity="0.9"
                      />
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="600"
                        fill="#0F172A"
                        fontFamily="monospace"
                      >
                        {item.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            }

            if (item.type === 'dimension' && item.x2 !== undefined && item.y2 !== undefined) {
              const midX = (item.x + item.x2) / 2;
              const midY = (item.y + item.y2) / 2;
              return (
                <g key={item.id}>
                  <line
                    x1={item.x}
                    y1={item.y}
                    x2={item.x2}
                    y2={item.y2}
                    stroke="#2F3075"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <circle cx={item.x} cy={item.y} r="3" fill="#2F3075" />
                  <circle cx={item.x2} cy={item.y2} r="3" fill="#2F3075" />
                  <text
                    x={midX}
                    y={midY - 5}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="600"
                    fill="#2F3075"
                    fontFamily="monospace"
                  >
                    {item.label}
                  </text>
                </g>
              );
            }

            const badgeColors: Record<string, { fill: string; code: string }> = {
              door: { fill: '#D97706', code: 'PTA' },
              window: { fill: '#0284C7', code: 'VEN' },
              electric: { fill: '#CA8A04', code: 'ELE' },
              hydraulic: { fill: '#2563EB', code: 'HID' },
              sanitary: { fill: '#16A34A', code: 'SAN' },
            };
            const cfg = badgeColors[item.type] || { fill: '#2F3075', code: 'PTO' };

            return (
              <g key={item.id} transform={`translate(${item.x}, ${item.y})`}>
                <circle cx="0" cy="0" r="9" fill={cfg.fill} stroke="#FFFFFF" strokeWidth="1.5" />
                <text
                  x="0"
                  y="2.5"
                  textAnchor="middle"
                  fontSize="6.5"
                  fontWeight="700"
                  fill="#FFFFFF"
                  fontFamily="monospace"
                >
                  {cfg.code}
                </text>
                {item.label && (
                  <text
                    x="12"
                    y="3"
                    fontSize="8"
                    fontWeight="600"
                    fill="#1E293B"
                    fontFamily="sans-serif"
                  >
                    {item.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Item List Below Canvas for Quick Removal */}
      {items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="text-xs font-medium text-slate-500 mb-2">
            Elementos registrados en el croquis ({items.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700"
              >
                <span className="font-mono font-medium text-[#2F3075]">{item.type.toUpperCase()}</span>
                <span>·</span>
                <span>{item.label}</span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="ml-1 text-slate-400 hover:text-red-600 p-0.5"
                    title="Eliminar punto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
