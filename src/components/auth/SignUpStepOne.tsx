
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
    <>
      <UserRoleSelect selectedRole={selectedRole} onRoleSelect={onRoleSelect} />
      <div className="mt-6">
        <Button 
          onClick={handleContinue} 
          className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-medium py-2.5 h-12 text-base"
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
    </>
  );
};

export default SignUpStepOne;
