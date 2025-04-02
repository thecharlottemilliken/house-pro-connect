
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Clock, Home, PaintBucket, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="border-b py-4">
        <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
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
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-rehab-blue hover:text-rehab-blue/90">
                  Sign in
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </nav>
          <div className="md:hidden">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button>Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Renovate Your Home <span className="rehab-gradient bg-clip-text text-transparent">Without The Hassle</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Connect directly with subcontractors, get competitive bids, and manage your renovation projects with transparency and control.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn How It Works
              </Button>
            </Link>
          </div>
          <div className="bg-muted p-4 rounded-lg mt-8 text-sm text-muted-foreground">
            Trusted by homeowners and professionals across the country
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How RehabSquared Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-rehab-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Project</h3>
              <p className="text-muted-foreground">
                Define your renovation needs, budget, and timeline. Upload photos and detailed descriptions.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-rehab-teal" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive Bids</h3>
              <p className="text-muted-foreground">
                Qualified subcontractors review your project and submit competitive bids directly to you.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <PaintBucket className="h-8 w-8 text-rehab-slate" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Your Renovation</h3>
              <p className="text-muted-foreground">
                Select the best professionals, track progress, and manage payments all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose RehabSquared</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border rounded-lg p-6">
              <Coins className="h-10 w-10 text-rehab-blue mb-4" />
              <h3 className="text-xl font-semibold mb-2">Save 10-25% on Costs</h3>
              <p className="text-muted-foreground">
                Skip the general contractor markup while still getting quality work from vetted professionals.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <Clock className="h-10 w-10 text-rehab-teal mb-4" />
              <h3 className="text-xl font-semibold mb-2">Faster Project Completion</h3>
              <p className="text-muted-foreground">
                Direct communication with subcontractors eliminates delays and ensures efficient project management.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <PaintBucket className="h-10 w-10 text-rehab-slate mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Transparency</h3>
              <p className="text-muted-foreground">
                See all bids, reviews, and communication in one centralized platform with no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-rehab-blue to-rehab-teal text-white">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Home?</h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of homeowners who have simplified their renovation process with RehabSquared.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="bg-white text-rehab-blue hover:bg-white/90">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">RehabSquared</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Homeowners</h3>
              <ul className="space-y-2">
                <li><Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How It Works</Link></li>
                <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-2">
                <li><Link to="/pro" className="text-sm text-muted-foreground hover:text-foreground">Join as a Pro</Link></li>
                <li><Link to="/success-stories" className="text-sm text-muted-foreground hover:text-foreground">Success Stories</Link></li>
                <li><Link to="/resources" className="text-sm text-muted-foreground hover:text-foreground">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</Link></li>
                <li><Link to="/help" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
                <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RehabSquared. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
