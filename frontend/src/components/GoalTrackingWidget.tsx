import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

interface ChartPoint {
  date: string;
  actual?: number;
  projected?: number;
  target?: number;
}

interface GoalTrackingData {
  currentEmissions: number;
  targetEmissions: number;
  projectedTotal: number;
  requiredDaily: number;
  currentDailyTrend: number;
  daysPassed: number;
  totalDays: number;
  alert: string;
  status: string;
  chartData: ChartPoint[];
}

interface GoalTrackingWidgetProps {
  goalId: number;
  goalName: string;
  data: GoalTrackingData | null;
  isLoading: boolean;
}

export const GoalTrackingWidget: React.FC<GoalTrackingWidgetProps> = ({ goalName, data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <span className="text-gray-500">Loading goal projection...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <span className="text-gray-500">No projection data available.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    currentEmissions,
    targetEmissions,
    projectedTotal,
    requiredDaily,
    alert,
    chartData,
  } = data;

  const isFallingBehind = alert.includes('Falling Behind');
  const progressPercent = Math.min(100, Math.max(0, (currentEmissions / targetEmissions) * 100));

  return (
    <Card className="w-full shadow-lg border-emerald-100 dark:border-slate-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-400">
              {goalName}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
              Projection & Tracking Analysis
            </CardDescription>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold bg-opacity-20 ${isFallingBehind ? 'bg-red-500 text-red-500' : 'bg-emerald-500 text-emerald-500'}`}>
            {alert}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-emerald-50 dark:bg-slate-800 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Emissions</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {currentEmissions.toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span>
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Ceiling</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {targetEmissions.toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span>
            </p>
          </div>
          <div className={`p-4 rounded-xl ${isFallingBehind ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Projected Final</h3>
            <p className={`text-3xl font-bold mt-2 ${isFallingBehind ? 'text-red-600' : 'text-emerald-600'}`}>
              {projectedTotal.toFixed(1)} <span className="text-sm font-normal">kg</span>
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-slate-800 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Required Daily Red.</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {requiredDaily.toFixed(2)} <span className="text-sm font-normal text-gray-500">kg/day</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-gray-600">Goal Budget Used</span>
            <span className={progressPercent > 100 ? 'text-red-500' : 'text-emerald-600'}>
              {progressPercent.toFixed(1)}%
            </span>
          </div>
          <Progress value={Math.min(100, progressPercent)} className="h-3 bg-gray-100" indicatorClassName={progressPercent > 100 ? 'bg-red-500' : 'bg-emerald-500'} />
        </div>

        {/* Timeline Chart */}
        <div className="h-80 w-full mt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Emissions Trajectory</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Emissions" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="projected" 
                name="Projected Trend" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                name="Target Baseline" 
                stroke="#ef4444" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
