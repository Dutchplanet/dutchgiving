import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WishlistItem as WishlistItemType } from '../types';

// Normalize URL to ensure it has a protocol
function normalizeUrl(url: string): string {
  if (!url) return url;
  const trimmed = url.trim();
  // Already has a protocol
  if (trimmed.match(/^https?:\/\//i)) {
    return trimmed;
  }
  // Has www. but no protocol
  if (trimmed.match(/^www\./i)) {
    return `https://${trimmed}`;
  }
  // Just a domain or path, add https://
  return `https://${trimmed}`;
}

interface WishlistItemProps {
  item: WishlistItemType;
  onTogglePurchased: (id: string, purchased: boolean) => void;
  onDelete: (id: string) => void;
  isSharedView?: boolean;
}

export function WishlistItem({
  item,
  onTogglePurchased,
  onDelete,
  isSharedView = false,
}: WishlistItemProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: isSharedView });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete(item.id);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  const normalizedUrl = item.url ? normalizeUrl(item.url) : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${item.purchased ? 'bg-green-50 border border-green-200' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        {!isSharedView && (
          <button
            {...attributes}
            {...listeners}
            className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
        )}

        {/* Checkbox */}
        <button
          onClick={() => onTogglePurchased(item.id, !item.purchased)}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center
                      transition-colors ${
                        item.purchased
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-primary'
                      }`}
        >
          {item.purchased && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Image */}
        {item.imageUrl && (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium ${
              item.purchased ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}
          >
            {item.name}
          </h4>

          {item.price && (
            <p className="text-sm text-gold-dark font-medium">
              €{item.price.toFixed(2).replace('.', ',')}
            </p>
          )}

          {item.note && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.note}</p>
          )}

          {/* Link */}
          {normalizedUrl && (
            <a
              href={normalizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-light mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Bekijk product
            </a>
          )}
        </div>

        {/* Delete button */}
        {!isSharedView && (
          <button
            onClick={handleDelete}
            className={`mt-1 p-1 rounded-full transition-colors ${
              showConfirmDelete
                ? 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
