import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

const provider = new GoogleAuthProvider();
provider.addScope(GMAIL_SCOPE);
provider.setCustomParameters({
  prompt: 'select_account',
});

let cachedAccessToken: string | null = null;

/**
 * Listen to Firebase Auth state changes.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

/**
 * Google Sign-In via popup (also requests Gmail readonly scope for Prayer Room invites).
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  cachedAccessToken = credential?.accessToken || null;
  return { user: result.user, accessToken: cachedAccessToken || '' };
};

/**
 * Firebase Email + Password Sign-In for Gospel Partners.
 */
export const signInWithPartnerEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const res = await signInWithEmailAndPassword(auth, email.trim(), password);
  return res.user;
};

/**
 * Firebase Email + Password Registration for new Gospel Partners.
 */
export const registerPartnerWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName && displayName.trim()) {
    await updateProfile(res.user, { displayName: displayName.trim() });
  }
  return res.user;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface GmailMessageSummary {
  id: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
}

/**
 * Fetch fellowship emails and prayer invites from Gmail API using Bearer accessToken.
 */
export const fetchGmailClassEmails = async (): Promise<{
  success: boolean;
  messages: GmailMessageSummary[];
  emailAddress?: string;
  totalFound?: number;
  error?: string;
}> => {
  const token = await getAccessToken();
  if (!token) {
    return {
      success: false,
      messages: [],
      error: 'Sign in with Google / Gmail to load live prayer invites from your inbox.',
    };
  }

  try {
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    let emailAddress = auth.currentUser?.email || undefined;
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      emailAddress = profileData.emailAddress || emailAddress;
    }

    const query = encodeURIComponent(
      'gospel OR prayer OR fellowship OR "Jesus Never Fail" OR bible OR worship OR meet'
    );
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8&q=${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!listRes.ok) {
      const fallbackRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!fallbackRes.ok) {
        const errJson = await fallbackRes.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Failed to list Gmail messages');
      }
      const data = await fallbackRes.json();
      return processMessageList(data.messages || [], token, emailAddress);
    }

    const data = await listRes.json();
    return processMessageList(data.messages || [], token, emailAddress);
  } catch (err: any) {
    console.error('Error fetching Gmail messages:', err);
    return {
      success: false,
      messages: [],
      error: err.message || 'Error communicating with Gmail API',
    };
  }
};

async function processMessageList(
  msgItems: { id: string }[],
  token: string,
  emailAddress?: string
): Promise<{
  success: boolean;
  messages: GmailMessageSummary[];
  emailAddress?: string;
  totalFound: number;
}> {
  if (!msgItems.length) {
    return {
      success: true,
      messages: [],
      emailAddress,
      totalFound: 0,
    };
  }

  const detailedMessages: GmailMessageSummary[] = await Promise.all(
    msgItems.slice(0, 5).map(async (m) => {
      try {
        const itemRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!itemRes.ok) {
          return { id: m.id, snippet: 'Fellowship prayer update' };
        }
        const itemData = await itemRes.json();
        const headers = itemData.payload?.headers || [];
        const subject =
          headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value ||
          'Fellowship Gathering Notice';
        const from =
          headers.find((h: any) => h.name.toLowerCase() === 'from')?.value ||
          'Jesus Never Fail Ministries';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

        return {
          id: m.id,
          snippet: itemData.snippet || 'Gospel fellowship schedule and prayer notes.',
          subject,
          from,
          date,
        };
      } catch {
        return { id: m.id, snippet: 'Fellowship schedule email' };
      }
    })
  );

  return {
    success: true,
    messages: detailedMessages,
    emailAddress,
    totalFound: msgItems.length,
  };
}
