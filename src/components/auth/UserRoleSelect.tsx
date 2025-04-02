
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Home } from "lucide-react";

type UserRole = "resident" | "servicePro";

interface UserRoleSelectProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
}

const UserRoleSelect: React.FC<UserRoleSelectProps> = ({
  selectedRole,
  onRoleSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <Card 
        className={`cursor-pointer border transition-all rounded-xl hover:shadow-md ${
          selectedRole === "resident" 
            ? "border-[#9b87f5] shadow-sm" 
            : "border-gray-200 hover:border-[#9b87f5]/50"
        }`}
        onClick={() => onRoleSelect("resident")}
      >
        <CardHeader className="space-y-1 items-center text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-[#F5F0FF] flex items-center justify-center">
            <Home className="w-8 h-8 text-[#9b87f5]" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 mt-2">Resident</CardTitle>
          <CardDescription className="text-gray-600">For homeowners and buyers</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-gray-500 pb-3">
          <p>Create projects and find qualified professionals</p>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant={selectedRole === "resident" ? "default" : "outline"} 
            className={`w-full h-10 ${selectedRole === "resident" ? "bg-[#9b87f5] hover:bg-[#7E69AB]" : "border-gray-300"}`}
            onClick={() => onRoleSelect("resident")}
          >
            {selectedRole === "resident" ? "Selected" : "Select"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card 
        className={`cursor-pointer border transition-all rounded-xl hover:shadow-md ${
          selectedRole === "servicePro" 
            ? "border-[#1EAEDB] shadow-sm" 
            : "border-gray-200 hover:border-[#1EAEDB]/50"
        }`}
        onClick={() => onRoleSelect("servicePro")}
      >
        <CardHeader className="space-y-1 items-center text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[#1EAEDB]" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 mt-2">Service Pro</CardTitle>
          <CardDescription className="text-gray-600">For subcontractors and service providers</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-gray-500 pb-3">
          <p>Bid on projects and showcase your expertise</p>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant={selectedRole === "servicePro" ? "default" : "outline"} 
            className={`w-full h-10 ${selectedRole === "servicePro" ? "bg-[#1EAEDB] hover:bg-[#1EAEDB]/90" : "border-gray-300"}`}
            onClick={() => onRoleSelect("servicePro")}
          >
            {selectedRole === "servicePro" ? "Selected" : "Select"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserRoleSelect;
