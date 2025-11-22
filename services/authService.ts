
import { User } from '../types';

// Simulated latency for "Cloud" feel
const DELAY_MS = 1200;

const USERS_KEY = 'aether_cloud_users';
const SESSION_KEY = 'aether_session_user';

// Helper to delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const authService = {
  
  // Register a new user
  signup: async (email: string, password: string, name: string): Promise<User> => {
    await delay(DELAY_MS);
    
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email === email)) {
      throw new Error("User already exists in cloud registry.");
    }

    const newUser: User = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      createdAt: Date.now(),
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${name}`
    };

    // Save user record (with fake password storage)
    users.push({ ...newUser, password }); 
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Set session
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  // Login existing user
  login: async (email: string, password: string): Promise<User> => {
    await delay(DELAY_MS);

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    // Strip password before returning
    const { password: _, ...safeUser } = user;
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  // Logout
  logout: async () => {
    await delay(500);
    localStorage.removeItem(SESSION_KEY);
  },

  // Check if already logged in
  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};
