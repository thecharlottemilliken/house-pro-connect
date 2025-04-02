
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
      <div className="min-h-screen flex flex-col">
        <header className="border-b py-4">
          <div className="container max-w-7xl mx-auto px-4 flex justify-center md:justify-between items-center">
            <Link to="/" className="text-2xl font-bold rehab-gradient bg-clip-text text-transparent">
              RehabSquared
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                How it works
              </Link>
              <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <footer className="border-t py-6">
          <div className="container max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <div>&copy; {new Date().getFullYear()} RehabSquared. All rights reserved.</div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/terms" className="hover:text-foreground">Terms</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AuthLayout;
