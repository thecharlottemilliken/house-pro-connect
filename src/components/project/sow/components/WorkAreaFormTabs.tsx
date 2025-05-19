
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkAreaFormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function WorkAreaFormTabs({ activeTab, setActiveTab }: WorkAreaFormTabsProps) {
  return (
    <Tabs defaultValue={activeTab} className="w-[400px]">
      <TabsList>
        <TabsTrigger 
          value="interior" 
          className="flex-1"
          onClick={() => setActiveTab("interior")}
        >
          Interior
        </TabsTrigger>
        <TabsTrigger 
          value="exterior" 
          className="flex-1"
          onClick={() => setActiveTab("exterior")}
        >
          Exterior
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
