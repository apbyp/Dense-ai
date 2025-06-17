// Keys for UI preferences and session token
const AUTH_TOKEN_KEY = 'dense_ai_auth_token';
const SIDEBAR_OPEN_STATUS_BASE_KEY = 'denseAiSidebarOpenStatusUser';


// --- Auth Token Functions ---

export const saveAuthToken = (token: string | null): void => {
  try {
    if (token === null) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error("Error saving auth token to localStorage:", error);
  }
};

export const loadAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error loading auth token from localStorage:", error);
    return null;
  }
};

export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error removing auth token from localStorage:", error);
  }
};


// --- User-Specific UI Preferences ---

const getUserSpecificKey = (baseKey: string, userId: string | null): string | null => {
  if (!userId) {
    return null; 
  }
  return `${baseKey}_${userId}`;
};

export const saveSidebarOpenStatusForUser = (isOpen: boolean, userId: string | null): void => {
  const key = getUserSpecificKey(SIDEBAR_OPEN_STATUS_BASE_KEY, userId);
  if (!key) {
    // Not critical enough to log error if no user for a UI pref
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(isOpen));
  } catch (error) {
    console.error(`Error saving sidebar status for user ${userId} to localStorage:`, error);
  }
};

export const loadSidebarOpenStatusForUser = (userId: string | null): boolean => {
  const key = getUserSpecificKey(SIDEBAR_OPEN_STATUS_BASE_KEY, userId);
  if (!key) {
    return true; // Default to open if no user or no stored preference
  }
  try {
    const storedStatus = localStorage.getItem(key);
    if (storedStatus !== null) {
      return JSON.parse(storedStatus);
    }
  } catch (error) {
    console.error(`Error loading sidebar status for user ${userId} from localStorage:`, error);
  }
  return true; // Default to open if not found or error
};
