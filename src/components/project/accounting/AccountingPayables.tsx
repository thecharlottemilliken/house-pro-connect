
import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceItem from "./InvoiceItem";
import ProjectMilestones from "./ProjectMilestones";

interface AccountingPayablesProps {
  specialty: string;
}

const AccountingPayables = ({ specialty }: AccountingPayablesProps) => {
  const invoices = [
    {
      id: "1",
      title: "Renovation Invoice",
      status: "due",
      date: "3/29/2025",
      milestone: "Milestone 2",
      amount: 500.00
    },
    {
      id: "2",
      title: "Tile Upgrade Invoice",
      status: "paid",
      date: "2/20/2025",
      milestone: "Milestone 1",
      amount: 250.00
    }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Invoices from Bob the Builder</h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="text"
                placeholder="Search invoices"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full" 
              />
            </div>
            <Button variant="outline" className="bg-white">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <div className="relative">
              <select className="appearance-none border border-gray-300 rounded py-2 px-4 pr-8 bg-white w-full">
                <option>Recommended</option>
                <option>Date: Newest</option>
                <option>Date: Oldest</option>
                <option>Amount: High to Low</option>
                <option>Amount: Low to High</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {invoices.map(invoice => (
              <InvoiceItem 
                key={invoice.id}
                title={invoice.title}
                status={invoice.status as "due" | "paid"} 
                date={invoice.date}
                milestone={invoice.milestone}
                amount={invoice.amount}
              />
            ))}
          </div>
        </div>
      </div>
      
      <ProjectMilestones />
    </div>
  );
};

export default AccountingPayables;
