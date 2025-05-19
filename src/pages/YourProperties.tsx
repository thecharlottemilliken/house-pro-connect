
import ServiceProRoute from "@/components/auth/ServiceProRoute";
import { Card } from "@/components/ui/card";

const YourProperties = () => {
  return (
    <ServiceProRoute>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Properties</h1>
          <p className="text-gray-600 mt-2">
            View and manage properties you've worked on or own.
          </p>
        </div>
        
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-500">
            You don't have any properties in your portfolio yet.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Properties you're involved with will appear here.
          </p>
        </Card>
      </main>
    </ServiceProRoute>
  );
};

export default YourProperties;
