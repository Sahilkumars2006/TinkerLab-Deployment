import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import ReservationForm from "@/components/reservations/reservation-form";

interface HeaderProps {
  title: string;
  description: string;
  showSearch?: boolean;
  showAddButton?: boolean;
  onSearch?: (term: string) => void;
}

export default function Header({ 
  title, 
  description, 
  showSearch = true, 
  showAddButton = true,
  onSearch 
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search equipment, reservations..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-80 pl-10"
              />
            </div>
          )}
          
          {/* Quick Action Button */}
          {showAddButton && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Reservation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <ReservationForm onSuccess={() => {}} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}
