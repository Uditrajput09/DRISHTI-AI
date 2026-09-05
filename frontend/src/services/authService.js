// MOCKED: Local authentication service simulation structured for seamless integration with real FastAPI backend
const STORAGE_KEY = 'drishti_auth_user';
const REGISTERED_USERS_KEY = 'drishti_registered_users';

export const PRESET_USERS = {
  responder: {
    id: 'usr_001',
    name: 'Community Responder',
    email: 'responder@drishti.ai',
    phone: '+91-8630868896',
    password: 'drishti2026',
    role: 'Citizen Scientist',
    district: 'East Khasi Hills',
    bio: 'Active early-warning volunteer in Sohra & Pynursla sector. Monitoring slope displacement.',
    language: 'en',
    avatar: '/images/avatars/responder-avatar.jpg',
    stats: {
      postsCount: 14,
      reportsSubmitted: 8,
      alertsFollowed: 12
    }
  },
  officer: {
    id: 'usr_002',
    name: 'SDMA Operations Officer',
    email: 'sdma.officer@drishti.gov.in',
    phone: '+91-9436100221',
    password: 'meghalaya2026',
    role: 'Official Admin',
    district: 'East Khasi Hills',
    bio: 'Senior Disaster Operations Coordinator, Meghalaya State Disaster Management Authority (SDMA).',
    language: 'en',
    avatar: '/images/avatars/officer-avatar.jpg',
    stats: {
      postsCount: 28,
      reportsSubmitted: 42,
      alertsFollowed: 35
    }
  },
  sdrf: {
    id: 'usr_003',
    name: 'SDRF Quick Response Lead',
    email: 'sdrf.responder@meghalaya.gov.in',
    phone: '+91-9862001144',
    password: 'sdrf2026',
    role: 'Field Responder',
    district: 'East Khasi Hills',
    bio: 'State Disaster Response Force search & rescue coordination squad in East Khasi Hills.',
    language: 'en',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    stats: {
      postsCount: 9,
      reportsSubmitted: 15,
      alertsFollowed: 18
    }
  }
};

const DEFAULT_USER = PRESET_USERS.responder;

export const authService = {
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Error reading auth user from localStorage:', err);
    }
    return null;
  },

  async login(emailOrPhone, password) {
    // Simulating async login request & validation
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!emailOrPhone || !password) {
      throw new Error('Please fill in all required credentials.');
    }

    const cleanInput = emailOrPhone.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check matching preset accounts
    const matchedPreset = Object.values(PRESET_USERS).find(
      (u) => u.email.toLowerCase() === cleanInput || u.phone.toLowerCase() === cleanInput
    );

    if (matchedPreset) {
      // Check password with master demo bypass 'drishti2026'
      if (cleanPassword !== matchedPreset.password && cleanPassword !== 'drishti2026') {
        throw new Error(`Invalid password. Demo password for ${matchedPreset.email} is "${matchedPreset.password}".`);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedPreset));
      return matchedPreset;
    }

    // 2. Check registered accounts in localStorage
    try {
      const registered = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
      const foundReg = registered.find(
        (u) => u.email.toLowerCase() === cleanInput || u.phone.toLowerCase() === cleanInput
      );
      if (foundReg) {
        if (cleanPassword !== foundReg.password && cleanPassword !== 'drishti2026') {
          throw new Error('Invalid password. Please check your credentials.');
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(foundReg));
        return foundReg;
      }
    } catch (err) {
      console.warn('Error reading registered users:', err);
    }

    // 3. Dynamic demo login for any new custom email/phone
    if (cleanPassword.length < 4) {
      throw new Error('Password must be at least 4 characters.');
    }

    const isGov = cleanInput.includes('gov') || cleanInput.includes('sdma') || cleanInput.includes('official');
    const isSdrf = cleanInput.includes('sdrf') || cleanInput.includes('rescue');
    const role = isGov ? 'Official Admin' : (isSdrf ? 'Field Responder' : 'Citizen Scientist');
    const derivedName = cleanInput.includes('@')
      ? cleanInput.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : 'Field Officer';

    const dynamicUser = {
      id: `usr_${Date.now()}`,
      name: derivedName || 'Field Officer',
      email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@drishti.ai`,
      phone: cleanInput.includes('@') ? '+91-9876543210' : cleanInput,
      role,
      district: 'East Khasi Hills',
      bio: `Registered ${role} in East Khasi Hills district landslide monitoring network.`,
      language: 'en',
      avatar: isGov ? '/images/avatars/officer-avatar.jpg' : '/images/avatars/responder-avatar.jpg',
      stats: {
        postsCount: 0,
        reportsSubmitted: 0,
        alertsFollowed: 1
      }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicUser));
    return dynamicUser;
  },

  async signup({ name, email, phone, password, role }) {
    // Simulating async account creation
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!name || !email || !password) {
      throw new Error('Name, Email, and Password are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if preset or already registered
    const existsInPresets = Object.values(PRESET_USERS).some((u) => u.email.toLowerCase() === cleanEmail);
    if (existsInPresets) {
      throw new Error('An official preset account with this email already exists. Please login instead.');
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '+91-9876543210',
      password: password.trim(),
      role: role || 'Citizen Scientist',
      district: 'East Khasi Hills',
      bio: `Active early-warning responder in East Khasi Hills (${role || 'Citizen Scientist'}).`,
      language: 'en',
      avatar: role === 'Official Admin' ? '/images/avatars/officer-avatar.jpg' : '/images/avatars/responder-avatar.jpg',
      stats: {
        postsCount: 0,
        reportsSubmitted: 0,
        alertsFollowed: 1
      }
    };

    // Save in registered users list
    try {
      const registered = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
      registered.push(newUser);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));
    } catch (e) {
      console.warn('Could not save to registered users:', e);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  loginAsGuest(provider = 'guest') {
    const isGoogle = provider === 'google';
    const isPhone = provider === 'phone';
    const guestUser = {
      id: `guest_${Date.now()}`,
      name: isGoogle ? 'Google Explorer' : (isPhone ? 'SMS Verified Citizen' : 'Guest Explorer'),
      email: isGoogle ? 'guest.google@gmail.com' : 'citizen@drishti.ai',
      phone: isPhone ? '+91-9876543210' : '+91-0000000000',
      role: 'Citizen Scientist',
      district: 'East Khasi Hills',
      bio: 'Exploring DRISHTI-AI Landslide Early Warning platform in East Khasi Hills.',
      language: 'en',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      stats: {
        postsCount: 0,
        reportsSubmitted: 0,
        alertsFollowed: 3
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    return guestUser;
  },

  updateProfile(data) {
    const current = this.getCurrentUser() || DEFAULT_USER;
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('drishti_current_user');
    localStorage.removeItem('drishti_social_posts');
  }
};

