
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-500">Rehab Squared</h1>
        <div className="space-x-4">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:text-blue-700"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="text-blue-900 hover:text-blue-700"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </Button>
              <Button 
                className="bg-blue-900 hover:bg-blue-800 text-white"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-24 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            Transform Your Home with Expert Guidance
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Connect with professional designers and contractors to bring your renovation dreams to life. 
            From simple updates to complete renovations, Rehab Squared helps you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {user ? (
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-blue-900 text-blue-900 hover:bg-blue-50"
                  onClick={() => navigate("/signin")}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="lg:w-1/2">
          <img 
            src="/lovable-uploads/2069326c-e836-4307-bba2-93ef8b361ae1.png" 
            alt="Modern living room design" 
            className="rounded-lg shadow-xl w-full h-auto object-cover"
          />
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose Rehab Squared</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">Expert Designers</h3>
              <p className="text-gray-700">Connect with professional designers who understand your vision and style preferences.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">Trusted Contractors</h3>
              <p className="text-gray-700">Work with vetted contractors who deliver quality results on time and within budget.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-blue-900">Streamlined Process</h3>
              <p className="text-gray-700">From planning to completion, we make your renovation journey smooth and stress-free.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Transform Your Space?</h2>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Join thousands of homeowners who have successfully renovated their homes with Rehab Squared.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {user ? (
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-blue-900 text-blue-900 hover:bg-blue-50"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </Button>
            </>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Rehab Squared</h3>
              <p className="max-w-xs text-blue-100">
                Transforming homes and spaces with expert guidance and professional support.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-blue-200">
                  <li><a href="#" className="hover:text-white">About Us</a></li>
                  <li><a href="#" className="hover:text-white">How It Works</a></li>
                  <li><a href="#" className="hover:text-white">Our Team</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-blue-200">
                  <li><a href="#" className="hover:text-white">FAQs</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-blue-200">
                  <li><a href="#" className="hover:text-white">Instagram</a></li>
                  <li><a href="#" className="hover:text-white">Facebook</a></li>
                  <li><a href="#" className="hover:text-white">Twitter</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-300">
            <p>© {new Date().getFullYear()} Rehab Squared. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
