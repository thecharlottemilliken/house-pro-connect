
import ServiceProRoute from "@/components/auth/ServiceProRoute";
import { Card } from "@/components/ui/card";

const YourProjects = () => {
  return (
    <ServiceProRoute>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
          <p className="text-gray-600 mt-2">
            View and manage your current and past projects.
          </p>
        </div>
        
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Projects</h3>
          <p className="text-gray-500">
            You don't have any active projects at the moment.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Projects you're working on will appear here.
          </p>
        </Card>
      </main>
    </ServiceProRoute>
  );
};

export default YourProjects;
