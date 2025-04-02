import React from "react";
import AuthLayout from "@/layouts/AuthLayout";
import SignUpForm from "@/components/auth/SignUpForm";
const SignUp = () => {
  return <AuthLayout title="Sign Up">
      <div className="min-h-screen flex flex-col justify-center py-12 bg-white sm:px-6 lg:px-8">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <SignUpForm />
        </div>
      </div>
    </AuthLayout>;
};
export default SignUp;