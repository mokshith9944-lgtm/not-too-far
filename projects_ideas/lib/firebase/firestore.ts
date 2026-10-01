import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { app } from './config';
import { PartyRoom, ChatMessage, Universe } from '@/lib/types';

export const db = typeof window !== 'undefined' ? getFirestore(app) : null;

/**
 * Save or update a watch party room in Firestore
 */
export async function saveRoomToFirestore(room: PartyRoom): Promise<void> {
  if (!db) return;
  try {
    const roomRef = doc(db, 'party_rooms', room.id);
    await setDoc(roomRef, {
      ...room,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Could not save room (fallback active):', err);
  }
}

/**
 * Fetch a specific watch party room from Firestore
 */
export async function getRoomFromFirestore(roomId: string): Promise<PartyRoom | null> {
  if (!db) return null;
  try {
    const roomRef = doc(db, 'party_rooms', roomId);
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      return snap.data() as PartyRoom;
    }
    return null;
  } catch (err) {
    console.warn(`[Firestore] Could not fetch room ${roomId}:`, err);
    return null;
  }
}

/**
 * Fetch all active watch party rooms
 */
export async function getRoomsFromFirestore(): Promise<PartyRoom[]> {
  if (!db) return [];
  try {
    const roomsCol = collection(db, 'party_rooms');
    const q = query(roomsCol, limit(20));
    const snapshot = await getDocs(q);
    const rooms: PartyRoom[] = [];
    snapshot.forEach((d) => {
      rooms.push(d.data() as PartyRoom);
    });
    return rooms;
  } catch (err) {
    console.warn('[Firestore] Could not fetch rooms (fallback active):', err);
    return [];
  }
}

/**
 * Save chat message to Firestore
 */
export async function saveMessageToFirestore(message: ChatMessage): Promise<void> {
  if (!db) return;
  try {
    const msgCol = collection(db, 'messages');
    await addDoc(msgCol, {
      ...message,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Firestore] Could not save message (fallback active):', err);
  }
}

/**
 * Fetch chat messages for a room from Firestore
 */
export async function getMessagesFromFirestore(roomId: string): Promise<ChatMessage[]> {
  if (!db) return [];
  try {
    const msgCol = collection(db, 'messages');
    const q = query(msgCol, where('room_id', '==', roomId), limit(50));
    const snapshot = await getDocs(q);
    const msgs: ChatMessage[] = [];
    snapshot.forEach((d) => {
      msgs.push(d.data() as ChatMessage);
    });
    return msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (err) {
    console.warn(`[Firestore] Could not fetch messages for room ${roomId}:`, err);
    return [];
  }
}

/**
 * Save Universe to Firestore
 */
export async function saveUniverseToFirestore(universe: Universe): Promise<void> {
  if (!db) return;
  try {
    const univRef = doc(db, 'universes', universe.id);
    await setDoc(univRef, {
      ...universe,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Could not save universe (fallback active):', err);
  }
}

/**
 * Fetch a specific Universe from Firestore
 */
export async function getUniverseFromFirestore(universeId: string): Promise<Universe | null> {
  if (!db) return null;
  try {
    const univRef = doc(db, 'universes', universeId);
    const snap = await getDoc(univRef);
    if (snap.exists()) {
      return snap.data() as Universe;
    }
    return null;
  } catch (err) {
    console.warn(`[Firestore] Could not fetch universe ${universeId}:`, err);
    return null;
  }
}

/**
 * Fetch all Universes from Firestore
 */
export async function getUniversesFromFirestore(): Promise<Universe[]> {
  if (!db) return [];
  try {
    const univCol = collection(db, 'universes');
    const q = query(univCol, limit(20));
    const snapshot = await getDocs(q);
    const universes: Universe[] = [];
    snapshot.forEach((d) => {
      universes.push(d.data() as Universe);
    });
    return universes;
  } catch (err) {
    console.warn('[Firestore] Could not fetch universes (fallback active):', err);
    return [];
  }
}
