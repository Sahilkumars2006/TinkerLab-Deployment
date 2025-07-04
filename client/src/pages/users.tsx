import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, UserCheck, Shield } from "lucide-react";

export default function UsersPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user has permission to view this page
  useEffect(() => {
    if (user && user.role === 'student') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const sampleUsers = [
    {
      id: "1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@kit.edu",
      role: "student",
      isActive: true,
      profileImageUrl: null,
      reservationsCount: 15,
      lastActivity: "2 hours ago"
    },
    {
      id: "2",
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@kit.edu",
      role: "faculty",
      isActive: true,
      profileImageUrl: null,
      reservationsCount: 3,
      lastActivity: "1 day ago"
    },
    {
      id: "3",
      firstName: "Mike",
      lastName: "Wilson",
      email: "mike.wilson@kit.edu",
      role: "tech_secretary",
      isActive: true,
      profileImageUrl: null,
      reservationsCount: 8,
      lastActivity: "30 minutes ago"
    },
  ];

  const getRoleBadge = (role: string) => {
    const variants = {
      student: "bg-blue-100 text-blue-800",
      faculty: "bg-purple-100 text-purple-800",
      tech_secretary: "bg-green-100 text-green-800",
      admin: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={variants[role as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {role.replace("_", " ").charAt(0).toUpperCase() + role.replace("_", " ").slice(1)}
      </Badge>
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role === 'student') {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <Header 
            title="Access Denied"
            description="You don't have permission to view this page."
          />
          
          <div className="p-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Access Restricted
                </h3>
                <p className="text-gray-600">
                  User management is only available to faculty and administrators.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header 
          title="User Management"
          description="Manage user accounts, roles, and permissions."
        />
        
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">156</p>
                    <p className="text-sm text-green-600 mt-1">
                      <UserPlus className="w-4 h-4 inline mr-1" />
                      +8 this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-3xl font-bold text-gray-900">142</p>
                    <p className="text-sm text-blue-600 mt-1">
                      <UserCheck className="w-4 h-4 inline mr-1" />
                      91% active rate
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Faculty</p>
                    <p className="text-3xl font-bold text-gray-900">8</p>
                    <p className="text-sm text-purple-600 mt-1">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Supervisors
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-3xl font-bold text-gray-900">6</p>
                    <p className="text-sm text-red-600 mt-1">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Full access
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleUsers.map((userData) => (
                  <div key={userData.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={userData.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {userData.firstName} {userData.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {getRoleBadge(userData.role)}
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {userData.reservationsCount} reservations
                        </p>
                        <p className="text-xs text-gray-600">
                          Last active: {userData.lastActivity}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${userData.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="ml-2 text-sm text-gray-600">
                          {userData.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
