
import ServiceProRoute from "@/components/auth/ServiceProRoute";

const ServiceProMessages = () => {
  return (
    <ServiceProRoute>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">
              Communicate with clients and project managers.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
            <p className="text-gray-500">
              You don't have any messages yet.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Messages from clients and project collaborations will appear here.
            </p>
          </div>
        </main>
      </div>
    </ServiceProRoute>
  );
};

export default ServiceProMessages;
