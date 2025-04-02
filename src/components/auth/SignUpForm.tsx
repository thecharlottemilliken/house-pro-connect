
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, LogIn, Facebook } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  zipCode: z.string().min(5, "Enter a valid ZIP code"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  })
});

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      zipCode: "",
      email: "",
      password: "",
      acceptTerms: false
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      // We'll assume all users are "resident" type for this simplified form
      await signup(values.name, values.email, values.password, "resident");
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
    <div className="bg-white py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your full name" 
                    className="h-12 border-gray-300 rounded-md" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Your Zip Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="12345" 
                    className="h-12 border-gray-300 rounded-md" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-gray-500 mt-1">
                  Do you have multiple homes? Just input the zip code for your primary residence.
                </p>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">E-Mail</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
                      className="h-12 border-gray-300 rounded-md" 
                      {...field} 
                    />
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
                <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="password" 
                      placeholder="Create a secure password" 
                      className="h-12 border-gray-300 rounded-md" 
                      {...field} 
                    />
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1 data-[state=checked]:bg-[#15577E] data-[state=checked]:border-[#15577E]"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal text-sm text-gray-600">
                    Agree to Terms and Conditions
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-[#15577E] hover:bg-[#0D425F] text-white font-medium py-3 h-12 text-base rounded-md"
            disabled={isSubmitting}
          >
            NEXT
          </Button>
          
          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <Button 
            type="button"
            variant="outline" 
            className="w-full border-gray-300 text-gray-700 font-medium h-12 flex items-center justify-center gap-2 rounded-md"
            onClick={() => handleSocialSignup("Google")}
          >
            <LogIn className="h-5 w-5" />
            SIGN UP WITH GOOGLE
          </Button>
          
          <Button 
            type="button"
            variant="outline" 
            className="w-full border-gray-300 text-gray-700 font-medium h-12 flex items-center justify-center gap-2 rounded-md"
            onClick={() => handleSocialSignup("Facebook")}
          >
            <Facebook className="h-5 w-5" />
            SIGN UP WITH FACEBOOK
          </Button>
        </form>
      </Form>
      
      <div className="text-sm text-center mt-6 text-gray-800">
        Already have an account?{" "}
        <Link to="/login" className="text-[#15577E] hover:underline font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignUpForm;
