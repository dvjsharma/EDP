import type React from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

type ChartData = {
  date: string
  value: number
}

type LineChartProps = {
  data: ChartData[]
  xAxisKey: string
  series: {
    key: string
    label: string
    color: string
  }[]
  tooltip?: React.ReactNode
}

export const LineChart = ({ data, xAxisKey, series, tooltip }: LineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip content={tooltip} />
        <Legend />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} name={s.label} />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full h-full">{children}</div>
}

export const ChartTooltip = ({ content }: { content: React.ReactNode }) => {
  return content
}
