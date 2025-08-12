import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  name: string;
  profilePicUrl: string;
}

export const useUser = (): User | null => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user cookie:', error);
      }
    }
  }, []);

  return user;
};