
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  route: string;
}

const ProfileCompletionCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 'basic-info', label: 'Complete basic information', completed: false, route: '/service-pro-profile?section=basic' },
    { id: 'services', label: 'Add services offered', completed: false, route: '/service-pro-profile?section=services' },
    { id: 'licenses', label: 'Add licenses/certifications', completed: false, route: '/service-pro-profile?section=licenses' },
    { id: 'insurance', label: 'Add insurance information', completed: false, route: '/service-pro-profile?section=insurance' },
    { id: 'portfolio', label: 'Add portfolio projects', completed: false, route: '/service-pro-profile?section=portfolio' },
  ]);

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch service pro profile
      const { data: profileData, error: profileError } = await supabase
        .from('service_pro_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Fetch licenses count
      const { count: licensesCount, error: licensesError } = await supabase
        .from('service_pro_licenses')
        .select('*', { count: 'exact', head: true })
        .eq('pro_id', user.id);
      
      if (licensesError) throw licensesError;
      
      // Fetch insurance count
      const { count: insuranceCount, error: insuranceError } = await supabase
        .from('service_pro_insurance')
        .select('*', { count: 'exact', head: true })
        .eq('pro_id', user.id);
      
      if (insuranceError) throw insuranceError;
      
      // Fetch portfolio count
      const { count: portfolioCount, error: portfolioError } = await supabase
        .from('service_pro_portfolio')
        .select('*', { count: 'exact', head: true })
        .eq('pro_id', user.id);
      
      if (portfolioError) throw portfolioError;

      setProfileData(profileData);
      
      // Update checklist based on profile completeness
      setChecklistItems(prev => prev.map(item => {
        if (item.id === 'basic-info') {
          return { ...item, completed: !!(profileData?.company_name && profileData?.location_city) };
        }
        if (item.id === 'services') {
          return { ...item, completed: !!(profileData?.services_offered && profileData?.services_offered.length > 0) };
        }
        if (item.id === 'licenses') {
          return { ...item, completed: licensesCount > 0 };
        }
        if (item.id === 'insurance') {
          return { ...item, completed: insuranceCount > 0 };
        }
        if (item.id === 'portfolio') {
          return { ...item, completed: portfolioCount > 0 };
        }
        return item;
      }));
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const completionPercentage = Math.round(
    (checklistItems.filter(item => item.completed).length / checklistItems.length) * 100
  );

  const handleItemClick = (route: string) => {
    navigate(route);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
        <div className="h-2 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 rounded-full mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (completionPercentage === 100) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900">Profile Complete!</h3>
        <p className="text-gray-500 mt-1">Your service pro profile is complete and ready to go.</p>
        <div className="mt-4">
          <Button onClick={() => navigate('/service-pro-profile')}>
            View My Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900">Complete Your Profile</h3>
      <p className="text-gray-500 mt-1">Complete these steps to start receiving job opportunities.</p>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{completionPercentage}% Complete</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
      
      <ul className="mt-6 space-y-3">
        {checklistItems.map((item) => (
          <li 
            key={item.id}
            onClick={() => handleItemClick(item.route)}
            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg group"
          >
            {item.completed ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 group-hover:text-orange-500" />
            )}
            <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
              {item.label}
            </span>
            {!item.completed && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-orange-600 hover:text-orange-800 hover:bg-orange-100"
              >
                Complete
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileCompletionCard;
