
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 sticky top-0 z-50">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <span className="self-center text-2xl font-bold text-orange-500 cursor-pointer" onClick={() => navigate('/dashboard')}>
            Rehab Squared
          </span>
        </div>
        
        <div className="flex items-center lg:order-2">
          {user ? (
            <div className="relative">
              <Button
                onClick={toggleMenu}
                variant="ghost"
                className="flex items-center gap-2 py-2.5 px-4 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">{profile?.name || user.email}</span>
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                  >
                    Profile
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => navigate('/signin')}
              className="py-2.5 px-4 ml-2 text-sm bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              Sign In
            </Button>
          )}
          
          <button 
            type="button" 
            className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none"
            onClick={toggleMenu}
          >
            <span className="sr-only">Open menu</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        <div className={`${isMenuOpen ? 'block' : 'hidden'} justify-between items-center w-full lg:flex lg:w-auto lg:order-1`}>
          <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            <li>
              <a 
                href="#" 
                onClick={() => navigate('/dashboard')}
                className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-blue-900 lg:p-0"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={() => navigate('/create-project')}
                className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-blue-900 lg:p-0"
              >
                Create Project
              </a>
            </li>
            {profile?.role === 'service_pro' && (
              <li>
                <a 
                  href="#" 
                  onClick={() => navigate('/projects')}
                  className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-blue-900 lg:p-0"
                >
                  Find Projects
                </a>
              </li>
            )}
            <li>
              <a 
                href="#" 
                className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-blue-900 lg:p-0"
              >
                My Projects
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
