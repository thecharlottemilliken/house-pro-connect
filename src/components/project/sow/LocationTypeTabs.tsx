
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LocationTypeTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function LocationTypeTabs({ activeTab, onTabChange }: LocationTypeTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-fit border-b bg-transparent p-0 h-auto">
        <TabsTrigger
          value="interior"
          className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Interior
        </TabsTrigger>
        <TabsTrigger
          value="exterior"
          className="rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Exterior
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
