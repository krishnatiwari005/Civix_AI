import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Issue, Department } from '../types';

interface AnalyticsChartsProps {
  issues: Issue[];
  departments: Department[];
}

export default function AnalyticsCharts({ issues, departments }: AnalyticsChartsProps) {
  // 1. Category Distribution Data
  const categories = ['Roads', 'Water', 'Electricity', 'Waste', 'Public Safety'];
  const categoryColors = ['#3B82F6', '#10B981', '#CA8A04', '#EC4899', '#EF4444'];
  
  const categoryData = categories.map((cat, idx) => {
    const count = issues.filter(i => i.category === cat).length;
    return { name: cat, value: count, color: categoryColors[idx] };
  }).filter(item => item.value > 0);

  // 2. Department performance data
  const deptPerformanceData = departments.map(d => ({
    name: d.name.replace(' Department', ''),
    Assigned: d.totalAssigned,
    Resolved: d.totalResolved,
  }));

  // 3. Issue Severity distribution
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
  const severityColors = ['#10B981', '#EAB308', '#F97316', '#EF4444'];
  const severityData = severityLevels.map((sev, idx) => {
    const count = issues.filter(i => i.severity === sev).length;
    return { name: sev, count, fill: severityColors[idx] };
  });

  // 4. Over last 7 days trend
  const getTimelineData = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();

      const reported = issues.filter(issue => {
        const cTime = new Date(issue.createdAt).getTime();
        return cTime >= dayStart && cTime <= dayEnd;
      }).length;

      const resolved = issues.filter(issue => {
        if (!issue.resolvedAt) return false;
        const rTime = new Date(issue.resolvedAt).getTime();
        return rTime >= dayStart && rTime <= dayEnd;
      }).length;

      days.push({
        date: dateStr,
        Reported: reported,
        Resolved: resolved,
      });
    }
    return days;
  };

  const timelineData = getTimelineData();

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs font-semibold">
          <p className="border-b border-slate-800 pb-1.5 mb-1.5 text-slate-400">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="flex justify-between space-x-4">
              <span>{p.name}:</span>
              <span style={{ color: p.color || p.payload?.color || '#fff' }} className="font-extrabold font-mono">
                {p.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share (Doughnut) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-[#64748B] mb-6 uppercase tracking-wider">
            Issues by Category Share
          </h3>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-between">
            {categoryData.length === 0 ? (
              <div className="w-full flex items-center justify-center text-slate-400 text-xs">
                No active data to chart
              </div>
            ) : (
              <>
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="w-full sm:w-1/2 space-y-2 px-4">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[#475569]">{cat.name}</span>
                      </div>
                      <span className="font-mono text-[#0F172A] font-bold">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 7-Day Trend (Area) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-[#64748B] mb-6 uppercase tracking-wider">
            Civic Activities (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, color: '#475569' }} />
                <Area type="monotone" dataKey="Reported" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
                <Area type="monotone" dataKey="Resolved" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Performance Stacked Bar Chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-[#64748B] mb-6 uppercase tracking-wider">
          Departmental Assignment vs Resolution Rate
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, color: '#475569' }} />
              <Bar dataKey="Assigned" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity distribution list */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-[#64748B] mb-6 uppercase tracking-wider">
          Issues by Severity Distribution
        </h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#0F172A' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
