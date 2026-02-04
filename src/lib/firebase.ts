import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
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
  or,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { Person, WishlistItem } from '../types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6wVJ0wt3su3E0UyuYeyj15Qc-qxMgq-8",
  authDomain: "dutchgiving-2fb9d.firebaseapp.com",
  projectId: "dutchgiving-2fb9d",
  storageBucket: "dutchgiving-2fb9d.firebasestorage.app",
  messagingSenderId: "941613694287",
  appId: "1:941613694287:web:427dd4d4825cc93dddd93a",
  measurementId: "G-DK06RJ4FN1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Simple hash function for password (not cryptographically secure, but ok for this use case)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'dutchgiving_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// User types
export interface User {
  username: string;
  passwordHash: string;
  displayName: string;
  createdAt: number;
}

// Session management
const SESSION_KEY = 'dutchgiving_session';

export function getCurrentUser(): { username: string; displayName: string } | null {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: { username: string; displayName: string } | null): void {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// Authentication
export async function registerUser(username: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> {
  const normalizedUsername = username.toLowerCase().trim();

  // Validate
  if (normalizedUsername.length < 3) {
    return { success: false, error: 'Gebruikersnaam moet minimaal 3 tekens zijn' };
  }
  if (password.length < 4) {
    return { success: false, error: 'Wachtwoord moet minimaal 4 tekens zijn' };
  }
  if (!displayName.trim()) {
    return { success: false, error: 'Weergavenaam is verplicht' };
  }

  // Check if username exists
  const userRef = doc(db, 'users', normalizedUsername);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return { success: false, error: 'Deze gebruikersnaam is al in gebruik' };
  }

  // Create user
  const passwordHash = await hashPassword(password);
  await setDoc(userRef, {
    username: normalizedUsername,
    passwordHash,
    displayName: displayName.trim(),
    createdAt: Timestamp.now(),
  });

  // Auto login
  setCurrentUser({ username: normalizedUsername, displayName: displayName.trim() });

  return { success: true };
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const normalizedUsername = username.toLowerCase().trim();

  const userRef = doc(db, 'users', normalizedUsername);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return { success: false, error: 'Gebruikersnaam of wachtwoord onjuist' };
  }

  const userData = userDoc.data() as User;
  const passwordHash = await hashPassword(password);

  if (userData.passwordHash !== passwordHash) {
    return { success: false, error: 'Gebruikersnaam of wachtwoord onjuist' };
  }

  setCurrentUser({ username: normalizedUsername, displayName: userData.displayName });
  return { success: true };
}

export function logoutUser(): void {
  setCurrentUser(null);
}

// Check if username exists (for inviting collaborators)
export async function checkUsernameExists(username: string): Promise<boolean> {
  const normalizedUsername = username.toLowerCase().trim();
  const userRef = doc(db, 'users', normalizedUsername);
  const userDoc = await getDoc(userRef);
  return userDoc.exists();
}

export async function getUserDisplayName(username: string): Promise<string | null> {
  const normalizedUsername = username.toLowerCase().trim();
  const userRef = doc(db, 'users', normalizedUsername);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return null;
  return (userDoc.data() as User).displayName;
}

// Generate share code
export function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Extended Person type with collaborators
export interface PersonWithCollaborators extends Person {
  collaborators?: string[]; // array of usernames
}

// Persons CRUD
export async function createPerson(person: Omit<Person, 'id' | 'shareCode' | 'createdAt' | 'ownerId'>): Promise<string> {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Niet ingelogd');

  const docRef = await addDoc(collection(db, 'persons'), {
    ...person,
    shareCode: generateShareCode(),
    createdAt: Timestamp.now(),
    ownerId: currentUser.username,
    collaborators: [],
  });
  return docRef.id;
}

export async function getPersons(): Promise<PersonWithCollaborators[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  // Get persons where user is owner OR collaborator
  const q = query(
    collection(db, 'persons'),
    or(
      where('ownerId', '==', currentUser.username),
      where('collaborators', 'array-contains', currentUser.username)
    )
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
  })) as PersonWithCollaborators[];
}

export async function getPersonById(id: string): Promise<PersonWithCollaborators | null> {
  const docRef = doc(db, 'persons', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toMillis?.() || Date.now(),
  } as PersonWithCollaborators;
}

export async function getPersonByShareCode(shareCode: string): Promise<PersonWithCollaborators | null> {
  const q = query(
    collection(db, 'persons'),
    where('shareCode', '==', shareCode)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toMillis?.() || Date.now(),
  } as PersonWithCollaborators;
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

// Collaborator management
export async function addCollaborator(personId: string, username: string): Promise<{ success: boolean; error?: string }> {
  const normalizedUsername = username.toLowerCase().trim();

  // Check if user exists
  const exists = await checkUsernameExists(normalizedUsername);
  if (!exists) {
    return { success: false, error: 'Gebruiker niet gevonden' };
  }

  const docRef = doc(db, 'persons', personId);
  await updateDoc(docRef, {
    collaborators: arrayUnion(normalizedUsername)
  });

  return { success: true };
}

export async function removeCollaborator(personId: string, username: string): Promise<void> {
  const docRef = doc(db, 'persons', personId);
  await updateDoc(docRef, {
    collaborators: arrayRemove(username.toLowerCase().trim())
  });
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
export function subscribeToPersons(callback: (persons: PersonWithCollaborators[]) => void): () => void {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'persons'),
    or(
      where('ownerId', '==', currentUser.username),
      where('collaborators', 'array-contains', currentUser.username)
    )
  );

  return onSnapshot(q, (snapshot) => {
    const persons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
    })) as PersonWithCollaborators[];
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

// Subscribe to a single person (for real-time updates)
export function subscribeToPerson(personId: string, callback: (person: PersonWithCollaborators | null) => void): () => void {
  const docRef = doc(db, 'persons', personId);
  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toMillis?.() || Date.now(),
    } as PersonWithCollaborators);
  });
}
