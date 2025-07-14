import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Bolt, Calendar, BarChart3, Users, Shield } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    // For demo purposes, we'll use a simple login form
    const email = prompt("Enter your email:");
    const password = prompt("Enter your password:");
    
    if (email && password) {
      console.log('Attempting login with:', { email, password: '***' });
      
      fetch('/api/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.json();
      })
      .then(data => {
        console.log('Response data:', data);
        if (data.token) {
          // Store the token
          localStorage.setItem('authToken', data.token);
          console.log('Token stored, redirecting...');
          // Redirect to dashboard
          window.location.href = '/';
        } else {
          console.error('Login failed - no token in response:', data);
          alert('Login failed: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        alert('Login failed. Please try again. Check console for details.');
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            KIT Tinker Lab Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Streamline equipment reservations, track inventory, and manage lab operations 
            with our comprehensive digital solution.
          </p>
          <Button 
            size="lg" 
            onClick={handleSignIn}
            className="text-lg px-8 py-3"
          >
            Sign In to Continue
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Bolt className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Equipment Catalog</CardTitle>
              <CardDescription>
                Browse and manage all lab equipment with detailed specifications and availability status.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Smart Reservations</CardTitle>
              <CardDescription>
                Easy booking system with multi-level approval workflows and automated notifications.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Real-time insights into equipment utilization, usage patterns, and lab efficiency.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Role-based access control for students, faculty, and administrators.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Safety Training</CardTitle>
              <CardDescription>
                Mandatory training modules and certification tracking for equipment usage.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FlaskConical className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Inventory Tracking</CardTitle>
              <CardDescription>
                Real-time tracking of check-ins, check-outs, and equipment maintenance.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Lab Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24</div>
              <div className="text-gray-600">Equipment Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Reservations/Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p>© 2025 KIT Engineering College. All rights reserved.</p>
          <p className="mt-2">Tinker Lab Management System - Making innovation accessible.</p>
        </div>
      </div>
    </div>
  );
}
