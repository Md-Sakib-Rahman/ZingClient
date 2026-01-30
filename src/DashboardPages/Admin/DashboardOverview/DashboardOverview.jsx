import React, { useEffect, useState } from "react";
import { 
  MdAttachMoney, 
  MdShoppingCart, 
  MdWarning, 
  MdTrendingUp, 
  MdHistory,
  MdInventory2
} from "react-icons/md";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import axiosInstance from "../../../Api/publicAxios/axiosInstance";
// import axiosInstance from "../../Api/publicAxios/axiosInstance";

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    general: null,
    products: null,
    timeSeries: [],
    logs: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [genRes, prodRes, timeRes, logsRes] = await Promise.all([
          axiosInstance.get("/analytics/dashboard/"),
          axiosInstance.get("/analytics/products/"),
          axiosInstance.get("/analytics/time-based/?type=daily"), // or daily based on requirement
          axiosInstance.get("/logs/all/?limit=5")
        ]);

        // Process Time Series Data for Chart
        const formattedChartData = (timeRes.data.time_based_data || []).map(item => ({
          name: `${item.time.day}/${item.time.month}`, // Format date
          revenue: item.total_revenue,
          orders: item.total_orders
        }));

        setData({
          general: genRes.data,
          products: prodRes.data,
          timeSeries: formattedChartData,
          logs: logsRes.data.results
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-bars loading-lg text-primary"></span>
      </div>
    );
  }

  // --- Derived Stats ---
  const totalRevenue = data.general?.total_revenue || 0;
  const pendingCount = data.general?.order_status_distribution?.find(s => s._id === "pending")?.count || 0;
  const confirmedCount = data.general?.order_status_distribution?.find(s => s._id === "confirmed")?.count || 0;
  const cancelledRevenue = data.general?.canceled_revenue || 0;

  // Colors for charts
  const COLORS = ['#1A2B23', '#4ade80', '#fbbf24', '#f87171'];

  return (
    <div className="space-y-6 font-inter text-primary animate-in fade-in duration-500">
      
      {/* 1. Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={<MdAttachMoney size={24} />} 
          trend="Realized"
          color="bg-emerald-50 text-emerald-700"
        />
        <StatCard 
          title="Confirmed Orders" 
          value={confirmedCount} 
          icon={<MdShoppingCart size={24} />} 
          trend="Active"
          color="bg-blue-50 text-blue-700"
        />
        <StatCard 
          title="Pending Orders" 
          value={pendingCount} 
          icon={<MdWarning size={24} />} 
          trend="Action Needed"
          color="bg-yellow-50 text-yellow-700"
        />
        <StatCard 
          title="Cancelled Value" 
          value={`$${cancelledRevenue.toLocaleString()}`} 
          icon={<MdTrendingUp size={24} className="rotate-180" />} 
          trend="Lost"
          color="bg-red-50 text-red-700"
        />
      </div>

      {/* 2. Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Revenue Timeline (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-sm border border-accent/20 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Revenue Trends - Daily</h3>
            {/* <select className="text-xs border rounded p-1 bg-gray-50 outline-none">
              <option>This Month</option>
            </select> */}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeSeries}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A2B23" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1A2B23" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9CA3AF'}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9CA3AF'}} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1A2B23', color: '#fff', borderRadius: '4px', border: 'none', fontSize: '12px'}}
                  itemStyle={{color: '#fff'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1A2B23" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Top Products (Simple List or Bar) */}
        <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Top Products</h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {data.products?.product_revenue?.slice(0, 5).map((prod, idx) => (
              <div key={prod._id} className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-primary truncate max-w-[150px]">{prod.product_name}</span>
                  <span className="text-xs font-mono font-bold text-secondary">${prod.revenue}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${(prod.sold_qty / 20) * 100}%` }} // Simplified percentage logic
                  ></div>
                </div>
                <p className="text-[9px] text-gray-400 mt-1 text-right">{prod.sold_qty} sold</p>
              </div>
            ))}
            {(!data.products?.product_revenue || data.products.product_revenue.length === 0) && (
                <p className="text-xs text-gray-400 italic">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Logs & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-white p-6 rounded-sm border border-accent/20 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
            <MdHistory /> Recent System Logs
          </h3>
          <div className="space-y-4">
            {data.logs.map((log) => (
              <div key={log._id} className="flex gap-4 items-start pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 
                  ${log.action.includes('delete') ? 'bg-red-400' : 
                    log.action.includes('create') ? 'bg-green-400' : 
                    log.action.includes('update') ? 'bg-yellow-400' : 'bg-blue-400'}`} 
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-primary">
                    <span className="capitalize">{log.actor_type}:</span> {log.description}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(log.timestamp).toLocaleString()} • ID: {log._id.slice(-6)}
                  </p>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">
                  {log.action.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution (Pie Chart) */}
        <div className="bg-white p-6 rounded-sm border border-accent/20 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Order Mix</h3>
          <div className="h-48 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.general?.order_status_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {(data.general?.order_status_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-primary">{data.general?.total_orders || 0}</span>
                <span className="text-[9px] uppercase text-gray-400">Total</span>
             </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
             {(data.general?.order_status_distribution || []).map((item, idx) => (
               <div key={item._id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                  <span className="text-xs text-gray-600 capitalize">{item._id}: {item.count}</span>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Reusable Stat Card Sub-component ---
const StatCard = ({ title, value, icon, trend, color }) => (
  <div className="bg-white p-5 rounded-sm border border-accent/10 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-md ${color} bg-opacity-10`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 text-gray-500 uppercase tracking-wider`}>
        {trend}
      </span>
    </div>
    <h3 className="text-2xl font-bold text-primary">{value}</h3>
    <p className="text-[10px] uppercase tracking-widest text-primary/40 font-bold mt-1">{title}</p>
  </div>
);

export default DashboardOverview;