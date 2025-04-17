
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  created_at: string;
  message: string;
  read_at: string | null;
  project_id: string | null;
  resident: {
    id: string;
    name: string;
    email: string;
  };
}

const MessageCenter = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching messages for coach:", user?.id);
      
      // First fetch the messages without the join to get the resident_id
      const { data: messagesData, error: messagesError } = await supabase
        .from('coach_messages')
        .select(`
          id,
          created_at,
          message,
          read_at,
          project_id,
          resident_id
        `)
        .eq('coach_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (messagesError) {
        console.error("Messages error:", messagesError);
        throw messagesError;
      }
      
      console.log("Messages data:", messagesData);
      
      // Then fetch resident details for each message
      if (messagesData && Array.isArray(messagesData) && messagesData.length > 0) {
        const messagesWithResidents = await Promise.all(
          messagesData.map(async (msg) => {
            const { data: residentData, error: residentError } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('id', msg.resident_id)
              .single();
            
            if (residentError) {
              console.error("Error fetching resident:", residentError);
              return {
                ...msg,
                resident: {
                  id: msg.resident_id,
                  name: 'Unknown User',
                  email: 'unknown@example.com'
                }
              };
            }
            
            return {
              ...msg,
              resident: residentData
            };
          })
        );
        
        // Explicitly type the result as Message[]
        const typedMessages: Message[] = messagesWithResidents.map(msg => ({
          id: msg.id,
          created_at: msg.created_at,
          message: msg.message,
          read_at: msg.read_at,
          project_id: msg.project_id,
          resident: {
            id: msg.resident?.id || msg.resident_id,
            name: msg.resident?.name || 'Unknown User',
            email: msg.resident?.email || 'unknown@example.com'
          }
        }));
        
        console.log("Final messages:", typedMessages);
        setMessages(typedMessages);
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Message Center</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search messages..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchQuery ? "No messages match your search" : "No messages yet"}
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredMessages.map((message) => (
                <div key={message.id} className="p-4 border-b hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{message.resident.name}</h3>
                      <p className="text-sm text-gray-500">{message.resident.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-2">{message.message}</p>
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="outline">
                      <Send className="h-3 w-3 mr-1" /> Reply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageCenter;
