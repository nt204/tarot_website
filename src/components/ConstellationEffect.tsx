'use client';

import React, { useEffect, useState } from 'react';

interface Star {
  x: number;
  y: number;
  hasFlare?: boolean;
  flareSize?: number;
}

interface ConstellationData {
  id: string;
  name: string;
  width: number;
  height: number;
  stars: Star[];
  lines: [number, number][];
  positionClass: string;
}

const CONSTELLATIONS: ConstellationData[] = [
  // 1. Chùm sao góc dưới Hero (nối nối toạ độ và chớp chớp y như các chùm khác)
  {
    id: 'hero_bottom',
    name: 'Chùm sao góc dưới Hero',
    width: 210,
    height: 120,
    positionClass: 'top-[470px] sm:top-[500px] left-4 sm:left-10 lg:left-14 scale-90 sm:scale-100',
    stars: [
      { x: 25, y: 35, hasFlare: true, flareSize: 9 },
      { x: 75, y: 18, hasFlare: false },
      { x: 125, y: 48, hasFlare: true, flareSize: 10 },
      { x: 175, y: 22, hasFlare: false },
      { x: 155, y: 92, hasFlare: true, flareSize: 9 }
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [2, 4], [4, 0]
    ]
  },

  // 2. Chòm Scorpius (Thiên Yết / Hổ Cáp) - Góc trên bên phải
  {
    id: 'scorpius',
    name: 'Thiên Yết (Scorpius)',
    width: 320,
    height: 420,
    positionClass: 'top-16 right-4 sm:right-12 lg:right-24 scale-90 sm:scale-100',
    stars: [
      { x: 35, y: 380, hasFlare: true, flareSize: 11 },
      { x: 55, y: 350 },
      { x: 75, y: 395, hasFlare: true, flareSize: 12 },
      { x: 135, y: 390 },
      { x: 175, y: 370, hasFlare: true, flareSize: 13 },
      { x: 180, y: 310 },
      { x: 182, y: 245 },
      { x: 220, y: 160 },
      { x: 245, y: 125, hasFlare: true, flareSize: 14 },
      { x: 270, y: 110 },
      { x: 300, y: 25 },
      { x: 315, y: 25 },
      { x: 325, y: 70, hasFlare: true, flareSize: 13 },
      { x: 323, y: 145 },
      { x: 325, y: 190, hasFlare: true, flareSize: 12 }
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [8, 9], [9, 12], [10, 11], [11, 12], [12, 13], [13, 14]
    ]
  },

  // 3. Chòm Cassiopeia (Thiên Hậu - Chữ W) - Khu vực giữa bên trái
  {
    id: 'cassiopeia',
    name: 'Thiên Hậu (Cassiopeia)',
    width: 220,
    height: 120,
    positionClass: 'top-1/3 left-6 sm:left-16 scale-80 sm:scale-95',
    stars: [
      { x: 20, y: 95, hasFlare: true, flareSize: 11 },
      { x: 65, y: 30, hasFlare: false },
      { x: 115, y: 75, hasFlare: true, flareSize: 13 },
      { x: 165, y: 25, hasFlare: false },
      { x: 205, y: 85, hasFlare: true, flareSize: 12 }
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4]
    ]
  },

  // 4. Chòm Cygnus (Thiên Nga / Thập Tự) - Khu vực dưới bên phải
  {
    id: 'cygnus',
    name: 'Thiên Nga (Cygnus)',
    width: 240,
    height: 260,
    positionClass: 'top-[58%] right-8 sm:right-20 scale-85 sm:scale-100',
    stars: [
      { x: 120, y: 30, hasFlare: true, flareSize: 13 },
      { x: 120, y: 110, hasFlare: true, flareSize: 12 },
      { x: 120, y: 190, hasFlare: false },
      { x: 120, y: 245, hasFlare: true, flareSize: 10 },
      { x: 35, y: 125, hasFlare: true, flareSize: 11 },
      { x: 75, y: 118, hasFlare: false },
      { x: 165, y: 105, hasFlare: false },
      { x: 215, y: 95, hasFlare: true, flareSize: 11 }
    ],
    lines: [
      [0, 1], [1, 2], [2, 3],
      [4, 5], [5, 1], [1, 6], [6, 7]
    ]
  },

  // 5. Chòm Ursa Major (Bắc Đẩu Thất Tinh) - Đáy bên trái
  {
    id: 'ursa_major',
    name: 'Bắc Đẩu (Ursa Major)',
    width: 290,
    height: 180,
    positionClass: 'top-[80%] left-8 sm:left-24 scale-85 sm:scale-95',
    stars: [
      { x: 25, y: 55, hasFlare: true, flareSize: 11 },
      { x: 80, y: 45, hasFlare: false },
      { x: 105, y: 110, hasFlare: true, flareSize: 12 },
      { x: 45, y: 120, hasFlare: false },
      { x: 160, y: 135, hasFlare: false },
      { x: 215, y: 155, hasFlare: true, flareSize: 12 },
      { x: 275, y: 170, hasFlare: true, flareSize: 12 }
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [2, 4], [4, 5], [5, 6]
    ]
  }
];

// 28 hạt sao nền li ti nhấp nháy tĩnh lặng (tối ưu hiệu năng, nhẹ mượt)
const BACKGROUND_STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  top: `${(i * 19.3 + 3) % 96}%`,
  left: `${(i * 24.1 + 4) % 95}%`,
  size: (i % 3) === 0 ? 1.6 : (i % 2) === 0 ? 1.3 : 1,
  delay: `${(i * 0.4) % 5}s`,
  duration: `${3.5 + (i % 3)}s`,
  opacity: 0.2 + ((i % 4) * 0.12)
}));

export const ConstellationEffect: React.FC = () => {
  const [activeConstellationIndex, setActiveConstellationIndex] = useState<number>(0);

  useEffect(() => {
    // Luân phiên các chùm sao sáng lên mỗi 5.2 giây
    const interval = setInterval(() => {
      setActiveConstellationIndex((prev) => (prev + 1) % CONSTELLATIONS.length);
    }, 5200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Các hạt sao li ti trên nền vũ trụ */}
      {BACKGROUND_STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration} ease-in-out infinite`,
            animationDelay: star.delay,
            opacity: star.opacity
          }}
        />
      ))}

      {/* 2. Các chùm sao toạ độ chiêm tinh luân phiên chớp sáng và nối nối ở nền */}
      {CONSTELLATIONS.map((constellation, cIdx) => {
        const isActive = cIdx === activeConstellationIndex;

        return (
          <div
            key={constellation.id}
            className={`absolute ${constellation.positionClass} transition-opacity duration-1000`}
            style={{
              opacity: isActive ? 1 : 0.3
            }}
          >
            <svg
              width={constellation.width}
              height={constellation.height}
              viewBox={`0 0 ${constellation.width} ${constellation.height}`}
              className="overflow-visible"
            >
              {/* Các đường toạ độ nối giữa các ngôi sao - Nối nối và chớp nhẹ */}
              {constellation.lines.map(([fromIdx, toIdx], lIdx) => {
                const p1 = constellation.stars[fromIdx];
                const p2 = constellation.stars[toIdx];
                if (!p1 || !p2) return null;

                return (
                  <line
                    key={lIdx}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isActive ? '#EEE6D8' : '#8C7A65'}
                    strokeWidth={isActive ? '0.8' : '0.55'}
                    strokeOpacity={isActive ? '0.55' : '0.16'}
                    className="transition-all duration-1000"
                    style={{
                      animation: isActive ? 'pulseLine 2.2s ease-in-out infinite' : 'none'
                    }}
                  />
                );
              })}

              {/* Các ngôi sao toạ độ: Chớp chớp lấp lánh và tỏa tia 4 cánh thanh thoát */}
              {constellation.stars.map((star, sIdx) => {
                const hasFlare = Boolean(star.hasFlare);
                const flareLen = star.flareSize || 10;
                const flareW = 1.6;

                return (
                  <g
                    key={sIdx}
                    transform={`translate(${star.x}, ${star.y})`}
                    className="transition-opacity duration-700"
                    style={{
                      animation: isActive && hasFlare ? 'starSparkle 2.2s ease-in-out infinite' : 'none'
                    }}
                  >
                    {/* Tia sáng 4 cánh (Cross flare) */}
                    {hasFlare && (
                      <path
                        d={`M 0,-${flareLen} Q 0,-${flareW} ${flareW},0 Q 0,${flareW} 0,${flareLen} Q 0,${flareW} -${flareW},0 Q 0,-${flareW} 0,-${flareLen} Z`}
                        fill="#FFFFFF"
                        opacity={isActive ? 0.95 : 0.3}
                        className="transition-opacity duration-700"
                      />
                    )}

                    {/* Vầng sáng nhỏ quanh tâm */}
                    <circle
                      cx="0"
                      cy="0"
                      r="2"
                      fill={isActive ? '#FFFFFF' : '#D4C7B5'}
                      opacity={isActive ? 0.3 : 0.1}
                    />

                    {/* Điểm tâm nhỏ xíu của ngôi sao (1.3px) */}
                    <circle
                      cx="0"
                      cy="0"
                      r={hasFlare ? 1.3 : 1.1}
                      fill="#FFFFFF"
                      opacity={isActive ? 1 : 0.6}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        );
      })}
    </div>
  );
};
