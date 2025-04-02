
import React from "react";
import AuthLayout from "@/layouts/AuthLayout";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp = () => {
  return (
    <AuthLayout title="Sign Up">
      <div className="bg-gradient-to-b from-white to-[#E5DEFF] min-h-screen py-8">
        <SignUpForm />
      </div>
    </AuthLayout>
  );
};

export default SignUp;
