
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <Card 
        className={`cursor-pointer border-2 transition-all ${
          selectedRole === "resident" 
            ? "border-rehab-blue shadow-md" 
            : "border-border hover:border-rehab-blue/50"
        }`}
        onClick={() => onRoleSelect("resident")}
      >
        <CardHeader className="space-y-1 items-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Home className="w-8 h-8 text-rehab-blue" />
          </div>
          <CardTitle>Resident</CardTitle>
          <CardDescription>For homeowners and buyers</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Create projects and find qualified professionals</p>
        </CardContent>
        <CardFooter>
          <Button 
            variant={selectedRole === "resident" ? "default" : "outline"} 
            className="w-full"
            onClick={() => onRoleSelect("resident")}
          >
            {selectedRole === "resident" ? "Selected" : "Select"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card 
        className={`cursor-pointer border-2 transition-all ${
          selectedRole === "servicePro" 
            ? "border-rehab-teal shadow-md" 
            : "border-border hover:border-rehab-teal/50"
        }`}
        onClick={() => onRoleSelect("servicePro")}
      >
        <CardHeader className="space-y-1 items-center text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-rehab-teal" />
          </div>
          <CardTitle>Service Pro</CardTitle>
          <CardDescription>For subcontractors and service providers</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Bid on projects and showcase your expertise</p>
        </CardContent>
        <CardFooter>
          <Button 
            variant={selectedRole === "servicePro" ? "default" : "outline"} 
            className={`w-full ${selectedRole === "servicePro" ? "bg-rehab-teal hover:bg-rehab-teal/90" : ""}`}
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
