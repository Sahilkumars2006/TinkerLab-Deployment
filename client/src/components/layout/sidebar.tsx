import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, BarChart3, Bolt, Calendar, Package, Users, Bell, Settings, LogOut } from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: BarChart3, roles: ["student", "faculty", "tech_secretary", "admin"] },
  { name: "Equipment", href: "/equipment", icon: Bolt, roles: ["student", "faculty", "tech_secretary", "admin"] },
  { name: "Reservations", href: "/reservations", icon: Calendar, roles: ["student", "faculty", "tech_secretary", "admin"] },
  { name: "Inventory", href: "/inventory", icon: Package, roles: ["faculty", "tech_secretary", "admin"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["faculty", "tech_secretary", "admin"] },
  { name: "Users", href: "/users", icon: Users, roles: ["faculty", "admin"] },
  { name: "Notifications", href: "/notifications", icon: Bell, roles: ["student", "faculty", "tech_secretary", "admin"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["student", "faculty", "tech_secretary", "admin"] },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [notificationCount] = useState(3); // This would come from real notification state

  const userRole = user?.role || "student";
  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">KIT Tinker Lab</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium cursor-pointer ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.name === "Notifications" && notificationCount > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white">
                    {notificationCount}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>
              {user?.firstName?.charAt(0) || "U"}{user?.lastName?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize truncate">
              {userRole.replace("_", " ")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
