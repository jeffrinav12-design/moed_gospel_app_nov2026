import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  BookReleaseItem,
  CustomBiblicalCard,
  FellowshipGroup,
  PrayerRequestItem,
  TopicProgressItem,
  UserProfile,
} from '../types';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

export async function savePartnerProfile(uid: string, profile: UserProfile): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `partners/${uid}`;
  try {
    await setDoc(
      doc(db, 'partners', uid),
      {
        uid,
        displayName: (profile.name || 'Gospel Partner').slice(0, 80),
        email: (profile.email || auth.currentUser.email || '').slice(0, 160),
        role: profile.role,
        pillar: profile.pillar.slice(0, 64),
        avatar: (profile.avatar || '✝️').slice(0, 16),
        preferredBibleLanguage: (profile.preferredBibleLanguage || 'en').slice(0, 16),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchPartnerProfile(uid: string): Promise<Partial<UserProfile> | null> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return null;
  const path = `partners/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'partners', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      uid: d.uid,
      name: d.displayName,
      email: d.email,
      role: d.role,
      pillar: d.pillar,
      avatar: d.avatar,
      preferredBibleLanguage: d.preferredBibleLanguage,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export function subscribeTopicProgress(
  uid: string,
  onData: (progressMap: Record<string, TopicProgressItem>) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `partners/${uid}/progress`;
  const colRef = collection(db, 'partners', uid, 'progress');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const map: Record<string, TopicProgressItem> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TopicProgressItem;
        map[docSnap.id] = data;
      });
      onData(map);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export async function saveTopicProgress(
  uid: string,
  sessionId: string,
  partial: Partial<Omit<TopicProgressItem, 'uid' | 'sessionId'>>
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const safeId = sessionId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  const path = `partners/${uid}/progress/${safeId}`;
  try {
    await setDoc(
      doc(db, 'partners', uid, 'progress', safeId),
      {
        uid,
        sessionId: safeId,
        ...partial,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribePrayerRequests(
  onData: (items: PrayerRequestItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'prayerRequests';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: PrayerRequestItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PrayerRequestItem, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export async function postPrayerRequest(
  authorName: string,
  message: string,
  topicTitle?: string
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Please sign in with Email or Google to post on the live Prayer Wall.');
  }
  const path = 'prayerRequests';
  try {
    await addDoc(collection(db, path), {
      authorUid: auth.currentUser.uid,
      authorName: authorName.trim().slice(0, 80),
      message: message.trim().slice(0, 1000),
      topicTitle: (topicTitle || 'General Prayer').slice(0, 180),
      amenCount: 0,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function incrementPrayerAmen(requestId: string): Promise<void> {
  if (!auth.currentUser) return;
  const path = `prayerRequests/${requestId}`;
  try {
    await updateDoc(doc(db, 'prayerRequests', requestId), {
      amenCount: increment(1),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export function subscribeFellowships(
  onData: (groups: FellowshipGroup[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'fellowships';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(25));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: FellowshipGroup[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FellowshipGroup, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export async function createFellowshipInDb(group: FellowshipGroup): Promise<string | null> {
  if (!auth.currentUser) return null;
  const path = 'fellowships';
  try {
    const ref = await addDoc(collection(db, path), {
      ownerUid: auth.currentUser.uid,
      name: group.name.slice(0, 120),
      pillar: group.pillar.slice(0, 64),
      focusScripture: group.focusScripture.slice(0, 160),
      memberCount: Math.max(1, Number(group.memberCount) || 1),
      meetingLink: group.meetingLink.slice(0, 256),
      currentSessionId: group.currentSessionId.slice(0, 128),
      scheduleTime: group.scheduleTime.slice(0, 80),
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export function subscribeCustomCards(
  uid: string,
  onData: (cards: CustomBiblicalCard[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `partners/${uid}/customCards`;
  const q = query(collection(db, 'partners', uid, 'customCards'), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: CustomBiblicalCard[] = snapshot.docs.map((d) => d.data() as CustomBiblicalCard);
      list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export async function saveCustomCard(
  uid: string,
  card: CustomBiblicalCard
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const safeId = card.cardId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  const path = `partners/${uid}/customCards/${safeId}`;
  const validStyles = ['classic-alabaster', 'torah-scroll', 'sanctuary-rose', 'lapis-scripture'];
  const templateStyle = validStyles.includes(card.templateStyle)
    ? card.templateStyle
    : 'classic-alabaster';

  try {
    await setDoc(
      doc(db, 'partners', uid, 'customCards', safeId),
      {
        uid,
        cardId: safeId,
        title: (card.title || 'Scripture Card').trim().slice(0, 140),
        reference: (card.reference || '').trim().slice(0, 120),
        hebrewOrGreekTerm: (card.hebrewOrGreekTerm || '').trim().slice(0, 160),
        frontPrompt: (card.frontPrompt || 'Front prompt').trim().slice(0, 600),
        backTruth: (card.backTruth || 'Scripture truth').trim().slice(0, 1500),
        historicalNote: (card.historicalNote || '').trim().slice(0, 1000),
        templateStyle,
        updatedAt: new Date().toISOString().slice(0, 64),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteCustomCard(uid: string, cardId: string): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const safeId = cardId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  const path = `partners/${uid}/customCards/${safeId}`;
  try {
    await deleteDoc(doc(db, 'partners', uid, 'customCards', safeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeBookReleases(
  onData: (books: BookReleaseItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'bookReleases';
  const q = query(
    collection(db, path),
    where('releaseStatus', 'in', ['upcoming', 'released']),
    limit(20)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list: BookReleaseItem[] = snapshot.docs.map((d) => d.data() as BookReleaseItem);
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
    }
  );
}

export async function saveBookRelease(book: BookReleaseItem): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Please sign in to publish to the shared Firebase catalog.');
  }
  const safeId = book.bookId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  const path = `bookReleases/${safeId}`;
  const validStyles = ['classic-alabaster', 'torah-scroll', 'sanctuary-rose', 'lapis-scripture'];
  const coverStyle = validStyles.includes(book.coverStyle) ? book.coverStyle : 'torah-scroll';
  const releaseStatus = book.releaseStatus === 'released' ? 'released' : 'upcoming';

  try {
    await setDoc(
      doc(db, 'bookReleases', safeId),
      {
        bookId: safeId,
        ownerUid: book.ownerUid || auth.currentUser.uid,
        title: (book.title || 'New Gospel Book').trim().slice(0, 160),
        subtitle: (book.subtitle || '').trim().slice(0, 200),
        authorName: (book.authorName || 'Jeffrina V · Jesus Never Fail Ministries').trim().slice(0, 100),
        scriptureFocus: (book.scriptureFocus || '').trim().slice(0, 140),
        description: (book.description || 'Gospel book release.').trim().slice(0, 1500),
        releaseStatus,
        releaseDateLabel: (book.releaseDateLabel || '').trim().slice(0, 80),
        purchaseOrReadUrl: (book.purchaseOrReadUrl || '').trim().slice(0, 500),
        youtubeTrailerUrl: (book.youtubeTrailerUrl || '').trim().slice(0, 500),
        coverStyle,
        createdAt: (book.createdAt || new Date().toISOString()).slice(0, 64),
        updatedAt: new Date().toISOString().slice(0, 64),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteBookRelease(bookId: string): Promise<void> {
  if (!auth.currentUser) return;
  const safeId = bookId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  const path = `bookReleases/${safeId}`;
  try {
    await deleteDoc(doc(db, 'bookReleases', safeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}


