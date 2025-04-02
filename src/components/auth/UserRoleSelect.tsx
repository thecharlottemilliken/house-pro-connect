
import React from "react";
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
      <div 
        className={`cursor-pointer border rounded-lg p-6 transition-all ${
          selectedRole === "resident" 
            ? "border-[#9b87f5] shadow-md bg-[#F5F0FF]" 
            : "border-gray-200 hover:border-[#9b87f5]/50 hover:shadow"
        }`}
        onClick={() => onRoleSelect("resident")}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
            <Home className="w-7 h-7 text-[#9b87f5]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">I am a homeowner</h3>
          <p className="text-sm text-gray-500">Looking for renovation services</p>
        </div>
      </div>
      
      <div 
        className={`cursor-pointer border rounded-lg p-6 transition-all ${
          selectedRole === "servicePro" 
            ? "border-[#1EAEDB] shadow-md bg-blue-50" 
            : "border-gray-200 hover:border-[#1EAEDB]/50 hover:shadow"
        }`}
        onClick={() => onRoleSelect("servicePro")}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
            <Building2 className="w-7 h-7 text-[#1EAEDB]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">I am a service pro</h3>
          <p className="text-sm text-gray-500">Offering renovation services</p>
        </div>
      </div>
    </div>
  );
};

export default UserRoleSelect;
