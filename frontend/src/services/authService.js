// MOCKED: Local authentication service simulation structured for seamless integration with real FastAPI backend
const STORAGE_KEY = 'drishti_auth_user';

const DEFAULT_USER = {
  id: 'usr_001',
  name: 'Community Responder',
  email: 'responder@drishti.ai',
  phone: '+91-8630868896',
  role: 'Citizen Scientist',
  district: 'East Khasi Hills',
  bio: 'Active early-warning volunteer in Sohra & Pynursla sector. Monitoring slope displacement.',
  language: 'en',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  stats: {
    postsCount: 14,
    reportsSubmitted: 8,
    alertsFollowed: 12
  }
};

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
    // MOCKED: Simulating async login request & validation
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!emailOrPhone || !password) {
      throw new Error('Please fill in all required credentials.');
    }

    let existing = this.getCurrentUser();
    if (!existing) {
      existing = { ...DEFAULT_USER, email: emailOrPhone.includes('@') ? emailOrPhone : DEFAULT_USER.email };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return existing;
  },

  async signup({ name, email, phone, password }) {
    // MOCKED: Simulating async account creation
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!name || !email || !password) {
      throw new Error('Name, Email, and Password are required.');
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone: phone || '+91-9876543210',
      role: 'Citizen Scientist',
      district: 'East Khasi Hills',
      bio: 'Disaster management field responder in East Khasi Hills district.',
      language: 'en',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      stats: {
        postsCount: 0,
        reportsSubmitted: 0,
        alertsFollowed: 1
      }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  loginAsGuest() {
    const guestUser = {
      id: 'guest_user',
      name: 'Guest Explorer',
      email: 'guest@drishti.ai',
      phone: '+91-0000000000',
      role: 'Guest User',
      district: 'East Khasi Hills',
      bio: 'Exploring DRISHTI-AI Landslide Early Warning platform.',
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
