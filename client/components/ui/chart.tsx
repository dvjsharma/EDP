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
  type TooltipProps,
} from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

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
  tooltip?: (props: TooltipProps<ValueType, NameType>) => React.ReactNode
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

// This component is no longer needed as we're using the tooltip function directly
export const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}
