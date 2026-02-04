import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Person, WishlistItem as WishlistItemType } from '../types';
import {
  getPersonByShareCode,
  getWishlistItems,
  updateWishlistItem,
} from '../lib/storage';
import { WishlistItem } from '../components/WishlistItem';
import { Twinkles } from '../components/Twinkles';
import { PinLock } from '../components/PinLock';

export function SharedView() {
  const { shareCode } = useParams<{ shareCode: string }>();

  const [person, setPerson] = useState<Person | null>(null);
  const [items, setItems] = useState<WishlistItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!shareCode) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const loadedPerson = getPersonByShareCode(shareCode);
    if (!loadedPerson) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setPerson(loadedPerson);
    setItems(getWishlistItems(loadedPerson.id));
    setLoading(false);

    // Check if person has PIN - if not, auto-unlock
    setIsUnlocked(!loadedPerson.pin);
  }, [shareCode]);

  const handleTogglePurchased = (id: string, purchased: boolean) => {
    updateWishlistItem(id, { purchased });
    setItems(items.map((item) => (item.id === id ? { ...item, purchased } : item)));
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !person) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="font-display text-xl font-semibold text-gray-800 mb-2">
          Lijstje niet gevonden
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Dit verlanglijstje bestaat niet of is verwijderd.
        </p>
        <Link to="/" className="btn-primary">
          Maak je eigen lijstje
        </Link>
      </div>
    );
  }

  // Show PIN lock screen if person has PIN and not unlocked
  if (person.pin && !isUnlocked) {
    return (
      <PinLock
        personName={person.name}
        correctPin={person.pin}
        onUnlock={handleUnlock}
      />
    );
  }

  const purchasedCount = items.filter((i) => i.purchased).length;
  const unpurchasedItems = items.filter((i) => !i.purchased);
  const purchasedItems = items.filter((i) => i.purchased);

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Header */}
      <div className="magic-gradient px-6 pt-12 pb-20 relative overflow-hidden">
        <Twinkles count={15} />

        <div className="text-center relative z-10">
          <p className="text-white/70 text-sm mb-1">Verlanglijstje van</p>
          <h1 className="font-display text-2xl font-bold text-white">{person.name}</h1>
          <p className="text-white/80 mt-2">
            {items.length === 0 ? (
              'Nog geen wensjes'
            ) : (
              <>
                {items.length} {items.length === 1 ? 'wensje' : 'wensjes'}
                {purchasedCount > 0 && ` • ${purchasedCount} gekocht`}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Info Card */}
          <div className="card bg-gold/10 border border-gold/30">
            <div className="flex items-start gap-3">
              <div className="text-gold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gold-dark">
                Vink items af als je ze hebt gekocht. Anderen zien niet wie iets heeft afgevinkt.
              </p>
            </div>
          </div>

          {/* Wishlist Items */}
          {unpurchasedItems.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-gray-800 mb-3">
                Nog te kopen
              </h2>
              <div className="space-y-3">
                {unpurchasedItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    onTogglePurchased={handleTogglePurchased}
                    onDelete={() => {}}
                    isSharedView
                  />
                ))}
              </div>
            </div>
          )}

          {/* Purchased Items */}
          {purchasedItems.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-gray-500 mb-3">
                Al gekocht ({purchasedItems.length})
              </h2>
              <div className="space-y-3 opacity-75">
                {purchasedItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    onTogglePurchased={handleTogglePurchased}
                    onDelete={() => {}}
                    isSharedView
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">{person.name} heeft nog geen wensjes toegevoegd</p>
              <p className="text-sm text-gray-500">Kom later nog eens terug!</p>
            </div>
          )}

          {/* Create Your Own */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">Ook een verlanglijstje maken?</p>
            <Link to="/" className="btn-secondary inline-block">
              Maak je eigen lijstje
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
