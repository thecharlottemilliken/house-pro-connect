
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

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

const FinancialComparisonCard = ({ projectId, className }: FinancialComparisonCardProps) => {
  const [timeFilter, setTimeFilter] = useState<"month" | "all">("month");
  
  // Mock financial data - in real app, fetch from API
  const mockFinancialData: WorkBlockFinance[] = [
    {
      id: "wb1",
      name: "Demolition",
      estimated: 1800,
      invoiced: 1950
    },
    {
      id: "wb2",
      name: "Electrical",
      estimated: 2500,
      invoiced: 2350
    },
    {
      id: "wb3",
      name: "Plumbing",
      estimated: 3200,
      invoiced: 2800
    },
    {
      id: "wb4",
      name: "Tiling",
      estimated: 2100,
      invoiced: 0
    }
  ];

  // Calculate totals
  const totalEstimated = mockFinancialData.reduce((sum, item) => sum + item.estimated, 0);
  const totalInvoiced = mockFinancialData.reduce((sum, item) => sum + item.invoiced, 0);
  const completedWorkOrders = mockFinancialData.filter(item => item.invoiced > 0).length;
  const totalWorkOrders = mockFinancialData.length;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-[#f8f9fa] border-b p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Financial Overview</h3>
          <div className="flex">
            <Button 
              variant={timeFilter === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("month")}
              className="text-sm"
            >
              This Month
            </Button>
            <Button 
              variant={timeFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("all")}
              className="text-sm"
            >
              All Time
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#f8f9fa] rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Total Estimated</div>
            <div className="text-xl font-bold">{formatCurrency(totalEstimated)}</div>
          </div>
          <div className="bg-[#f8f9fa] rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Total Invoiced</div>
            <div className="text-xl font-bold">{formatCurrency(totalInvoiced)}</div>
          </div>
          <div className="bg-[#f8f9fa] rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Work Orders Complete</div>
            <div className="text-xl font-bold">{completedWorkOrders}/{totalWorkOrders}</div>
          </div>
          <div className="bg-[#f8f9fa] rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Variance</div>
            <div className={cn(
              "text-xl font-bold",
              totalInvoiced > totalEstimated ? "text-red-600" : 
              totalInvoiced < totalEstimated ? "text-green-600" : ""
            )}>
              {formatCurrency(totalEstimated - totalInvoiced)}
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64 mt-6">
          <ChartContainer
            config={{
              estimated: { color: "#60a5fa" },
              invoiced: { color: "#1e40af" }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockFinancialData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `Work Block: ${label}`}
                      formatter={(value, name) => {
                        // The formatter function takes a value and a name, both could be of any type
                        // Let's explicitly handle them as strings or numbers
                        const formattedValue = `$${value}`;
                        const formattedName = typeof name === 'string' 
                          ? name.charAt(0).toUpperCase() + name.slice(1)
                          : String(name);
                        
                        return [formattedValue, formattedName];
                      }}
                    />
                  }
                />
                <Bar dataKey="estimated" fill="var(--color-estimated)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="invoiced" fill="var(--color-invoiced)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        <div className="flex justify-center items-center mt-4 gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>Estimated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-800 rounded"></div>
            <span>Invoiced</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialComparisonCard;
