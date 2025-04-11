
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AccountingPayables from "./AccountingPayables";

interface AccountingTabsProps {
  activeSpecialty: string;
}

const AccountingTabs = ({ activeSpecialty }: AccountingTabsProps) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="payables" className="w-full">
        <TabsList className="border-b border-gray-200 w-full flex h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="payables"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#174c65] data-[state=active]:bg-transparent py-2 px-4 text-base"
          >
            Payables
          </TabsTrigger>
          <TabsTrigger 
            value="receivables"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#174c65] data-[state=active]:bg-transparent py-2 px-4 text-base"
          >
            Receivables
          </TabsTrigger>
          <TabsTrigger 
            value="statements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#174c65] data-[state=active]:bg-transparent py-2 px-4 text-base"
          >
            Statements
          </TabsTrigger>
        </TabsList>
        <TabsContent value="payables" className="mt-6">
          <AccountingPayables specialty={activeSpecialty} />
        </TabsContent>
        <TabsContent value="receivables" className="mt-6">
          <div className="text-gray-500">No receivables found.</div>
        </TabsContent>
        <TabsContent value="statements" className="mt-6">
          <div className="text-gray-500">No statements found.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountingTabs;
