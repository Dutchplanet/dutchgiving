import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { Person, WishlistItem } from '../types';

// Firebase configuration - replace with your own config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Get or create device ID for ownership
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('wensjes_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('wensjes_device_id', deviceId);
  }
  return deviceId;
}

// Generate share code
export function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Persons CRUD
export async function createPerson(person: Omit<Person, 'id' | 'shareCode' | 'createdAt' | 'ownerId'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'persons'), {
    ...person,
    shareCode: generateShareCode(),
    createdAt: Timestamp.now(),
    ownerId: getDeviceId(),
  });
  return docRef.id;
}

export async function getPersons(): Promise<Person[]> {
  const q = query(
    collection(db, 'persons'),
    where('ownerId', '==', getDeviceId()),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
  })) as Person[];
}

export async function getPersonById(id: string): Promise<Person | null> {
  const docRef = doc(db, 'persons', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toMillis?.() || Date.now(),
  } as Person;
}

export async function getPersonByShareCode(shareCode: string): Promise<Person | null> {
  const q = query(
    collection(db, 'persons'),
    where('shareCode', '==', shareCode)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
  } as Person;
}

export async function updatePerson(id: string, data: Partial<Person>): Promise<void> {
  const docRef = doc(db, 'persons', id);
  await updateDoc(docRef, data);
}

export async function deletePerson(id: string): Promise<void> {
  // Delete all wishlist items for this person first
  const items = await getWishlistItems(id);
  for (const item of items) {
    await deleteWishlistItem(item.id);
  }
  // Then delete the person
  const docRef = doc(db, 'persons', id);
  await deleteDoc(docRef);
}

// Wishlist Items CRUD
export async function createWishlistItem(item: Omit<WishlistItem, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'wishlistItems'), {
    ...item,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getWishlistItems(personId: string): Promise<WishlistItem[]> {
  const q = query(
    collection(db, 'wishlistItems'),
    where('personId', '==', personId),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
  })) as WishlistItem[];
}

export async function updateWishlistItem(id: string, data: Partial<WishlistItem>): Promise<void> {
  const docRef = doc(db, 'wishlistItems', id);
  await updateDoc(docRef, data);
}

export async function deleteWishlistItem(id: string): Promise<void> {
  const docRef = doc(db, 'wishlistItems', id);
  await deleteDoc(docRef);
}

// Real-time listeners
export function subscribeToPersons(callback: (persons: Person[]) => void): () => void {
  const q = query(
    collection(db, 'persons'),
    where('ownerId', '==', getDeviceId()),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const persons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
    })) as Person[];
    callback(persons);
  });
}

export function subscribeToWishlistItems(personId: string, callback: (items: WishlistItem[]) => void): () => void {
  const q = query(
    collection(db, 'wishlistItems'),
    where('personId', '==', personId),
    orderBy('order', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
    })) as WishlistItem[];
    callback(items);
  });
}
