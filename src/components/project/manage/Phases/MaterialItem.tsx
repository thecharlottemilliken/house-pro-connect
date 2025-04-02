
interface MaterialItemProps {
  title: string;
  id: string;
  status: "Ordered" | "Delivered" | "Pending";
  delivery: string;
}

const MaterialItem = ({ title, id, status, delivery }: MaterialItemProps) => {
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium">{title}</div>
        <div className="px-2 py-1 bg-gray-800 text-white text-xs rounded">
          {status}
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-500 mb-1">
        <span className="font-medium mr-1">ID:</span> {id}
      </div>
      <div className="text-xs text-gray-500">
        {delivery}
      </div>
    </div>
  );
};

export default MaterialItem;
