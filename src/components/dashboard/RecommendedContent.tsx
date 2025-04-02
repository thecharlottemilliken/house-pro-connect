
import { Button } from "@/components/ui/button";

interface ContentCardProps {
  image: string;
  title: string;
}

const ContentCard = ({ image, title }: ContentCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <img 
        src={image} 
        alt={title}
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <p className="text-gray-800 mb-6">{title}</p>
        <Button 
          variant="outline" 
          className="w-full bg-[#174c65] text-white hover:bg-[#1a5978] border-[#174c65]"
        >
          CHECK IT OUT
        </Button>
      </div>
    </div>
  );
};

const RecommendedContent = () => {
  const contentItems = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      title: "Design your dream home with style and functionality, creating a space that's uniquely yours."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      title: "Select colors that blend style and personality, creating a space that truly reflects you."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2301&q=80",
      title: "Transform your home into a stylish and practical space that reflects your vision."
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2558&q=80",
      title: "Elevate your space with chic interior design that highlights your unique style."
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contentItems.map((item) => (
          <ContentCard 
            key={item.id}
            image={item.image}
            title={item.title}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedContent;
