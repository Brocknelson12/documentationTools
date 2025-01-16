import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '@/App';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Heart,
  ShoppingCart,
  Eye,
  DollarSign,
  BookOpen,
  Share2,
  Star,
  BarChart2,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

// Sample data - In a real app, this would come from your API
const sampleMonthlyData = [
  { month: 'Jan', pageViews: 12000, followers: 2500, revenue: 1200 },
  { month: 'Feb', pageViews: 14000, followers: 3000, revenue: 1500 },
  { month: 'Mar', pageViews: 16500, followers: 3800, revenue: 1800 },
  { month: 'Apr', pageViews: 18000, followers: 4200, revenue: 2200 },
  { month: 'May', pageViews: 21000, followers: 4900, revenue: 2600 },
  { month: 'Jun', pageViews: 25000, followers: 5500, revenue: 3100 },
];

const sampleKpis = [
  {
    name: "Customer Satisfaction",
    target: "4.5/5",
    measurement: "Post-service surveys"
  },
  {
    name: "Social Media Growth",
    target: "100 followers/month",
    measurement: "Platform analytics"
  }
];
const revenueBreakdown = [
  { name: 'eBooks', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Courses', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Sponsorships', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Affiliate', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'Merchandise', value: 5, color: 'hsl(var(--chart-5))' },
];

const topRecipes = [
  { name: 'Easy Pasta Carbonara', views: 15000, saves: 2500, shares: 800 },
  { name: 'Healthy Smoothie Bowl', views: 12000, saves: 2000, shares: 600 },
  { name: 'Quick Chicken Stir-Fry', views: 10000, saves: 1800, shares: 500 },
  { name: '15-Min Breakfast Sandwich', views: 9000, saves: 1500, shares: 400 },
];

const MetricsDashboard = () => {
  const navigate = useNavigate();
  const { importedData } = useContext(DataContext);
  const [monthlyData, setMonthlyData] = useState(sampleMonthlyData);
  const [kpis, setKpis] = useState(sampleKpis);
  
  useEffect(() => {
    if (importedData?.metrics) {
      if (importedData.metrics.initialTargets?.monthly) {
        const monthly = importedData.metrics.initialTargets.monthly;
        setMonthlyData([
          {
            month: 'Target',
            pageViews: 0,
            followers: 0,
            revenue: monthly.catering.revenue + monthly.classes.revenue + 
                    (monthly.customOrders?.revenue || 0)
          }
        ]);
      }
      if (importedData.metrics.kpis) {
        setKpis(importedData.metrics.kpis);
      }
    }
  }, [importedData]);

  const kpiCards = [
    {
      title: 'Total Page Views',
      value: '25K',
      change: '+12.5%',
      trend: 'up',
      icon: Eye,
      color: 'text-blue-600',
    },
    {
      title: 'Social Followers',
      value: '5.5K',
      change: '+15.2%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Recipe Saves',
      value: '8.2K',
      change: '+8.1%',
      trend: 'up',
      icon: Heart,
      color: 'text-pink-600',
    },
    {
      title: 'Monthly Revenue',
      value: '$3.1K',
      change: '-2.4%',
      trend: 'down',
      icon: DollarSign,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Button>
        <h1 className="text-2xl font-bold">Metrics Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {kpi.title}
                  </p>
                  <h3 className="text-2xl font-bold">{kpi.value}</h3>
                </div>
                <div className={`p-2 rounded-full ${kpi.color} bg-opacity-10`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {kpi.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {kpi.change}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Growth Trends */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Growth Trends
            </CardTitle>
            <CardDescription>Monthly page views and followers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" scale="point" padding={{ left: 10, right: 10 }} />
                  <YAxis yAxisId="left" width={60} />
                  <YAxis yAxisId="right" orientation="right" width={60} />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pageViews"
                    stroke="hsl(var(--chart-1))"
                    name="Page Views"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="followers"
                    stroke="hsl(var(--chart-2))"
                    name="Followers"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Revenue Breakdown
            </CardTitle>
            <CardDescription>Revenue sources distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {revenueBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            Top Performing Content
          </CardTitle>
          <CardDescription>Most popular recipes by engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRecipes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" scale="band" padding={{ left: 10, right: 10 }} />
                <YAxis width={60} />
                <Tooltip />
                <Bar 
                  dataKey="views" 
                  name="Views" 
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="saves" 
                  name="Saves" 
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="shares" 
                  name="Shares" 
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {topRecipes.map((recipe, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <h4 className="font-medium mb-1">{recipe.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {recipe.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {recipe.saves.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      {recipe.shares.toLocaleString()}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDashboard;