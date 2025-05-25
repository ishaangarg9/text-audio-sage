
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps, Cell } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

type StutterType = "Block" | "Prolongation" | "Repetition" | "Interjection" | "Revision";

interface StutterResult {
  type: StutterType;
  confidence: number;
  count: number;
  examples: string[];
}

const typeColors = {
  "Block": "#ef4444",
  "Prolongation": "#3b82f6",
  "Repetition": "#8b5cf6",
  "Interjection": "#eab308",
  "Revision": "#22c55e"
};

interface StutterResultsChartProps {
  results: StutterResult[];
}

export const StutterResultsChart = ({ results }: StutterResultsChartProps) => {
  const isMobile = useIsMobile();
  
  const data = results.map(result => ({
    type: result.type,
    count: result.count,
    confidence: Math.round(result.confidence * 100),
    color: typeColors[result.type as keyof typeof typeColors]
  }));

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md">
          <p className="font-medium">{payload[0].payload.type}</p>
          <p>Count: {payload[0].payload.count}</p>
          <p>Confidence: {payload[0].payload.confidence}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <XAxis 
          dataKey="type" 
          angle={isMobile ? -45 : 0} 
          textAnchor={isMobile ? "end" : "middle"}
          height={60}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
        <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Instances">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
