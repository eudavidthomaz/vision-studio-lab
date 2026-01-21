import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VOLUNTEER_ROLES } from "@/hooks/useVolunteers";

interface RoleDistributionChartProps {
  data: { role: string; count: number; percentage: number }[];
  className?: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(340, 70%, 50%)",
  "hsl(160, 70%, 50%)",
  "hsl(40, 70%, 50%)",
  "hsl(200, 70%, 50%)",
];

export function RoleDistributionChart({ data, className }: RoleDistributionChartProps) {
  const getRoleLabel = (value: string) => {
    return VOLUNTEER_ROLES.find(r => r.value === value)?.label || value;
  };

  const chartData = data.map(item => ({
    ...item,
    name: getRoleLabel(item.role),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Distribuição por Função</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="name"
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} escalas`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
