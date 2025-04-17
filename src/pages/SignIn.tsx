
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Facebook } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const SignIn = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, rememberMe: checked });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (validateForm()) {
    setIsLoading(true);
    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        toast({ title: "Error signing in", description: error.message, variant: "destructive" });
      } else if (data?.user?.id) {
        // 🔥 Call the Edge Function to assign the role
        await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/set-claims`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`
          },
          body: JSON.stringify({ user_id: data.user.id })
        });

        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Error signing in", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
};


  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 px-4 py-4 lg:px-8 flex flex-col overflow-y-auto">
        <div className="mb-4 lg:mb-6">
          <h1 className="text-2xl font-bold text-orange-500">Rehab Squared</h1>
        </div>
        
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 lg:space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            
            <div className="space-y-1 lg:space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <div className="grid gap-1 leading-none">
                  <Label htmlFor="rememberMe" className="text-sm font-medium leading-none">
                    Remember me
                  </Label>
                </div>
              </div>
              <a href="#" className="text-sm font-medium text-blue-900 hover:underline">
                Forgot password?
              </a>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "SIGN IN"}
            </Button>
            
            <div className="relative flex items-center py-2 lg:py-3">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-600">Or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate("/dashboard")} // For demo purposes, navigates to dashboard
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              SIGN IN WITH GOOGLE
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate("/dashboard")} // For demo purposes, navigates to dashboard
              disabled={isLoading}
            >
              <Facebook size={24} />
              SIGN IN WITH FACEBOOK
            </Button>
            
            <p className="text-center mt-2 lg:mt-4 text-sm lg:text-base">
              Don't have an account? <a href="#" onClick={() => navigate("/signup")} className="text-blue-900 font-semibold">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
      
      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-100">
        <img 
          src="/lovable-uploads/2069326c-e836-4307-bba2-93ef8b361ae1.png" 
          alt="Modern living room with light gray sofa and wooden coffee table" 
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default SignIn;
