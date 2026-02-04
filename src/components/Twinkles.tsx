import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface TwinklesProps {
  count?: number;
  className?: string;
}

export function Twinkles({ count = 20, className = '' }: TwinklesProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const newStars: Star[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 12 + 8, // 8-20px
      delay: Math.random() * 4,
      duration: Math.random() * 2 + 2, // 2-4s animation
      opacity: Math.random() * 0.4 + 0.3, // 0.3-0.7 opacity
    }));
    setStars(newStars);
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-gold w-full h-full"
          >
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
