
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ContentCardProps {
  image: string;
  title: string;
}

const ContentCard = ({ image, title }: ContentCardProps) => {
  return (
    <Card className="overflow-hidden shadow-md border-0 h-full flex flex-col">
      <div className="overflow-hidden h-40">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
        />
      </div>
      <CardContent className="p-5 flex flex-col flex-1">
        <p className="text-base text-gray-800 mb-6 flex-1">{title}</p>
        <Button 
          className="w-full bg-[#174c65] text-white hover:bg-[#174c65]/90 mt-auto"
        >
          CHECK IT OUT
        </Button>
      </CardContent>
    </Card>
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
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      title: "Maximize your renovation budget with these smart tips and cost-saving strategies."
    }
  ];
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Recommended for You
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentItems.map(item => (
          <ContentCard key={item.id} image={item.image} title={item.title} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedContent;
