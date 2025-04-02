
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <>
      <Helmet>
        <title>{title} | RehabSquared</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="border-b py-4 bg-white">
          <div className="container max-w-7xl mx-auto px-4">
            <Link to="/" className="text-2xl font-bold text-[#F26D21]">
              Rehab Squared
            </Link>
          </div>
        </header>
        <main className="flex-1 flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 px-6 py-12 md:px-12 lg:px-24">
            {children}
          </div>
          <div 
            className="hidden md:block md:w-1/2 bg-cover bg-center h-full" 
            style={{ 
              backgroundImage: "url('public/lovable-uploads/da248e2e-0ad1-4097-b05e-2cd9261ec2ad.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "calc(100vh - 65px)" // Subtract header height
            }}
          >
          </div>
        </main>
      </div>
    </>
  );
};

export default AuthLayout;
