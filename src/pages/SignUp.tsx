
import React from "react";
import AuthLayout from "@/layouts/AuthLayout";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp = () => {
  return (
    <AuthLayout title="Sign Up">
      <div className="min-h-screen flex flex-col justify-center py-12 bg-white">
        <SignUpForm />
      </div>
    </AuthLayout>
  );
};

export default SignUp;
