
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import UserRoleSelect from "./UserRoleSelect";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, User, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

type UserRole = "resident" | "servicePro";

const SignUpForm = () => {
  const { toast } = useToast();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("resident");
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    },
  });

  const onRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

  const handleContinue = () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "You need to select a user role to continue",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  return (
    <div className="max-w-md w-full mx-auto px-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
        <p className="text-gray-600">Join thousands of homeowners finding quality contractors</p>
      </div>

      {step === 1 ? (
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
      ) : (
        <Card className="border border-gray-200 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setStep(1)} 
                className="h-8 w-8 mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {selectedRole === "resident" ? "Resident Information" : "Service Pro Information"}
              </CardTitle>
            </div>
            <CardDescription className="text-gray-500">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="John Doe" 
                            className="pl-10 h-12 border-gray-300" 
                            {...field} 
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="email" 
                            placeholder="you@example.com" 
                            className="pl-10 h-12 border-gray-300" 
                            {...field} 
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Create a password" 
                            className="pl-10 pr-10 h-12 border-gray-300" 
                            {...field} 
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="Confirm your password" 
                            className="pl-10 pr-10 h-12 border-gray-300" 
                            {...field} 
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5 border-gray-300 data-[state=checked]:bg-[#9b87f5] data-[state=checked]:border-[#9b87f5]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal text-sm text-gray-600">
                          I agree to the <Link to="/terms" className="text-[#9b87f5] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#9b87f5] hover:underline">Privacy Policy</Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-medium py-2.5 h-12 text-base mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-6 pb-6 pt-0">
            <div className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-[#9b87f5] hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SignUpForm;
