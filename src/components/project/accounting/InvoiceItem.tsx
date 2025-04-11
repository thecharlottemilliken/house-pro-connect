
import React from "react";
import { Button } from "@/components/ui/button";

interface InvoiceItemProps {
  title: string;
  status: "due" | "paid";
  date: string;
  milestone: string;
  amount: number;
}

const InvoiceItem = ({ 
  title, 
  status, 
  date, 
  milestone, 
  amount 
}: InvoiceItemProps) => {
  return (
    <div className="border border-gray-200 rounded p-4 bg-white">
      <div className="flex flex-col sm:flex-row justify-between mb-2">
        <div>
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-gray-500 text-sm">
            {status === "paid" ? `Paid on ${date}` : `Due on ${date}`} • {milestone}
          </p>
        </div>
        <div className="flex items-center mt-2 sm:mt-0">
          <span className="text-xl font-bold mr-4">${amount.toFixed(2)}</span>
          {status === "due" ? (
            <Button className="bg-[#174c65] hover:bg-[#0d3b4f]">
              PAY INVOICE
            </Button>
          ) : (
            <Button variant="outline">
              VIEW RECEIPT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceItem;
