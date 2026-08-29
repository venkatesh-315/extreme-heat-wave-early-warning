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

export async function loginWithCredentials(credentials = {}) {
  const role = credentials.role || 'authority';
  
  if (role === 'authority') {
    const rawId = (credentials.officerIdOrEmail || '').trim();
    let displayName = 'Officer #4102';
    let email = 'officer4102@gov.in';
    let avatar = 'OF';

    if (rawId) {
      if (rawId.includes('@')) {
        email = rawId;
        const prefix = rawId.split('@')[0];
        displayName = `Officer ${prefix.charAt(0).toUpperCase() + prefix.slice(1)}`;
        avatar = prefix.slice(0, 2).toUpperCase();
      } else {
        displayName = rawId.toUpperCase().startsWith('AUTH-') ? `Officer ${rawId.toUpperCase()}` : `Officer #${rawId}`;
        email = `${rawId.toLowerCase().replace(/[^a-z0-9]/g, '')}@gov.in`;
        avatar = rawId.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'OF';
      }
    }

    const user = {
      id: `usr_auth_${Date.now()}`,
      name: displayName,
      role: 'authority',
      title: 'Disaster Response Officer',
      department: credentials.department || 'Disaster Control Desk',
      email: email,
      avatar: avatar || 'OF',
      badge: 'Duty Officer',
      terminalAuthorized: Boolean(credentials.rememberDevice),
      loginAt: new Date().toISOString(),
    };
    saveCurrentUser(user);
    return user;
  }

  // Citizen role
  const rawInput = (credentials.phoneOrEmail || '').trim();
  let displayName = 'Public Resident';
  let email = 'user8204@thermoguard.in';
  let phone = '+91 98765 43210';
  let avatar = 'PU';

  if (rawInput) {
    if (rawInput.includes('@')) {
      email = rawInput;
      const prefix = rawInput.split('@')[0];
      displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      avatar = prefix.slice(0, 2).toUpperCase();
      phone = '+91 98765 43210';
    } else {
      phone = rawInput.startsWith('+91') ? rawInput : `+91 ${rawInput.replace(/[^0-9]/g, '')}`;
      const lastDigits = rawInput.replace(/[^0-9]/g, '').slice(-4) || '8204';
      displayName = `Citizen #${lastDigits}`;
      email = `citizen${lastDigits}@thermoguard.in`;
      avatar = 'CZ';
    }
  }

  const user = {
    id: `usr_cit_${Date.now()}`,
    name: displayName,
    role: 'citizen',
    title: 'Community Resident',
    department: credentials.alertLocation || 'Civic Safety Network',
    email: email,
    phone: phone,
    avatar: avatar || 'PU',
    badge: 'Verified Access',
    alertsOptIn: credentials.alertsOptIn !== false,
    loginAt: new Date().toISOString(),
  };
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


