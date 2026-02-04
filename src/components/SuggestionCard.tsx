import { Suggestion } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAdd: (suggestion: Suggestion) => void;
}

export function SuggestionCard({ suggestion, onAdd }: SuggestionCardProps) {
  return (
    <button
      onClick={() => onAdd(suggestion)}
      className="flex-shrink-0 w-36 card card-hover text-left flex flex-col"
    >
      {/* Image */}
      <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-100 mb-2">
        <img
          src={suggestion.imageUrl}
          alt={suggestion.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D4A853"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
          }}
        />
      </div>

      {/* Content - fixed height for consistent alignment */}
      <div className="flex-1 flex flex-col">
        <h4 className="font-medium text-sm text-gray-800 line-clamp-2 leading-tight h-10">
          {suggestion.name}
        </h4>
        <p className="text-xs text-gold-dark font-medium mt-1">{suggestion.priceRange}</p>
      </div>

      {/* Add indicator - always at bottom */}
      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Toevoegen
      </div>
    </button>
  );
}
