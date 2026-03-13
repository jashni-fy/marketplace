'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0-5
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

export const StarRating = ({ value, onChange, size = 24, readOnly = false }: StarRatingProps) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          disabled={readOnly}
          className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
        >
          <Star
            size={size}
            className={value >= star ? 'fill-primary text-primary' : 'text-slate-600'}
          />
        </button>
      ))}
    </div>
  );
};
