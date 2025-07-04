import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!localStorage.getItem('authToken'),
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token');
      }
      
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        localStorage.removeItem('authToken');
        throw new Error('Invalid token');
      }
      
      return response.json();
    },
  });

  const logout = () => {
    localStorage.removeItem('authToken');
    refetch();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
