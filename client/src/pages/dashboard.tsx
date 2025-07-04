import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import EquipmentStatus from "@/components/dashboard/equipment-status";
import PendingApprovals from "@/components/dashboard/pending-approvals";
import SafetyAlerts from "@/components/dashboard/safety-alerts";
import PopularEquipment from "@/components/dashboard/popular-equipment";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header 
          title="Dashboard Overview"
          description="Welcome back! Here's what's happening in the lab today."
        />
        
        <div className="p-6">
          {/* Stats Cards */}
          <StatsCards />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>
            
            {/* Sidebar Content */}
            <div className="space-y-6">
              <EquipmentStatus />
              <PendingApprovals />
              <SafetyAlerts />
            </div>
          </div>
          
          {/* Popular Equipment */}
          <div className="mt-8">
            <PopularEquipment />
          </div>
        </div>
      </main>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
