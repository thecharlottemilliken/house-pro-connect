
import React from 'react';
import { Navigate } from 'react-router-dom';

// This component redirects to the CreateProject page
const NewProject = () => {
  return <Navigate to="/create-project" replace />;
};

export default NewProject;
