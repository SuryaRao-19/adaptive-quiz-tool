import React from 'react';

/**
 * Responsive, Accessible STEM Educational SVG Diagrams
 * Renders verified geometric, physical, and biological diagrams
 * without executing arbitrary external code.
 */
export const STEMDiagram = ({ 
  type = 'fraction-circle', 
  data = {}, 
  className = '', 
  caption = '' 
}) => {
  const renderDiagram = () => {
    switch (type) {
      case 'fraction-circle': {
        const numerator = data.numerator || 3;
        const denominator = data.denominator || 4;
        const radius = 60;
        const center = 75;
        const sectors = [];

        for (let i = 0; i < denominator; i++) {
          const startAngle = (i * 2 * Math.PI) / denominator - Math.PI / 2;
          const endAngle = ((i + 1) * 2 * Math.PI) / denominator - Math.PI / 2;
          const x1 = center + radius * Math.cos(startAngle);
          const y1 = center + radius * Math.sin(startAngle);
          const x2 = center + radius * Math.cos(endAngle);
          const y2 = center + radius * Math.sin(endAngle);
          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
          const isShaded = i < numerator;

          const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          sectors.push(
            <path
              key={i}
              d={pathData}
              fill={isShaded ? 'var(--theme-primary, #4F46E5)' : '#F1F5F9'}
              stroke="#0F172A"
              strokeWidth="1.5"
              className="transition-colors duration-200"
            />
          );
        }

        return (
          <svg viewBox="0 0 150 150" className="w-40 h-40 mx-auto" role="img" aria-label={`Fraction circle representing ${numerator} out of ${denominator} parts shaded`}>
            <title>{`Fraction ${numerator}/${denominator}`}</title>
            {sectors}
            <circle cx={center} cy={center} r="3" fill="#0F172A" />
          </svg>
        );
      }

      case 'triangle-geometry': {
        const aLabel = data.aLabel || 'a = 3';
        const bLabel = data.bLabel || 'b = 4';
        const cLabel = data.cLabel || 'c = 5';

        return (
          <svg viewBox="0 0 200 160" className="w-52 h-40 mx-auto" role="img" aria-label="Right-angled triangle diagram with labeled sides">
            <title>Right Triangle Geometry</title>
            {/* Right angle marker */}
            <path d="M 40 110 L 52 110 L 52 122" fill="none" stroke="#475569" strokeWidth="1.5" />
            {/* Triangle polygon */}
            <polygon points="40,25 40,122 170,122" fill="#EEF2FF" stroke="#1E3A8A" strokeWidth="2.5" />
            {/* Side Labels */}
            <text x="22" y="80" fontSize="12" fill="#0F172A" fontWeight="600">{aLabel}</text>
            <text x="95" y="142" fontSize="12" fill="#0F172A" fontWeight="600">{bLabel}</text>
            <text x="115" y="70" fontSize="12" fill="#1E3A8A" fontWeight="700">{cLabel}</text>
            {/* Vertices */}
            <circle cx="40" cy="25" r="3" fill="#1E3A8A" />
            <circle cx="40" cy="122" r="3" fill="#1E3A8A" />
            <circle cx="170" cy="122" r="3" fill="#1E3A8A" />
          </svg>
        );
      }

      case 'coordinate-plane': {
        const pointX = data.pointX !== undefined ? data.pointX : 3;
        const pointY = data.pointY !== undefined ? data.pointY : 2;
        const scale = 14;
        const cx = 100;
        const cy = 80;
        const px = cx + pointX * scale;
        const py = cy - pointY * scale;

        return (
          <svg viewBox="0 0 200 160" className="w-52 h-40 mx-auto" role="img" aria-label={`Coordinate plane plotting point (${pointX}, ${pointY})`}>
            <title>Coordinate Plane Grid</title>
            {/* Grid lines */}
            {[-4, -3, -2, -1, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line x1={cx + i * scale} y1="10" x2={cx + i * scale} y2="150" stroke="#E2E8F0" strokeWidth="1" />
                <line x1="10" y1={cy + i * scale} x2="190" y2={cy + i * scale} stroke="#E2E8F0" strokeWidth="1" />
              </g>
            ))}
            {/* Axes */}
            <line x1="10" y1={cy} x2="190" y2={cy} stroke="#0F172A" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1={cx} y1="150" x2={cx} y2="10" stroke="#0F172A" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="188" y={cy - 6} fontSize="10" fontWeight="bold">x</text>
            <text x={cx + 6} y="15" fontSize="10" fontWeight="bold">y</text>
            {/* Plotted Point */}
            <circle cx={px} cy={py} r="4.5" fill="#DC2626" />
            <text x={px + 6} y={py - 6} fontSize="11" fontWeight="bold" fill="#0F172A">
              ({pointX}, {pointY})
            </text>
          </svg>
        );
      }

      case 'circuit-basic': {
        return (
          <svg viewBox="0 0 200 130" className="w-52 h-36 mx-auto" role="img" aria-label="Simple series electrical circuit with battery, switch, and lamp">
            <title>Basic Series Circuit</title>
            {/* Wire Loop */}
            <rect x="30" y="25" width="140" height="80" fill="none" stroke="#0F172A" strokeWidth="2" rx="4" />
            {/* Battery Symbol (left) */}
            <rect x="25" y="55" width="10" height="20" fill="white" />
            <line x1="22" y1="58" x2="38" y2="58" stroke="#0F172A" strokeWidth="3" />
            <line x1="26" y1="72" x2="34" y2="72" stroke="#0F172A" strokeWidth="1.5" />
            <text x="12" y="62" fontSize="9" fontWeight="bold">+</text>
            <text x="15" y="76" fontSize="9" fontWeight="bold">-</text>
            {/* Resistor / Lamp (right) */}
            <rect x="165" y="55" width="10" height="20" fill="white" />
            <circle cx="170" cy="65" r="9" fill="#FEF08A" stroke="#0F172A" strokeWidth="1.5" />
            <path d="M 164 59 L 176 71 M 164 71 L 176 59" stroke="#EAB308" strokeWidth="1.5" />
            {/* Switch (top) */}
            <rect x="90" y="20" width="25" height="10" fill="white" />
            <circle cx="92" cy="25" r="2.5" fill="#0F172A" />
            <circle cx="112" cy="25" r="2.5" fill="#0F172A" />
            <line x1="92" y1="25" x2="108" y2="15" stroke="#DC2626" strokeWidth="2" />
            {/* Labels */}
            <text x="75" y="118" fontSize="10" fill="#475569">Current Flow (I)</text>
          </svg>
        );
      }

      case 'photosynthesis-flow': {
        return (
          <svg viewBox="0 0 240 140" className="w-60 h-36 mx-auto" role="img" aria-label="Photosynthesis process flow diagram">
            <title>Photosynthesis Energy Conversion</title>
            {/* Inputs */}
            <rect x="10" y="20" width="70" height="30" rx="6" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="18" y="38" fontSize="10" fontWeight="600" fill="#1E3A8A">Light + H₂O</text>

            <rect x="10" y="80" width="70" height="30" rx="6" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />
            <text x="24" y="98" fontSize="10" fontWeight="600" fill="#334155">CO₂ Input</text>

            {/* Chloroplast / Center Engine */}
            <rect x="100" y="45" width="45" height="45" rx="22" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
            <text x="108" y="70" fontSize="16">🌿</text>

            {/* Outputs */}
            <rect x="165" y="20" width="65" height="30" rx="6" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
            <text x="175" y="38" fontSize="10" fontWeight="600" fill="#065F46">Glucose</text>

            <rect x="165" y="80" width="65" height="30" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="178" y="98" fontSize="10" fontWeight="600" fill="#92400E">O₂ Gas</text>

            {/* Directional Arrows */}
            <path d="M 82 35 L 98 55" stroke="#0F172A" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 82 95 L 98 75" stroke="#0F172A" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 146 55 L 163 35" stroke="#0F172A" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 146 75 L 163 95" stroke="#0F172A" strokeWidth="1.5" markerEnd="url(#arrow)" />
          </svg>
        );
      }

      default:
        return null;
    }
  };

  return (
    <figure className={`bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4 text-center ${className}`}>
      {renderDiagram()}
      {caption && (
        <figcaption className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
