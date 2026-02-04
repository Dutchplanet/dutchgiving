import { Person, WishlistItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const PERSONS_KEY = 'wensjes_persons';
const ITEMS_KEY = 'wensjes_items';
const DEVICE_ID_KEY = 'wensjes_device_id';

// Get or create device ID
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'device_' + uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// Generate share code
export function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Persons
export function getPersons(): Person[] {
  const data = localStorage.getItem(PERSONS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function savePerson(person: Omit<Person, 'id' | 'shareCode' | 'createdAt' | 'ownerId'>): Person {
  const persons = getPersons();
  const newPerson: Person = {
    ...person,
    id: uuidv4(),
    shareCode: generateShareCode(),
    createdAt: Date.now(),
    ownerId: getDeviceId(),
  };
  persons.unshift(newPerson);
  localStorage.setItem(PERSONS_KEY, JSON.stringify(persons));
  return newPerson;
}

export function getPersonById(id: string): Person | undefined {
  const persons = getPersons();
  return persons.find(p => p.id === id);
}

export function getPersonByShareCode(shareCode: string): Person | undefined {
  const persons = getPersons();
  return persons.find(p => p.shareCode === shareCode);
}

export function updatePerson(id: string, data: Partial<Person>): void {
  const persons = getPersons();
  const index = persons.findIndex(p => p.id === id);
  if (index !== -1) {
    persons[index] = { ...persons[index], ...data };
    localStorage.setItem(PERSONS_KEY, JSON.stringify(persons));
  }
}

export function deletePerson(id: string): void {
  let persons = getPersons();
  persons = persons.filter(p => p.id !== id);
  localStorage.setItem(PERSONS_KEY, JSON.stringify(persons));

  // Also delete all items for this person
  let items = getWishlistItems(id);
  items.forEach(item => deleteWishlistItem(item.id));
}

// Wishlist Items
export function getAllItems(): WishlistItem[] {
  const data = localStorage.getItem(ITEMS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function getWishlistItems(personId: string): WishlistItem[] {
  const items = getAllItems();
  return items
    .filter(item => item.personId === personId)
    .sort((a, b) => a.order - b.order);
}

export function saveWishlistItem(item: Omit<WishlistItem, 'id' | 'createdAt'>): WishlistItem {
  const items = getAllItems();
  const newItem: WishlistItem = {
    ...item,
    id: uuidv4(),
    createdAt: Date.now(),
  };
  items.push(newItem);
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  return newItem;
}

export function updateWishlistItem(id: string, data: Partial<WishlistItem>): void {
  const items = getAllItems();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...data };
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }
}

export function deleteWishlistItem(id: string): void {
  let items = getAllItems();
  items = items.filter(i => i.id !== id);
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function reorderWishlistItems(_personId: string, itemIds: string[]): void {
  const items = getAllItems();
  itemIds.forEach((id, index) => {
    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex !== -1) {
      items[itemIndex].order = index;
    }
  });
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

// Count items for a person
export function getItemCount(personId: string): number {
  return getWishlistItems(personId).length;
}

export function getPurchasedCount(personId: string): number {
  return getWishlistItems(personId).filter(i => i.purchased).length;
}

export function getTotalSpent(personId: string): number {
  return getWishlistItems(personId)
    .filter(i => i.purchased && i.price)
    .reduce((sum, item) => sum + (item.price || 0), 0);
}
