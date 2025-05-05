
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const DashboardNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/dashboard" className="text-xl font-bold text-gray-800">
            Renovation App
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user?.email}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
