import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceChartProps {
  data: { month: string; month_label: string; attendance_rate: number; total_schedules: number; confirmed: number }[];
  className?: string;
}

export function AttendanceChart({ data, className }: AttendanceChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Tendência de Presença</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month_label" className="text-xs" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip formatter={(value: number, name: string) => [
                name === "attendance_rate" ? `${value.toFixed(1)}%` : value,
                name === "attendance_rate" ? "Taxa de Presença" : name === "confirmed" ? "Confirmados" : "Total"
              ]} />
              <Legend />
              <Line type="monotone" dataKey="attendance_rate" name="Taxa de Presença" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              <Line type="monotone" dataKey="confirmed" name="Confirmados" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
