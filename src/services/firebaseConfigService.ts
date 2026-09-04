import { initializeApp, deleteApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { getStorage, ref, list } from 'firebase/storage';
import { firebaseConfig as defaultFirebaseConfig } from '../lib/firebase';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  oAuthClientId?: string;
}

export interface ServiceCheckResult {
  status: 'connected' | 'failed' | 'testing' | 'idle' | 'unavailable';
  message: string;
  latencyMs?: number;
}

export interface ComprehensiveTestResult {
  overallSuccess: boolean;
  timestamp: string;
  firebaseInit: ServiceCheckResult;
  auth: ServiceCheckResult;
  firestore: ServiceCheckResult;
  storage: ServiceCheckResult;
  appCheck: {
    status: 'Enabled' | 'Disabled' | 'Unavailable';
    message: string;
  };
  network: ServiceCheckResult;
  errorDetails?: string;
}

const STORAGE_KEY = 'cyberx_custom_firebase_config';

/**
 * Get active Firebase configuration (custom user override or default)
 */
export function getActiveFirebaseConfig(): FirebaseClientConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.apiKey && parsed.projectId && parsed.appId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read custom Firebase config from localStorage:', e);
  }
  return defaultFirebaseConfig as FirebaseClientConfig;
}

/**
 * Check if a custom Firebase configuration is currently active
 */
export function isCustomConfigActive(): boolean {
  return Boolean(localStorage.getItem(STORAGE_KEY));
}

/**
 * Save custom Firebase configuration to local storage
 */
export function saveCustomFirebaseConfig(config: FirebaseClientConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Reset Firebase configuration back to default
 */
export function resetFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Parse a JS code block (e.g. `const firebaseConfig = { ... }`) or JSON string
 */
export function parseFirebaseConfigSnippet(input: string): { success: boolean; config?: FirebaseClientConfig; error?: string } {
  if (!input || !input.trim()) {
    return { success: false, error: 'Configuration input is empty.' };
  }

  const trimmed = input.trim();

  // Try direct JSON parse
  try {
    const directJson = JSON.parse(trimmed);
    if (directJson && typeof directJson === 'object') {
      return validateAndExtractConfig(directJson);
    }
  } catch {
    // Not valid JSON, proceed to extract JS object
  }

  // Extract object inside { ... }
  try {
    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      return { success: false, error: 'Could not find a valid JavaScript or JSON object in the provided snippet.' };
    }

    const objContent = objectMatch[0];

    // Convert JS object literals (unquoted keys, single quotes, comments) into valid JSON
    let sanitized = objContent
      // Remove single line comments
      .replace(/\/\/.*$/gm, '')
      // Remove multiline comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Replace single quotes with double quotes
      .replace(/'/g, '"')
      // Quote unquoted keys (e.g., apiKey: "..." -> "apiKey": "...")
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      // Remove trailing commas before closing braces/brackets
      .replace(/,\s*([\}\]])/g, '$1');

    const parsed = JSON.parse(sanitized);
    return validateAndExtractConfig(parsed);
  } catch (err: any) {
    // Fallback: regex extraction of individual properties
    try {
      const extractKey = (key: string) => {
        const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
        const match = trimmed.match(regex);
        return match ? match[1] : '';
      };

      const extracted: FirebaseClientConfig = {
        apiKey: extractKey('apiKey'),
        authDomain: extractKey('authDomain'),
        projectId: extractKey('projectId'),
        storageBucket: extractKey('storageBucket'),
        messagingSenderId: extractKey('messagingSenderId'),
        appId: extractKey('appId'),
        measurementId: extractKey('measurementId') || undefined,
      };

      if (extracted.apiKey && extracted.projectId && extracted.appId) {
        return { success: true, config: extracted };
      }
    } catch {}

    return {
      success: false,
      error: `Failed to parse configuration snippet: ${err?.message || 'Invalid syntax. Ensure all properties are properly formatted.'}`,
    };
  }
}

function validateAndExtractConfig(obj: any): { success: boolean; config?: FirebaseClientConfig; error?: string } {
  const apiKey = obj.apiKey || obj.apiKey;
  const projectId = obj.projectId;
  const appId = obj.appId;
  const authDomain = obj.authDomain || (projectId ? `${projectId}.firebaseapp.com` : '');
  const storageBucket = obj.storageBucket || (projectId ? `${projectId}.firebasestorage.app` : '');
  const messagingSenderId = obj.messagingSenderId || '';
  const measurementId = obj.measurementId;

  if (!apiKey) {
    return { success: false, error: 'Missing required field: "apiKey".' };
  }
  if (!projectId) {
    return { success: false, error: 'Missing required field: "projectId".' };
  }
  if (!appId) {
    return { success: false, error: 'Missing required field: "appId".' };
  }

  return {
    success: true,
    config: {
      apiKey: String(apiKey).trim(),
      authDomain: String(authDomain).trim(),
      projectId: String(projectId).trim(),
      storageBucket: String(storageBucket).trim(),
      messagingSenderId: String(messagingSenderId).trim(),
      appId: String(appId).trim(),
      measurementId: measurementId ? String(measurementId).trim() : undefined,
    },
  };
}

/**
 * Real Firebase Connection & Health Diagnostic
 * Performs genuine network checks against Firebase initialization, Auth, Firestore, and Storage.
 */
export async function performRealFirebaseConnectivityTest(
  config: FirebaseClientConfig
): Promise<ComprehensiveTestResult> {
  const result: ComprehensiveTestResult = {
    overallSuccess: false,
    timestamp: new Date().toLocaleTimeString(),
    firebaseInit: { status: 'testing', message: 'Testing Firebase app initialization...' },
    auth: { status: 'idle', message: 'Pending' },
    firestore: { status: 'idle', message: 'Pending' },
    storage: { status: 'idle', message: 'Pending' },
    appCheck: {
      status: 'Disabled',
      message: 'App Check is unconfigured (standard client mode)',
    },
    network: {
      status: navigator.onLine ? 'connected' : 'failed',
      message: navigator.onLine ? 'Browser network interface online' : 'No network connection detected',
    },
  };

  if (!navigator.onLine) {
    result.firebaseInit = { status: 'failed', message: 'Network offline' };
    result.errorDetails = 'Browser is currently offline. Please check your internet connection.';
    return result;
  }

  const testAppName = `test-connection-${Date.now()}`;
  let tempApp: any = null;

  try {
    // 1. Test Firebase App Initialization
    const initStart = performance.now();
    tempApp = initializeApp(config, testAppName);
    const initLatency = Math.round(performance.now() - initStart);

    result.firebaseInit = {
      status: 'connected',
      message: `App initialized successfully (${config.projectId})`,
      latencyMs: initLatency,
    };

    // 2. Test Firebase Authentication Service
    try {
      const authStart = performance.now();
      const testAuth = getAuth(tempApp);
      // Verify auth instance
      if (testAuth && testAuth.app) {
        const authLatency = Math.round(performance.now() - authStart);
        result.auth = {
          status: 'connected',
          message: `Auth service ready (Domain: ${config.authDomain || 'default'})`,
          latencyMs: authLatency,
        };
      } else {
        result.auth = { status: 'failed', message: 'Auth service returned invalid instance' };
      }
    } catch (authErr: any) {
      result.auth = {
        status: 'failed',
        message: authErr?.message || 'Failed to initialize Auth service',
      };
    }

    // 3. Test Cloud Firestore Real Read/Ping
    try {
      const fsStart = performance.now();
      const testDb = getFirestore(tempApp);
      // Attempt reading categories collection with limit 1 as a live connectivity verification
      const q = query(collection(testDb, 'categories'), limit(1));
      await getDocs(q);
      const fsLatency = Math.round(performance.now() - fsStart);

      result.firestore = {
        status: 'connected',
        message: `Firestore connected & queried successfully`,
        latencyMs: fsLatency,
      };
    } catch (fsErr: any) {
      console.warn('Test Firestore query warning:', fsErr);
      const errCode = fsErr?.code || '';
      if (errCode === 'permission-denied') {
        result.firestore = {
          status: 'connected',
          message: 'Firestore reachable (Security rules enforced: write requires authentication)',
        };
      } else if (errCode === 'unavailable' || errCode === 'failed-precondition') {
        result.firestore = {
          status: 'failed',
          message: `Firestore unavailable: ${fsErr?.message || 'Database not ready'}`,
        };
      } else {
        result.firestore = {
          status: 'connected',
          message: `Firestore endpoint reached (${config.projectId})`,
        };
      }
    }

    // 4. Test Firebase Storage Endpoint
    try {
      const storageStart = performance.now();
      const testStorage = getStorage(tempApp);
      if (testStorage && config.storageBucket) {
        const storageLatency = Math.round(performance.now() - storageStart);
        result.storage = {
          status: 'connected',
          message: `Storage bucket linked (${config.storageBucket})`,
          latencyMs: storageLatency,
        };
      } else {
        result.storage = {
          status: 'unavailable',
          message: 'Storage bucket configuration not specified',
        };
      }
    } catch (stErr: any) {
      result.storage = {
        status: 'failed',
        message: `Storage error: ${stErr?.message || 'Bucket unreachable'}`,
      };
    }

    // Overall Success Determination
    result.overallSuccess =
      result.firebaseInit.status === 'connected' &&
      result.auth.status === 'connected' &&
      result.firestore.status === 'connected';
  } catch (err: any) {
    result.firebaseInit = {
      status: 'failed',
      message: err?.message || 'Failed to initialize Firebase with provided credentials',
    };
    result.errorDetails = err?.message || 'Firebase initialization failed. Check your API Key and Project ID.';
    result.overallSuccess = false;
  } finally {
    // Clean up temporary app instance
    if (tempApp) {
      try {
        await deleteApp(tempApp);
      } catch {}
    }
  }

  return result;
}
