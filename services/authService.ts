import { supabase } from './supabaseClient';
import { User } from '../types';

export const authService = {

  signup: async (email: string, password: string, name: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.name || name,
      createdAt: new Date(data.user.created_at).getTime(),
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${name}`
    };
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.name || email.split('@')[0],
      createdAt: new Date(data.user.created_at).getTime(),
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${data.user.user_metadata.name || email}`
    };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem('sb-0ec90b57d6e95fcbda19832f-auth-token');
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      const user = session.user;
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        createdAt: new Date(user.created_at).getTime(),
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.user_metadata?.name || user.email}`
      };
    } catch {
      return null;
    }
  }
};
