import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { WishlistItem as WishlistItemType, Suggestion, AgeGroup, Gender } from '../types';
import {
  PersonWithCollaborators,
  subscribeToPerson,
  subscribeToWishlistItems,
  createWishlistItem,
  updateWishlistItem as updateWishlistItemFb,
  deleteWishlistItem as deleteWishlistItemFb,
  deletePerson as deletePersonFb,
  updatePerson as updatePersonFb,
  addCollaborator,
  removeCollaborator,
  getUserDisplayName,
} from '../lib/firebase';
import { getSuggestionsForPerson } from '../data/suggestions';
import { WishlistItem } from '../components/WishlistItem';
import { SuggestionCard } from '../components/SuggestionCard';
import { AddItemForm } from '../components/AddItemForm';
import { ShareButton } from '../components/ShareButton';
import { ProfileForm } from '../components/ProfileForm';
import { Twinkles } from '../components/Twinkles';
import { PinLock } from '../components/PinLock';
import { useAuth } from '../context/AuthContext';

export function Wishlist() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [person, setPerson] = useState<PersonWithCollaborators | null>(null);
  const [items, setItems] = useState<WishlistItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [collaboratorUsername, setCollaboratorUsername] = useState('');
  const [collaboratorError, setCollaboratorError] = useState('');
  const [collaboratorNames, setCollaboratorNames] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Subscribe to person and items
  useEffect(() => {
    if (!personId) {
      navigate('/persons', { replace: true });
      return;
    }

    const unsubscribePerson = subscribeToPerson(personId, (loadedPerson) => {
      if (!loadedPerson) {
        navigate('/persons', { replace: true });
        return;
      }
      setPerson(loadedPerson);
      setIsUnlocked(!loadedPerson.pin);
      setLoading(false);
    });

    const unsubscribeItems = subscribeToWishlistItems(personId, (loadedItems) => {
      setItems(loadedItems);
    });

    return () => {
      unsubscribePerson();
      unsubscribeItems();
    };
  }, [personId, navigate]);

  // Load collaborator display names
  useEffect(() => {
    async function loadCollaboratorNames() {
      if (!person?.collaborators) return;
      const names: Record<string, string> = {};
      for (const username of person.collaborators) {
        const displayName = await getUserDisplayName(username);
        names[username] = displayName || username;
      }
      setCollaboratorNames(names);
    }
    loadCollaboratorNames();
  }, [person?.collaborators]);

  // Calculate totals
  const totalSpent = useMemo(() => {
    return items
      .filter((i) => i.purchased && i.price)
      .reduce((sum, item) => sum + (item.price || 0), 0);
  }, [items]);

  // Calculate remaining budget for filtering suggestions
  const remainingBudget = person?.budget ? person.budget - totalSpent : undefined;

  const suggestions = useMemo(() => {
    if (!person) return [];
    return getSuggestionsForPerson(
      person.ageGroup,
      person.gender,
      person.interests,
      remainingBudget
    );
  }, [person, remainingBudget]);

  const isOwner = person?.ownerId === user?.username;

  const handleAddItem = async (data: {
    name: string;
    price?: number;
    url?: string;
    imageUrl?: string;
    note?: string;
  }) => {
    if (!personId) return;

    await createWishlistItem({
      personId,
      ...data,
      purchased: false,
      order: items.length,
    });

    setShowAddForm(false);
  };

  const handleAddSuggestion = async (suggestion: Suggestion) => {
    if (!personId) return;

    await createWishlistItem({
      personId,
      name: suggestion.name,
      imageUrl: suggestion.imageUrl,
      purchased: false,
      order: items.length,
    });
  };

  const handleTogglePurchased = async (id: string, purchased: boolean) => {
    await updateWishlistItemFb(id, { purchased });
  };

  const handleDeleteItem = async (id: string) => {
    await deleteWishlistItemFb(id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // Update order for each item
      for (let i = 0; i < newItems.length; i++) {
        if (newItems[i].order !== i) {
          await updateWishlistItemFb(newItems[i].id, { order: i });
        }
      }
    }
  };

  const handleDeletePerson = async () => {
    if (!personId) return;
    await deletePersonFb(personId);
    navigate('/persons', { replace: true });
  };

  const handleEditPerson = async (data: {
    name: string;
    ageGroup: AgeGroup;
    gender: Gender;
    interests: string[];
    photoUrl?: string;
    budget?: number;
    pin?: string;
  }) => {
    if (!personId || !person) return;
    await updatePersonFb(personId, data);
    setShowEditModal(false);
  };

  const handleAddCollaborator = async () => {
    if (!personId || !collaboratorUsername.trim()) return;

    setCollaboratorError('');
    const result = await addCollaborator(personId, collaboratorUsername);

    if (result.success) {
      setCollaboratorUsername('');
    } else {
      setCollaboratorError(result.error || 'Er ging iets mis');
    }
  };

  const handleRemoveCollaborator = async (username: string) => {
    if (!personId) return;
    await removeCollaborator(personId, username);
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

  if (!person) {
    return null;
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
  const budgetRemaining = person.budget ? person.budget - totalSpent : null;

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* Header */}
      <div className="magic-gradient px-6 pt-12 pb-24 relative overflow-hidden">
        <Twinkles count={15} />

        {/* Back to lists button */}
        <Link
          to="/persons"
          className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors z-10"
          title="Verlanglijstjes"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </Link>

        {/* Edit, Collaborators & Share buttons */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
          {isOwner && (
            <>
              <button
                onClick={() => setShowCollaboratorModal(true)}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Samenwerkers"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Bewerken"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </>
          )}
          <ShareButton person={person} />
        </div>

        {/* Person photo or initials */}
        <div className="flex justify-center mb-3 relative z-10">
          {person.photoUrl ? (
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
              <img
                src={person.photoUrl}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center">
              <span className="text-white font-display font-bold text-2xl">
                {person.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
          )}
        </div>

        <h1 className="font-display text-2xl font-bold text-white text-center relative z-10">
          {person.name}
        </h1>
        <p className="text-white/80 text-center mt-1 relative z-10">
          {items.length === 0 ? (
            'Nog geen wensjes'
          ) : (
            <>
              {items.length} {items.length === 1 ? 'wensje' : 'wensjes'}
              {purchasedCount > 0 && ` • ${purchasedCount} gekocht`}
            </>
          )}
        </p>

        {/* Suggestions title in header for better visibility */}
        {suggestions.length > 0 && (
          <h2 className="font-display font-semibold text-white text-center mt-6 relative z-10">
            Suggesties voor {person.name}
          </h2>
        )}
      </div>

      {/* Content */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
              {suggestions.slice(0, 10).map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAdd={handleAddSuggestion}
                />
              ))}
            </div>
          )}

          {/* Add Form or Button */}
          {showAddForm ? (
            <div className="card">
              <h3 className="font-display font-semibold text-gray-800 mb-4">
                Nieuw wensje toevoegen
              </h3>
              <AddItemForm
                onSubmit={handleAddItem}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full card card-hover flex items-center justify-center gap-2 py-4 text-primary font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Wensje toevoegen
            </button>
          )}

          {/* Wishlist Items */}
          {unpurchasedItems.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-gray-800 mb-3">
                Verlanglijstje
              </h2>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={unpurchasedItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {unpurchasedItems.map((item) => (
                      <WishlistItem
                        key={item.id}
                        item={item}
                        onTogglePurchased={handleTogglePurchased}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Purchased Items */}
          {purchasedItems.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-gray-500 mb-3">
                Gekocht ({purchasedItems.length})
              </h2>
              <div className="space-y-3 opacity-75">
                {purchasedItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    onTogglePurchased={handleTogglePurchased}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && !showAddForm && (
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
              <p className="text-gray-600 mb-2">Nog geen wensjes toegevoegd</p>
              <p className="text-sm text-gray-500">
                Voeg items toe of kies uit de suggesties hierboven
              </p>
            </div>
          )}

          {/* Delete Person - only for owner */}
          {isOwner && (
            <div className="pt-8 border-t border-gray-200">
              {showDeleteConfirm ? (
                <div className="text-center space-y-3">
                  <p className="text-red-600 font-medium">
                    Weet je zeker dat je dit lijstje wilt verwijderen?
                  </p>
                  <p className="text-sm text-gray-500">
                    Dit verwijdert ook alle {items.length} wensjes.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 btn-secondary"
                    >
                      Annuleren
                    </button>
                    <button
                      onClick={handleDeletePerson}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-full transition-colors"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-center text-red-500 hover:text-red-600 text-sm"
                >
                  Lijstje van {person.name} verwijderen
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom bar with totals */}
      {(totalSpent > 0 || person.budget) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-bottom z-20">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totaal uitgegeven</p>
              <p className="text-xl font-display font-bold text-gray-800">
                €{totalSpent.toFixed(2).replace('.', ',')}
              </p>
            </div>
            {person.budget && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Budget</p>
                <p className={`text-xl font-display font-bold ${
                  budgetRemaining !== null && budgetRemaining < 0 ? 'text-red-500' : 'text-green-600'
                }`}>
                  €{person.budget.toFixed(2).replace('.', ',')}
                </p>
                {budgetRemaining !== null && (
                  <p className={`text-xs ${budgetRemaining < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {budgetRemaining >= 0
                      ? `Nog €${budgetRemaining.toFixed(2).replace('.', ',')} over`
                      : `€${Math.abs(budgetRemaining).toFixed(2).replace('.', ',')} over budget`
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">
                {person.name} bewerken
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ProfileForm
                initialName={person.name}
                initialAgeGroup={person.ageGroup}
                initialGender={person.gender}
                initialInterests={person.interests}
                initialPhotoUrl={person.photoUrl}
                initialBudget={person.budget}
                initialPin={person.pin}
                onSubmit={handleEditPerson}
                submitLabel="Opslaan"
              />
            </div>
          </div>
        </div>
      )}

      {/* Collaborator Modal */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">
                Samenwerkers beheren
              </h3>
              <button
                onClick={() => setShowCollaboratorModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Voeg andere gebruikers toe om samen aan dit lijstje te werken.
              </p>

              {/* Add collaborator */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={collaboratorUsername}
                  onChange={(e) => setCollaboratorUsername(e.target.value)}
                  placeholder="Gebruikersnaam"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddCollaborator}
                  className="btn-primary px-4"
                >
                  Toevoegen
                </button>
              </div>
              {collaboratorError && (
                <p className="text-red-500 text-sm">{collaboratorError}</p>
              )}

              {/* Current collaborators */}
              {person.collaborators && person.collaborators.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Huidige samenwerkers</h4>
                  {person.collaborators.map((username) => (
                    <div
                      key={username}
                      className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {collaboratorNames[username] || username}
                        </p>
                        <p className="text-sm text-gray-500">@{username}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(username)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(!person.collaborators || person.collaborators.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nog geen samenwerkers toegevoegd
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
