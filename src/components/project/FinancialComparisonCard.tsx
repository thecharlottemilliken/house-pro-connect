import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
interface FinancialComparisonCardProps {
  projectId: string;
  className?: string;
}
interface WorkBlockFinance {
  id: string;
  name: string;
  estimated: number;
  invoiced: number;
}
const FinancialComparisonCard = ({
  projectId,
  className
}: FinancialComparisonCardProps) => {
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "quarter" | "year">("month");

  // Mock financial data - in real app, fetch from API
  const mockFinancialData: WorkBlockFinance[] = [{
    id: "wb1",
    name: "WO #1",
    estimated: 1700,
    invoiced: 2300
  }, {
    id: "wb2",
    name: "WO #2",
    estimated: 2000,
    invoiced: 800
  }, {
    id: "wb3",
    name: "WO #3",
    estimated: 4500,
    invoiced: 5500
  }, {
    id: "wb4",
    name: "WO #4",
    estimated: 10000,
    invoiced: 2000
  }, {
    id: "wb5",
    name: "WO #5",
    estimated: 3000,
    invoiced: 7000
  }];

  // Calculate totals
  const totalInvoiced = mockFinancialData.reduce((sum, item) => sum + item.invoiced, 0);
  const totalEstimated = mockFinancialData.reduce((sum, item) => sum + item.estimated, 0);
  const totalWorkOrders = mockFinancialData.length;
  const totalAmount = totalInvoiced; // Using invoiced as the displayed total

  // Time filter options mapping
  const timeFilterLabels = {
    week: "This Week",
    month: "This Month",
    quarter: "This Quarter",
    year: "This Year"
  };
  return <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-white flex flex-row justify-between items-center border-b px-[8px] py-[8px]">
        <h3 className="text-lg font-semibold">Estimated vs Invoiced</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white text-sm font-medium">
              {timeFilterLabels[timeFilter]} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTimeFilter("week")}>This Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter("month")}>This Month</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter("quarter")}>This Quarter</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter("year")}>This Year</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4">
        {/* Cost Summary */}
        <div className="mb-4">
          <div className="text-3xl font-light">
            {formatCurrency(totalAmount)}
          </div>
          <div className="text-sm text-gray-600">
            {totalWorkOrders} Work Orders
          </div>
        </div>
        
        {/* Chart - Modified to take up full space */}
        <div className="h-64 w-full">
          <ChartContainer className="w-full h-full" config={{
          estimated: {
            color: "#2E8B57"
          },
          invoiced: {
            color: "#F97316"
          }
        }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockFinancialData} margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 20
            }} barGap={0} barCategoryGap={10}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
                fontSize: 12
              }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{
                fontSize: 12
              }} tickFormatter={value => {
                if (value >= 20000) return '$20k';
                if (value >= 10000) return '$10k';
                if (value >= 3000) return '$3k';
                if (value >= 1000) return '$1k';
                return `$${value}`;
              }} width={40} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={label => `Work Order: ${label}`} formatter={(value, name) => {
                const formattedValue = formatCurrency(Number(value));
                const formattedName = typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : String(name);
                return [formattedValue, formattedName];
              }} />} />
                <Bar dataKey="estimated" fill="#2E8B57" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="invoiced" fill="#F97316" radius={[0, 0, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        {/* Legend */}
        <div className="flex justify-end items-center mt-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#2E8B57] rounded"></div>
            <span>Estimated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#F97316] rounded"></div>
            <span>Invoiced</span>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default FinancialComparisonCard;