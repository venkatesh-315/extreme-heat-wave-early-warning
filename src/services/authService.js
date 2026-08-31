// Authentication and Session State Service for ThermoGuard
const AUTH_STORAGE_KEY = 'thermoguard_auth_user_session';

export const USER_ROLES = {
  AUTHORITY: 'authority',
  CITIZEN: 'citizen',
};

// Generate a valid base64-encoded client JWT token for offline/direct modes
function generateClientToken(userPayload) {
  try {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        id: userPayload.id,
        email: userPayload.email,
        role: userPayload.role,
        name: userPayload.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      })
    );
    const signature = btoa('thermoguard_client_sig_' + userPayload.id);
    return `${header}.${payload}.${signature}`;
  } catch {
    return `tg_token_${userPayload.id}_${Date.now()}`;
  }
}

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
    token: generateClientToken({ id: 'usr_auth_01', name: 'Officer #4102', role: 'authority', email: 'officer4102@gov.in' }),
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
    token: generateClientToken({ id: 'usr_cit_01', name: 'Public User #8204', role: 'citizen', email: 'user8204@thermoguard.in' }),
  }
};

export function getCurrentUser() {
  try {
    // Check persistent localStorage first
    const saved = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const user = JSON.parse(saved);
      // Ensure token exists on user object
      if (!user.token) {
        user.token = generateClientToken(user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
      // Ensure sync to localStorage if it was only in sessionStorage
      if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
        localStorage.setItem(AUTH_STORAGE_KEY, saved);
      }
      return user;
    }
  } catch (err) {
    console.error('Error reading auth user from storage:', err);
  }
  return null;
}

export function saveCurrentUser(user) {
  try {
    if (user) {
      if (!user.token) {
        user.token = generateClientToken(user);
      }
      const userStr = JSON.stringify(user);
      localStorage.setItem(AUTH_STORAGE_KEY, userStr);
      sessionStorage.setItem(AUTH_STORAGE_KEY, userStr);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error saving auth user:', err);
  }
}

export async function quickLoginByRole(role = 'authority') {
  const baseUser = DEFAULT_USERS[role] || DEFAULT_USERS.authority;
  const user = {
    ...baseUser,
    token: baseUser.token || generateClientToken(baseUser),
    loginAt: new Date().toISOString(),
  };

  // Attempt backend quick-login synchronization if backend API is reachable
  try {
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    const res = await fetch(`${apiBaseUrl}/auth/quick-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.token) {
        user.token = data.data.token;
        if (data.data.user?.id) user.id = data.data.user.id;
      }
    }
  } catch {
    // Offline or standalone mode - local user and token are ready
  }

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

    const userId = `usr_auth_${Date.now()}`;
    const user = {
      id: userId,
      name: displayName,
      role: 'authority',
      title: 'Disaster Response Officer',
      department: credentials.department || 'Disaster Control Desk',
      email: email,
      avatar: avatar || 'OF',
      badge: 'Duty Officer',
      terminalAuthorized: Boolean(credentials.rememberDevice),
      token: generateClientToken({ id: userId, name: displayName, role: 'authority', email }),
      loginAt: new Date().toISOString(),
    };

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerIdOrEmail: rawId || email,
          passcode: credentials.passcode || 'officer123',
          role: 'authority',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.token) {
          user.token = data.data.token;
          if (data.data.user?.id) user.id = data.data.user.id;
        }
      }
    } catch {
      // Standalone mode
    }

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

  const userId = `usr_cit_${Date.now()}`;
  const user = {
    id: userId,
    name: displayName,
    role: 'citizen',
    title: 'Community Resident',
    department: credentials.alertLocation || 'Civic Safety Network',
    email: email,
    phone: phone,
    avatar: avatar || 'PU',
    badge: 'Verified Access',
    alertsOptIn: credentials.alertsOptIn !== false,
    token: generateClientToken({ id: userId, name: displayName, role: 'citizen', email }),
    loginAt: new Date().toISOString(),
  };

  try {
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    const res = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneOrEmail: rawInput || email,
        password: 'citizen123',
        role: 'citizen',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.token) {
        user.token = data.data.token;
        if (data.data.user?.id) user.id = data.data.user.id;
      }
    }
  } catch {
    // Standalone mode
  }

  saveCurrentUser(user);
  return user;
}

export function logoutUser() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('thermoguard_auth_user_v1');
    localStorage.removeItem('thermoguard_fcm_token');
  } catch (err) {
    console.error('Error logging out user:', err);
  }
}
