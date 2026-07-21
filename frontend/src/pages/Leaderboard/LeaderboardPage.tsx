import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Building2, Globe, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { userService } from '../../services/userService';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'company' | 'global'>(user?.organisationName ? 'company' : 'global');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [deptBattles, setDeptBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        if (activeTab === 'company' && user?.organisationName) {
          const [orgRes, deptRes] = await Promise.all([
            apiClient.get('/organisation/leaderboard'),
            apiClient.get('/organisation/department-battles').catch(() => ({ data: [] }))
          ]);
          const mapped = orgRes.data.map((item: any, idx: number) => ({
            rank: idx + 1,
            name: item.name,
            email: item.email,
            score: Math.round(item.emissionsKg * 10) / 10,
            department: item.department || 'General',
            isUser: item.email === user?.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=10B981&color=fff`
          }));
          setLeaderboardData(mapped);
          setDeptBattles(deptRes.data);
        } else {
          const data = await userService.getLeaderboard();
          const mappedData = data.map((item: any) => ({
            ...item,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=3B82F6&color=fff`
          }));
          setLeaderboardData(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab, user]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-slate-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="font-bold text-slate-400 text-lg w-6 text-center">{rank}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 relative max-w-5xl mx-auto">
      {/* Header & Tenant Isolation Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Trophy className="text-emerald-500 w-8 h-8" />
            {activeTab === 'company' ? `${user?.organisationName || 'Corporate'} Leaderboard` : 'Global Community Leaderboard'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {activeTab === 'company' 
              ? 'Private, tenant-isolated corporate rankings for your organization.'
              : 'Public platform rankings across all global eco-warriors.'}
          </p>
        </div>

        {user?.organisationName && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'company'
                  ? 'bg-emerald-600 text-white shadow-md font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={15} />
              {user.organisationName} (Private)
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'global'
                  ? 'bg-slate-800 text-white shadow-md font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe size={15} />
              Global Community
            </button>
          </div>
        )}
      </div>

      {/* Tenant Privacy Guard Notice */}
      {activeTab === 'company' && user?.organisationName && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Strict Data Isolation Enabled</h4>
              <p className="text-xs text-emerald-700">Your employee activity data is isolated to {user.organisationName} and hidden from external users.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-950 bg-emerald-200/60 px-3 py-1 rounded-full uppercase">
            Tenant Scoped
          </span>
        </div>
      )}

      {/* Department Battles (Only shown on Company tab) */}
      {activeTab === 'company' && deptBattles.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
            ⚔️ Department Battles & Inter-Team Competition
          </h3>
          <p className="text-xs text-slate-300 mb-6">Aggregate departmental footprint & team efficiency</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deptBattles.map((dept, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-emerald-400">{dept.department}</span>
                  <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                    {dept.employeeCount} Members
                  </span>
                </div>
                <div className="text-xl font-extrabold">{dept.totalEmissionsKg} <span className="text-xs font-normal text-slate-300">kg CO₂e</span></div>
                <div className="text-xs text-slate-300 mt-1">Avg: <strong>{dept.avgPerEmployeeKg} kg</strong> / employee</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Rank & Eco-Warrior</span>
            <span>30-Day Footprint (kg CO₂e)</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading leaderboard data...</div>
          ) : leaderboardData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No activity logs recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((item) => (
                <motion.div
                  key={item.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                    item.isUser
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                      : 'bg-slate-50/50 hover:bg-slate-100/60 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(item.rank)}
                    </div>
                    <img src={item.avatar} alt={item.name} className="w-11 h-11 rounded-full border-2 border-white shadow-sm" />
                    <div>
                      <div className={`font-bold text-sm ${item.isUser ? 'text-emerald-950' : 'text-slate-900'}`}>
                        {item.name} {item.isUser && <span className="text-emerald-600 font-extrabold text-xs ml-1">(You)</span>}
                      </div>
                      {activeTab === 'company' && item.department && (
                        <span className="text-[10px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded font-medium">
                          {item.department}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-base text-slate-800">
                    {item.score.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;
