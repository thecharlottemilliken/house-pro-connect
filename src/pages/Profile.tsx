
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useProfileRole } from '@/profile/ProfileRole';
import LoadingState from '@/components/coach/LoadingState';
import DeleteAccountDialog from '@/components/account/DeleteAccountDialog';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const { role, displayRole, isLoading: isRoleLoading } = useProfileRole();

  // Redirect service pro users to the service pro profile page
  if (role === 'service_pro' || role === 'service-pro') {
    return <Navigate to="/service-pro-profile" replace />;
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const { error } = await signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast({
          title: "Sign out failed",
          description: "An error occurred while signing out",
          variant: "destructive",
        });
        setIsSigningOut(false);
      }
    } catch (error) {
      console.error("Error in handleSignOut:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
      setIsSigningOut(false);
    }
  };

  if (isRoleLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <main className="flex-1 px-4 sm:px-8 md:px-16 py-6 sm:py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            <LoadingState />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <main className="flex-1 px-4 sm:px-8 md:px-16 py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <User className="h-8 w-8 sm:h-10 sm:w-10 mr-3 text-gray-700" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Profile</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">NAME</h3>
                <p className="text-lg">{profile?.name || "Not provided"}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">EMAIL</h3>
                <p className="text-lg">{user?.email || "Not provided"}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">ROLE</h3>
                <p className="text-lg capitalize">{displayRole}</p>
                {profile?.role === 'coach' && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm text-blue-600"
                    onClick={() => navigate('/coach-dashboard')}
                  >
                    Go to Coach Dashboard
                  </Button>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">ACCOUNT CREATED</h3>
                <p className="text-lg">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) 
                    : "Unknown"}
                </p>
              </div>
            </CardContent>
            
            <Separator />
            
            <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="w-full sm:w-auto order-2 sm:order-1">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto"
                >
                  Back to Dashboard
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 ml-auto w-full sm:w-auto order-1 sm:order-2">
                <Button 
                  variant="destructive"
                  onClick={() => setIsDeleteAccountDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full sm:w-auto"
                >
                  {isSigningOut ? (
                    <>
                      <span className="mr-2">Signing Out</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <DeleteAccountDialog 
        open={isDeleteAccountDialogOpen}
        onOpenChange={setIsDeleteAccountDialogOpen}
      />
    </div>
  );
};

export default Profile;
