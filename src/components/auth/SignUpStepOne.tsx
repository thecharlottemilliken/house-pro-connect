
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UserRoleSelect from "./UserRoleSelect";
import { useToast } from "@/components/ui/use-toast";

type UserRole = "resident" | "servicePro";

interface SignUpStepOneProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  onContinue: () => void;
}

const SignUpStepOne: React.FC<SignUpStepOneProps> = ({
  selectedRole,
  onRoleSelect,
  onContinue,
}) => {
  const { toast } = useToast();

  const handleContinue = () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "You need to select a user role to continue",
        variant: "destructive",
      });
      return;
    }
    onContinue();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">I want to join as...</h2>
        <p className="text-sm text-gray-500">Select your account type to get started</p>
      </div>
      
      <UserRoleSelect selectedRole={selectedRole} onRoleSelect={onRoleSelect} />
      
      <div className="mt-8">
        <Button 
          onClick={handleContinue} 
          className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-medium py-3 h-12 text-base rounded-lg"
        >
          Continue
        </Button>
        <div className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-[#9b87f5] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpStepOne;
