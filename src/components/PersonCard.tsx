import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PersonWithCollaborators, getWishlistItems } from '../lib/firebase';
import { WishlistItem } from '../types';

interface PersonCardProps {
  person: PersonWithCollaborators;
  isOwner?: boolean;
}

export function PersonCard({ person, isOwner = true }: PersonCardProps) {
  const [imageError, setImageError] = useState(false);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      try {
        const loadedItems = await getWishlistItems(person.id);
        setItems(loadedItems);
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, [person.id]);

  const purchasedCount = items.filter(i => i.purchased).length;
  const totalCount = items.length;
  const totalSpent = items
    .filter(i => i.purchased && i.price)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  const initials = person.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarColors = [
    'from-primary to-primary-light',
    'from-gold to-gold-light',
    'from-rose-500 to-pink-400',
    'from-amber-500 to-orange-400',
    'from-emerald-500 to-teal-400',
  ];
  const colorIndex = person.name.charCodeAt(0) % avatarColors.length;

  const showPhoto = person.photoUrl && !imageError;

  return (
    <Link
      to={`/list/${person.id}`}
      className="card card-hover block"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        {showPhoto ? (
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-md flex-shrink-0">
            <img
              src={person.photoUrl}
              alt={person.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div
            className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarColors[colorIndex]}
                        flex items-center justify-center text-white font-display font-semibold text-lg
                        shadow-md flex-shrink-0`}
          >
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-lg text-gray-800 truncate flex items-center gap-1.5">
            {person.name}
            {person.pin && (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            {!isOwner && (
              <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <title>Gedeeld met jou</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </h3>
          <p className="text-sm text-gray-500">
            {loading ? (
              'Laden...'
            ) : totalCount === 0 ? (
              'Nog geen wensjes'
            ) : (
              <>
                {totalCount} {totalCount === 1 ? 'wensje' : 'wensjes'}
                {purchasedCount > 0 && (
                  <span className="text-green-600"> • {purchasedCount} gekocht</span>
                )}
              </>
            )}
          </p>
          {totalSpent > 0 && (
            <p className="text-xs text-gold-dark font-medium mt-0.5">
              €{totalSpent.toFixed(2).replace('.', ',')} uitgegeven
              {person.budget && (
                <span className="text-gray-400"> / €{person.budget.toFixed(2).replace('.', ',')}</span>
              )}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
