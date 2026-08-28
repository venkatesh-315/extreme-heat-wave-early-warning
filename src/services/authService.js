// Authentication and Session State Service for ThermoGuard
const AUTH_STORAGE_KEY = 'thermoguard_auth_user_session';

export const USER_ROLES = {
  AUTHORITY: 'authority',
  CITIZEN: 'citizen',
};

export const DEFAULT_USERS = {
  authority: {
    id: 'usr_auth_01',
    name: 'Officer #4102',
    role: 'authority',
    title: 'Disaster Response Officer',
    department: 'Disaster Control Desk',
    email: 'officer4102@gov.in',
    avatar: 'OF',
    badge: 'Duty Officer',
  },
  citizen: {
    id: 'usr_cit_01',
    name: 'Public User #8204',
    role: 'citizen',
    title: 'Community Resident',
    department: 'Civic Safety Network',
    email: 'user8204@thermoguard.in',
    avatar: 'PU',
    badge: 'Verified Access',
  }
};

export function getCurrentUser() {
  try {
    const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error reading auth user from storage:', err);
  }
  return null;
}

export function saveCurrentUser(user) {
  try {
    if (user) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error saving auth user:', err);
  }
}

export async function quickLoginByRole(role = 'authority') {
  // Direct login simulator matching selected role
  const user = DEFAULT_USERS[role] || DEFAULT_USERS.authority;
  saveCurrentUser(user);
  return user;
}

export function logoutUser() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  try {
    localStorage.removeItem('thermoguard_auth_user_v1');
  } catch {
    // ignore
  }
}

