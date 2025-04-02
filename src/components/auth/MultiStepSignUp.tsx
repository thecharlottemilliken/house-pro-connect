
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import SignUpStepOne from "./SignUpStepOne";
import SignUpStepTwo from "./SignUpStepTwo";

type UserRole = "resident" | "servicePro";

const MultiStepSignUp = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (values: any) => {
    if (!selectedRole) return;
    
    try {
      setIsSubmitting(true);
      await signup(values.name, values.email, values.password, selectedRole);
      navigate('/dashboard');
    } catch (error) {
      console.error("Signup error:", error);
      // Error toast is already handled in the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    toast({
      title: `${provider} Sign Up`,
      description: `${provider} sign up is not implemented yet.`,
    });
  };

  return (
    <div>
      {step === 1 ? (
        <SignUpStepOne 
          selectedRole={selectedRole} 
          onRoleSelect={handleRoleSelect}
          onContinue={handleContinue}
        />
      ) : (
        <SignUpStepTwo 
          selectedRole={selectedRole as UserRole}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default MultiStepSignUp;
