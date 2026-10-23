const COSTURAS = ['M52 170 Q200 262 348 170', 'M130 62 Q178 200 130 338', 'M270 62 Q222 200 270 338']

const TORNILLOS: Array<[number, number]> = [
  [150, 118],
  [250, 118],
  [150, 282],
  [250, 282],
  [96, 176],
  [304, 176],
]

/**
 * Bóveda decorativa del hero: esfera blindada en SVG con costuras que giran,
 * dos anillos orbitales y un halo. La inclinación la decide el contenedor con
 * las variables --px y --py (ver Hero.tsx); aquí solo se dibuja. El brillo de
 * las costuras es un trazo más ancho y translúcido, sin filtros SVG, para que
 * girar no obligue a repintar un filtro en cada fotograma.
 */
export function BovedaSeguridad() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span className="boveda-halo" />
      <span className="boveda-orbita" />
      <span className="boveda-orbita boveda-orbita-b" />

      <div className="boveda">
        <svg viewBox="0 0 400 400" className="boveda-svg" focusable="false">
          <defs>
            <radialGradient id="boveda-metal" cx="36%" cy="28%" r="74%">
              <stop offset="0" stopColor="#f3f8ff" />
              <stop offset="0.32" stopColor="#8db0d2" />
              <stop offset="0.7" stopColor="#23476e" />
              <stop offset="1" stopColor="#06213d" />
            </radialGradient>
            <radialGradient id="boveda-sombra" cx="50%" cy="50%" r="50%">
              <stop offset="0.62" stopColor="#00182f" stopOpacity="0" />
              <stop offset="1" stopColor="#00182f" stopOpacity="0.6" />
            </radialGradient>
            <linearGradient id="boveda-costura" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#21c063" />
              <stop offset="1" stopColor="#5cb3ff" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="200" r="168" fill="none" stroke="rgb(92 179 255 / 0.28)" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="158" fill="url(#boveda-metal)" />
          <circle cx="200" cy="200" r="158" fill="url(#boveda-sombra)" />

          <g className="boveda-costuras" style={{ transformOrigin: '200px 200px' }}>
            {COSTURAS.map((trazo) => (
              <g key={trazo} fill="none" strokeLinecap="round">
                <path d={trazo} stroke="#5cb3ff" strokeOpacity="0.28" strokeWidth="11" />
                <path d={trazo} stroke="url(#boveda-costura)" strokeWidth="4" />
              </g>
            ))}
            <g fill="#e6f1ff">
              {TORNILLOS.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="3.4" />
              ))}
            </g>
          </g>

          <circle cx="200" cy="200" r="46" fill="#00264a" stroke="url(#boveda-costura)" strokeWidth="4" />
          <path
            d="M200 176 L218 183 V199 C218 212 211 221 200 226 C189 221 182 212 182 199 V183 Z"
            fill="none"
            stroke="#21c063"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          <g className="boveda-reflejo">
            <ellipse cx="150" cy="116" rx="70" ry="30" transform="rotate(-24 150 116)" fill="#ffffff" opacity="0.34" />
          </g>
        </svg>
      </div>
    </div>
  )
}
