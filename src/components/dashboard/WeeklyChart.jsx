import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function WeeklyChart({ data }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-sm font-semibold mb-3">Weekly Protein</h3>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" fontSize={10} />
          <YAxis fontSize={10} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="protein"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}