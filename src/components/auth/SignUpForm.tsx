
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import SignUpStepOne from "./SignUpStepOne";
import SignUpStepTwo from "./SignUpStepTwo";
import * as z from "zod";

type UserRole = "resident" | "servicePro";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a user role",
        variant: "destructive",
      });
      return;
    }

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

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
      {step === 1 ? (
        <SignUpStepOne
          selectedRole={selectedRole}
          onRoleSelect={onRoleSelect}
          onContinue={handleContinue}
        />
      ) : (
        <SignUpStepTwo
          selectedRole={selectedRole}
          onBack={handleBack}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default SignUpForm;
