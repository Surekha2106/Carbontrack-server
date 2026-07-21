import { useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { 
  Building2, Users, Leaf, TrendingDown, Award, 
  FileSpreadsheet, Palette, History, Target,
  BarChart3, ShieldCheck, Mail, Upload, GitFork, Layers, Zap, Truck, FileText
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { activityService } from '../../services/activityService';

interface EmployeeStat {
  name: string;
  emissionsKg: number;
}

interface OrgStats {
  organisationName: string;
  logoUrl?: string;
  primaryColor?: string;
  allowedDomain?: string;
  industry?: string;
  country?: string;
  totalEmployees: number;
  totalBranches?: number;
  totalDepartments?: number;
  totalEmissionsKg: number;
  averageEmissionsPerEmployeeKg: number;
  scope1EmissionsKg?: number;
  scope2EmissionsKg?: number;
  scope3EmissionsKg?: number;
  topReducers: EmployeeStat[];
}

interface AdminDashboardData {
  organisationName: string;
  logoUrl?: string;
  primaryColor?: string;
  allowedDomain?: string;
  totalEmployees: number;
  totalEmissionsKg: number;
  averageEmissionsPerEmployeeKg: number;
  emissionsByCategory: Record<string, number>;
  monthlyTrends: Array<{ month: string; emissionsKg: number }>;
  employeeDetails: Array<{
    id: number;
    name: string;
    email: string;
    department: string;
    emissionsKg: number;
    loggingStreak: number;
    goalStatus?: string;
  }>;
}

interface AuditLog {
  id: number;
  performedByEmail: string;
  performedByName: string;
  actionType: string;
  actionDetails: string;
  createdAt: string;
}

interface BranchItem {
  id: number;
  name: string;
  location: string;
  code: string;
  headcount: number;
}

interface DepartmentItem {
  id: number;
  name: string;
  code: string;
  headcount: number;
  branch?: BranchItem;
}

interface AssetItem {
  id: number;
  name: string;
  assetType: string;
  scope: string;
  fuelOrPowerType: string;
  location: string;
}

interface UtilityBillItem {
  id: number;
  billType: string;
  consumptionValue: number;
  unit: string;
  emissionValue: number;
  billingPeriodMonth: string;
  billingPeriodYear: number;
  logDate: string;
}

interface ReportItem {
  id: number;
  reportType: string;
  scopeFilter: string;
  startDate: string;
  endDate: string;
  totalEmission: number;
  generatedDate: string;
  summaryJson: string;
}

export const OrganisationPage = () => {
  const { user, updateUser } = useAuth();
  const isAdmin = user?.role === 'ORG_ADMIN';

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<'analytics' | 'scopes' | 'hierarchy' | 'utility' | 'assets' | 'reports' | 'onboarding' | 'branding' | 'offset' | 'audit'>('analytics');

  // Onboarding / Setup
  const [newOrgName, setNewOrgName] = useState('');
  const [allowedDomain, setAllowedDomain] = useState('');
  const [orgActionLoading, setOrgActionLoading] = useState(false);
  const [orgActionMessage, setOrgActionMessage] = useState('');

  // Enterprise Modules Data
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [orgStats, setOrgStats] = useState<OrgStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBillItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  // Forms
  const [branchForm, setBranchForm] = useState({ name: '', location: '', code: 'BR-01', headcount: '15' });
  const [deptForm, setDeptForm] = useState({ name: '', code: 'DEP-01', headcount: '8', branchId: '' });
  const [assetForm, setAssetForm] = useState({ name: '', assetType: 'Generator', scope: 'SCOPE_1', fuelOrPowerType: 'Diesel', location: 'Headquarters Main Plant' });
  const [billForm, setBillForm] = useState({ billType: 'Electricity', consumptionValue: '1500', unit: 'kWh', billingPeriodMonth: 'July', billingPeriodYear: '2026' });

  // Branding Form State
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#10B981');
  const [brandDomain, setBrandDomain] = useState('');
  const [brandingMsg, setBrandingMsg] = useState('');

  // Invitations
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Employee View
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; email: string; emissionsKg: number }>>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Load Admin Data
  const fetchAdminData = async () => {
    try {
      const [adminRes, statsRes, recsRes] = await Promise.all([
        apiClient.get('/organisation/admin/dashboard').catch(() => ({ data: null })),
        apiClient.get('/organisation/dashboard').catch(() => ({ data: null })),
        activityService.getOrganisationRecommendations().catch(() => [])
      ]);
      setAdminData(adminRes.data);
      setOrgStats(statsRes.data);
      setRecommendations(Array.isArray(recsRes) ? recsRes : []);
      if (adminRes.data) {
        setBrandLogoUrl(adminRes.data.logoUrl || '');
        setBrandPrimaryColor(adminRes.data.primaryColor || '#10B981');
        setBrandDomain(adminRes.data.allowedDomain || '');
      }
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
    }
  };

  // Load Enterprise Hierarchy & Utility & Assets & Reports Data
  const fetchEnterpriseData = async () => {
    try {
      const [brRes, dpRes, asRes, utRes, rpRes] = await Promise.all([
        apiClient.get('/organisation/branches').catch(() => ({ data: [] })),
        apiClient.get('/organisation/departments').catch(() => ({ data: [] })),
        apiClient.get('/organisation/assets').catch(() => ({ data: [] })),
        apiClient.get('/organisation/utility-bills').catch(() => ({ data: [] })),
        apiClient.get('/organisation/reports').catch(() => ({ data: [] }))
      ]);
      setBranches(Array.isArray(brRes.data) ? brRes.data : []);
      setDepartments(Array.isArray(dpRes.data) ? dpRes.data : []);
      setAssets(Array.isArray(asRes.data) ? asRes.data : []);
      setUtilityBills(Array.isArray(utRes.data) ? utRes.data : []);
      setReports(Array.isArray(rpRes.data) ? rpRes.data : []);
    } catch (err) {
      console.error('Failed to load enterprise data', err);
    }
  };

  // Load Audit Trail
  const fetchAuditLogs = async () => {
    try {
      const res = await apiClient.get('/organisation/admin/audit-logs');
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  };

  // Load Employee Org Stats
  const fetchUserData = async () => {
    try {
      const [statsRes, leadRes, goalsRes, recsRes] = await Promise.all([
        apiClient.get('/organisation/dashboard').catch(() => ({ data: null })),
        apiClient.get('/organisation/leaderboard').catch(() => ({ data: [] })),
        apiClient.get('/organisation/goals').catch(() => ({ data: [] })),
        activityService.getOrganisationRecommendations().catch(() => [])
      ]);
      setOrgStats(statsRes.data);
      setLeaderboard(Array.isArray(leadRes.data) ? leadRes.data : []);
      setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
      setRecommendations(Array.isArray(recsRes) ? recsRes : []);
    } catch (error) {
      console.error('Failed to fetch user org stats', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (isAdmin) {
        await Promise.all([fetchAdminData(), fetchEnterpriseData(), fetchAuditLogs()]);
      } else {
        await Promise.all([fetchUserData(), fetchEnterpriseData()]);
      }
      setLoading(false);
    };
    init();
  }, [isAdmin]);

  // Handlers for Branch, Department, Utility Bill, Asset, Report creation
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name) return;
    try {
      await apiClient.post('/organisation/branches', branchForm);
      setBranchForm({ name: '', location: '', code: 'BR-02', headcount: '20' });
      fetchEnterpriseData();
      if (isAdmin) fetchAdminData();
    } catch (err) {
      alert('Failed to create branch');
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name) return;
    try {
      await apiClient.post('/organisation/departments', deptForm);
      setDeptForm({ name: '', code: 'DEP-02', headcount: '10', branchId: '' });
      fetchEnterpriseData();
      if (isAdmin) fetchAdminData();
    } catch (err) {
      alert('Failed to create department');
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name) return;
    try {
      await apiClient.post('/organisation/assets', assetForm);
      setAssetForm({ name: '', assetType: 'Vehicle Fleet', scope: 'SCOPE_1', fuelOrPowerType: 'Diesel', location: 'Branch Campus' });
      fetchEnterpriseData();
    } catch (err) {
      alert('Failed to add asset');
    }
  };

  const handleAddUtilityBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/organisation/utility-bills', {
        billType: billForm.billType,
        consumptionValue: parseFloat(billForm.consumptionValue),
        unit: billForm.unit,
        billingPeriodMonth: billForm.billingPeriodMonth,
        billingPeriodYear: parseInt(billForm.billingPeriodYear)
      });
      fetchEnterpriseData();
      if (isAdmin) fetchAdminData();
      alert('Utility bill recorded & emissions auto-calculated!');
    } catch (err) {
      alert('Failed to log utility bill');
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    try {
      await apiClient.post('/organisation/reports/generate', { reportType });
      fetchEnterpriseData();
      alert(`Generated ${reportType} report successfully!`);
    } catch (err) {
      alert('Failed to generate report');
    }
  };

  // Handle Create Organisation Workspace
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setOrgActionLoading(true);
    setOrgActionMessage('');
    try {
      const response = await apiClient.post('/organisation/register', {
        name: newOrgName,
        allowedDomain: allowedDomain.trim() || undefined
      });
      setOrgActionMessage('Workspace provisioned successfully! Refreshing view...');
      updateUser({ role: 'ORG_ADMIN', organisationName: response.data.name });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setOrgActionMessage(err.response?.data?.message || 'Failed to create workspace.');
    } finally {
      setOrgActionLoading(false);
    }
  };

  // Handle Scan Domain Invites
  const handleScanInvites = async () => {
    setOrgActionLoading(true);
    setOrgActionMessage('');
    try {
      const response = await apiClient.post('/organisation/claim-invite');
      setOrgActionMessage(response.data.message || 'Joined workspace!');
      updateUser({ role: 'USER', organisationName: response.data.organisationName });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setOrgActionMessage(err.response?.data || 'No pending invite found for your email domain.');
    } finally {
      setOrgActionLoading(false);
    }
  };

  // Handle Save Branding
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandingMsg('');
    try {
      const res = await apiClient.put('/organisation/admin/branding', {
        logoUrl: brandLogoUrl,
        primaryColor: brandPrimaryColor,
        allowedDomain: brandDomain
      });
      setBrandingMsg('Branding updated successfully! Theme applied.');
      updateUser({
        logoUrl: res.data.logoUrl,
        primaryColor: res.data.primaryColor,
        allowedDomain: res.data.allowedDomain
      });
      fetchAuditLogs();
    } catch (err) {
      setBrandingMsg('Failed to update branding settings.');
    }
  };

  // Handle Invite Submission
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmails.trim()) return;
    setInviteLoading(true);
    setInviteMessage('');
    try {
      const emailList = inviteEmails.split(',').map(email => email.trim()).filter(Boolean);
      await apiClient.post('/organisation/admin/invite', { emails: emailList });
      setInviteMessage(`Successfully invited ${emailList.length} employees!`);
      setInviteEmails('');
      if (isAdmin) {
        fetchAdminData();
        fetchAuditLogs();
      }
    } catch (error) {
      setInviteMessage('Failed to send invitations.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle CSV Bulk Onboard Upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const employees = lines.map(line => {
        const parts = line.split(',');
        return {
          email: parts[0]?.trim(),
          name: parts[1]?.trim() || parts[0]?.split('@')[0],
          department: parts[2]?.trim() || 'General'
        };
      }).filter(e => e.email && e.email.includes('@'));

      if (employees.length > 0) {
        setInviteLoading(true);
        try {
          const res = await apiClient.post('/organisation/admin/bulk-onboard', { employees });
          setInviteMessage(`Bulk Onboarding Complete! ${res.data.message}`);
          if (isAdmin) {
            fetchAdminData();
            fetchAuditLogs();
          }
        } catch {
          setInviteMessage('Failed to process CSV file.');
        } finally {
          setInviteLoading(false);
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle CSR CSV Export
  const handleExportCSR = () => {
    if (!adminData) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Corporate Social Responsibility (CSR) Audit Report\n";
    csvContent += `Organisation,${adminData.organisationName}\n`;
    csvContent += `Domain,${adminData.allowedDomain || 'N/A'}\n`;
    csvContent += `Total Employees,${adminData.totalEmployees}\n`;
    csvContent += `Total Emissions (kg CO2e),${(adminData.totalEmissionsKg || 0).toFixed(2)}\n`;
    csvContent += `Per-Employee Average (kg CO2e),${(adminData.averageEmissionsPerEmployeeKg || 0).toFixed(2)}\n\n`;
    
    csvContent += "Employee Roster & Goal Compliance\n";
    csvContent += "Name,Email,Department,30Day Emissions (kg),Logging Streak,Goal Status\n";
    
    adminData.employeeDetails.forEach(emp => {
      csvContent += `"${emp.name}","${emp.email}","${emp.department}",${(emp.emissionsKg || 0).toFixed(2)},${emp.loggingStreak},"${emp.goalStatus}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${adminData.organisationName.replace(/\s+/g, '_')}_CSR_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading workspace environment...</div>;
  }

  const COLORS = [brandPrimaryColor || '#10B981', '#3B82F6', '#EF4444', '#F59E0B'];

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto pb-16 px-4 sm:px-6">
        
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            {adminData?.logoUrl || orgStats?.logoUrl ? (
              <img
                src={adminData?.logoUrl || orgStats?.logoUrl}
                alt="Brand Logo"
                className="w-14 h-14 rounded-2xl object-contain bg-white p-2 border border-slate-200 shadow-sm"
              />
            ) : (
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center border text-white font-bold text-2xl shadow-sm"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                <Building2 size={28} />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                {isAdmin ? adminData?.organisationName : orgStats?.organisationName}
              </h1>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                {isAdmin ? 'Corporate Admin Control Center' : 'Employee Sustainability Dashboard'}
                {(adminData?.allowedDomain || orgStats?.allowedDomain) && (
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold border border-slate-200">
                    @{adminData?.allowedDomain || orgStats?.allowedDomain}
                  </span>
                )}
                {orgStats?.industry && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    {orgStats.industry}
                  </span>
                )}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSR}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-md font-bold text-xs uppercase tracking-wider"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Audit CSV
              </button>
            </div>
          )}
        </div>

        {/* ONBOARDING PORTAL IF NO ORG LINKED */}
        {!isAdmin && orgStats?.organisationName === 'Personal / No Org' ? (
          <div className="max-w-4xl mx-auto space-y-8 mt-6">
            <div 
              className="text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${brandPrimaryColor} 0%, #064E3B 100%)` }}
            >
              <div className="relative z-10 space-y-4">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                  Enterprise Architecture
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight">Connect your Workplace to CarbonTrack</h2>
                <p className="text-emerald-100 max-w-2xl text-sm leading-relaxed font-medium">
                  Unlock tenant-isolated leaderboards, automatic email-domain onboarding, departmental carbon battles, and corporate CSR offset auditing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <Mail className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Auto Domain Join / Claim Invitation</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      If your corporate email domain matches an existing organization or if you have a pending HR invite, click below to join instantly.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleScanInvites}
                  disabled={orgActionLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {orgActionLoading ? 'Verifying...' : 'Auto-Join Corporate Workspace'}
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Create New Workspace</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Register your company workspace. You will be designated as the Corporate Administrator with full tenant management rights.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateOrg} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Saveetha Institute / Acme Corp"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Corporate Email Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. saveetha.com"
                      value={allowedDomain}
                      onChange={(e) => setAllowedDomain(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={orgActionLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md"
                  >
                    {orgActionLoading ? 'Provisioning...' : 'Provision Enterprise Workspace'}
                  </button>
                </form>
              </div>
            </div>

            {orgActionMessage && (
              <div className="p-4 rounded-xl text-center text-sm font-semibold border bg-slate-100 border-slate-300 text-slate-800">
                {orgActionMessage}
              </div>
            )}
          </div>
        ) : isAdmin && adminData ? (
          <div className="space-y-8">
            
            {/* ADMIN NAVIGATION TABS */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              {[
                { id: 'analytics', label: 'Executive Analytics', icon: <BarChart3 size={16} /> },
                { id: 'scopes', label: 'GHG Scopes 1-3', icon: <Layers size={16} /> },
                { id: 'hierarchy', label: 'Branches & Depts', icon: <GitFork size={16} /> },
                { id: 'utility', label: 'Utility Bills', icon: <Zap size={16} /> },
                { id: 'assets', label: 'Corporate Assets', icon: <Truck size={16} /> },
                { id: 'reports', label: 'ESG Reports', icon: <FileText size={16} /> },
                { id: 'onboarding', label: 'HR Roster', icon: <Users size={16} /> },
                { id: 'branding', label: 'Branding', icon: <Palette size={16} /> },
                { id: 'audit', label: 'Audit Logs', icon: <History size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                    adminTab === tab.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: EXECUTIVE ANALYTICS */}
            {adminTab === 'analytics' && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-500 text-xs uppercase">Total Employees</h3>
                      <Users className="text-blue-500 w-5 h-5" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{adminData.totalEmployees}</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-500 text-xs uppercase">Branches / Depts</h3>
                      <GitFork className="text-purple-500 w-5 h-5" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{branches.length} / {departments.length}</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-500 text-xs uppercase">Gross Footprint</h3>
                      <Leaf className="text-emerald-500 w-5 h-5" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {(adminData.totalEmissionsKg || 0).toFixed(1)} <span className="text-xs text-slate-400 font-medium">kg CO₂e</span>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-500 text-xs uppercase">Per-Employee Avg</h3>
                      <TrendingDown className="text-amber-500 w-5 h-5" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {(adminData.averageEmissionsPerEmployeeKg || 0).toFixed(1)} <span className="text-xs text-slate-400 font-medium">kg CO₂e</span>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-500" /> Emissions by Category
                    </h2>
                    <div className="h-64">
                      {Object.keys(adminData.emissionsByCategory || {}).length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(adminData.emissionsByCategory).map(([name, value]) => ({ name, value }))}
                              cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                            >
                              {Object.keys(adminData.emissionsByCategory).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)} kg CO₂e`, 'Emissions']} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">No emissions data recorded yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-blue-500" /> Monthly Emission Trajectory
                    </h2>
                    <div className="h-64">
                      {adminData.monthlyTrends && adminData.monthlyTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={adminData.monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                            <YAxis stroke="#64748B" fontSize={12} />
                            <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)} kg CO₂e`, 'Emissions']} />
                            <Area type="monotone" dataKey="emissionsKg" stroke={brandPrimaryColor} fill={brandPrimaryColor} fillOpacity={0.2} strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">No trend history available.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Enterprise Recommendations */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" /> Enterprise AI Recommendations
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {(Array.isArray(recommendations) ? recommendations : []).length > 0 ? (
                      (Array.isArray(recommendations) ? recommendations : []).map((rec: any, i) => (
                        <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-amber-500" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 capitalize mb-1">{rec.activity}</div>
                            <p className="text-sm text-slate-600 leading-relaxed">{rec.tip}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 p-4">No AI recommendations available at this time.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GHG SCOPES 1-3 */}
            {adminTab === 'scopes' && (
              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md">
                  <h2 className="text-xl font-extrabold mb-1">GHG Protocol Accounting Standards</h2>
                  <p className="text-slate-400 text-sm">Corporate emissions categorized into Scope 1 (Direct Fuel & Equipment), Scope 2 (Purchased Energy), and Scope 3 (Supply Chain & Commute).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-extrabold rounded-full">SCOPE 1 DIRECT</span>
                      <Truck className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-4xl font-extrabold text-slate-900">
                      {orgStats?.scope1EmissionsKg?.toFixed(1) || '0.0'} <span className="text-xs text-slate-400">kg CO₂e</span>
                    </div>
                    <p className="text-xs text-slate-500">Company fleet, generators, boilers, and direct fuel combustion.</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full">SCOPE 2 ENERGY</span>
                      <Zap className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-4xl font-extrabold text-slate-900">
                      {orgStats?.scope2EmissionsKg?.toFixed(1) || '0.0'} <span className="text-xs text-slate-400">kg CO₂e</span>
                    </div>
                    <p className="text-xs text-slate-500">Purchased grid electricity, steam, heating, and cooling utility bills.</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full">SCOPE 3 INDIRECT</span>
                      <Users className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-4xl font-extrabold text-slate-900">
                      {orgStats?.scope3EmissionsKg?.toFixed(1) || '0.0'} <span className="text-xs text-slate-400">kg CO₂e</span>
                    </div>
                    <p className="text-xs text-slate-500">Employee commutes, business flights, water, waste, paper & suppliers.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HIERARCHY MANAGER */}
            {adminTab === 'hierarchy' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Branches Panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <GitFork className="w-5 h-5 text-purple-600" /> Organizational Branches ({branches.length})
                  </h2>

                  <form onSubmit={handleAddBranch} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-extrabold uppercase text-slate-600">Add New Branch Office</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Branch Name (e.g. Chennai Campus)" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium" required />
                      <input type="text" placeholder="Location / City" value={branchForm.location} onChange={e => setBranchForm({...branchForm, location: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium" required />
                    </div>
                    <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm">Add Branch</button>
                  </form>

                  <div className="space-y-3">
                    {branches.map(br => (
                      <div key={br.id} className="p-4 rounded-2xl border border-slate-200 flex justify-between items-center bg-white shadow-2xs">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{br.name}</h4>
                          <p className="text-xs text-slate-500">{br.location} • Code: {br.code}</p>
                        </div>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">{br.headcount} Staff</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Departments Panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-600" /> Corporate Departments ({departments.length})
                  </h2>

                  <form onSubmit={handleAddDepartment} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-extrabold uppercase text-slate-600">Add New Department</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Dept Name (e.g. IT Engineering)" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium" required />
                      <input type="text" placeholder="Dept Code (e.g. DEP-01)" value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium" />
                    </div>
                    <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm">Add Department</button>
                  </form>

                  <div className="space-y-3">
                    {departments.map(dp => (
                      <div key={dp.id} className="p-4 rounded-2xl border border-slate-200 flex justify-between items-center bg-white shadow-2xs">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{dp.name}</h4>
                          <p className="text-xs text-slate-500">Code: {dp.code} • {dp.branch?.name || 'Main Office'}</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">{dp.headcount} Staff</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: UTILITY BILLS */}
            {adminTab === 'utility' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" /> Utility Bill Entry & Auto Emissions Calculation
                  </h2>

                  <form onSubmit={handleAddUtilityBill} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Utility Type</label>
                      <select value={billForm.billType} onChange={e => setBillForm({...billForm, billType: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium">
                        <option value="Electricity">Electricity (Grid)</option>
                        <option value="Diesel">Diesel Generator Fuel</option>
                        <option value="LPG">LPG / Commercial Gas</option>
                        <option value="Water">Water Consumption</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Quantity Value</label>
                      <input type="number" value={billForm.consumptionValue} onChange={e => setBillForm({...billForm, consumptionValue: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Unit</label>
                      <input type="text" value={billForm.unit} onChange={e => setBillForm({...billForm, unit: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Period Month</label>
                      <input type="text" value={billForm.billingPeriodMonth} onChange={e => setBillForm({...billForm, billingPeriodMonth: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium" />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm">Log Bill</button>
                    </div>
                  </form>

                  <div className="divide-y divide-slate-100">
                    {utilityBills.map(b => (
                      <div key={b.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-slate-900">{b.billType}</span>
                          <span className="text-slate-400 ml-2">({b.billingPeriodMonth} {b.billingPeriodYear})</span>
                        </div>
                        <div className="font-bold text-slate-700">{b.consumptionValue} {b.unit}</div>
                        <div className="font-extrabold text-emerald-600">{b.emissionValue?.toFixed(2)} kg CO₂e</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CORPORATE ASSETS */}
            {adminTab === 'assets' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" /> Corporate Asset Registry
                  </h2>

                  <form onSubmit={handleAddAsset} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <input type="text" placeholder="Asset Name (e.g. DG Generator #1)" value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium" required />
                    <select value={assetForm.scope} onChange={e => setAssetForm({...assetForm, scope: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium">
                      <option value="SCOPE_1">Scope 1 (Direct Fuel)</option>
                      <option value="SCOPE_2">Scope 2 (Electricity Equipment)</option>
                      <option value="SCOPE_3">Scope 3 (Supply / Tech)</option>
                    </select>
                    <input type="text" placeholder="Fuel/Power (e.g. Diesel / Grid)" value={assetForm.fuelOrPowerType} onChange={e => setAssetForm({...assetForm, fuelOrPowerType: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium" />
                    <button type="submit" className="py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm">Register Asset</button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {assets.map(a => (
                      <div key={a.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{a.scope}</span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{a.name}</h4>
                        <p className="text-xs text-slate-500">{a.assetType} • {a.fuelOrPowerType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: ESG REPORTS */}
            {adminTab === 'reports' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" /> ESG & CSR Audit Reports
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={() => handleGenerateReport('ESG_MONTHLY')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Generate ESG Report</button>
                      <button onClick={() => handleGenerateReport('CSR_COMPLIANCE')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Generate CSR Audit</button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {reports.map(r => (
                      <div key={r.id} className="p-4 rounded-2xl border border-slate-200 flex justify-between items-center bg-slate-50">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{r.reportType}</h4>
                          <p className="text-xs text-slate-500">Dates: {r.startDate} to {r.endDate} • Status: Approved</p>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-slate-900 text-sm">{r.totalEmission?.toFixed(1)} kg CO₂e</div>
                          <span className="text-[10px] text-emerald-600 font-bold">GHG Protocol Compliant</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: HR BULK ROSTER */}
            {adminTab === 'onboarding' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-600" /> HR CSV Bulk Employee Provisioning
                  </h2>
                  <input type="file" accept=".csv" onChange={handleCsvUpload} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  {inviteMessage && <p className="text-xs text-emerald-600 font-bold">{inviteMessage}</p>}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" /> Invite Specific Staff
                  </h2>
                  <textarea placeholder="Paste comma separated emails..." value={inviteEmails} onChange={e => setInviteEmails(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs" rows={3} />
                  <button onClick={handleInvite} disabled={inviteLoading} className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">{inviteLoading ? 'Sending...' : 'Send Invitations'}</button>
                </div>
              </div>
            )}

            {/* TAB 8: WHITE-LABEL BRANDING */}
            {adminTab === 'branding' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-xl mx-auto space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-emerald-600" /> Corporate White-Labeling & Branding
                </h2>
                <form onSubmit={handleSaveBranding} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Brand Logo URL</label>
                    <input type="text" value={brandLogoUrl} onChange={e => setBrandLogoUrl(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="https://company.com/logo.png" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Primary Theme Color</label>
                    <input type="color" value={brandPrimaryColor} onChange={e => setBrandPrimaryColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm">Save Brand Customizations</button>
                </form>
                {brandingMsg && <p className="text-xs text-center font-bold text-emerald-600">{brandingMsg}</p>}
              </div>
            )}

            {/* TAB 9: SECURITY AUDIT LOGS */}
            {adminTab === 'audit' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-600" /> Security Audit Log
                </h2>
                <div className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <div key={log.id} className="py-3 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-900">{log.actionType}</span>
                        <span className="text-slate-500 ml-2">{log.actionDetails}</span>
                      </div>
                      <span className="text-slate-400">{log.performedByEmail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* REGULAR EMPLOYEE DASHBOARD VIEW */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-500 text-xs uppercase">Colleagues</h3>
                  <Users className="text-blue-500 w-5 h-5" />
                </div>
                <div className="text-4xl font-extrabold text-slate-900">{orgStats?.totalEmployees || 0}</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-500 text-xs uppercase">Collective Footprint</h3>
                  <Leaf className="text-emerald-500 w-5 h-5" />
                </div>
                <div className="text-4xl font-extrabold text-slate-900">
                  {orgStats?.totalEmissionsKg?.toFixed(1) || '0.0'} <span className="text-sm text-slate-400 font-medium">kg CO₂e</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-500 text-xs uppercase">Company Average</h3>
                  <TrendingDown className="text-amber-500 w-5 h-5" />
                </div>
                <div className="text-4xl font-extrabold text-slate-900">
                  {orgStats?.averageEmissionsPerEmployeeKg?.toFixed(1) || '0.0'} <span className="text-sm text-slate-400 font-medium">kg CO₂e</span>
                </div>
              </div>
            </div>

            {/* ACTIVE COMPANY GOALS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" /> Active Company Goals
              </h2>
              {goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.map((g, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-sm">
                      <div>
                        <h4 className="font-extrabold text-slate-900">{g.title || 'Corporate Net-Zero Reduction'}</h4>
                        <p className="text-xs text-slate-500">Target: {g.targetEmissionsKg || 500} kg CO₂e</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">In Progress</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-500 text-xs text-center font-medium">
                  No active company goals currently set by corporate administrator.
                </div>
              )}
            </div>

            {/* TENANT ISOLATED PRIVATE CORPORATE LEADERBOARD */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" /> Private Corporate Leaderboard
                </h2>
                <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                  Tenant Isolated
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {leaderboard.map((emp, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-400 text-xs w-4">#{idx + 1}</span>
                      <span className="font-bold text-slate-900">{emp.name}</span>
                    </div>
                    <span className="font-extrabold text-emerald-600">{emp.emissionsKg?.toFixed(1)} kg CO₂e</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Enterprise Recommendations */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Enterprise AI Recommendations
              </h2>
              <div className="divide-y divide-slate-100">
                {(Array.isArray(recommendations) ? recommendations : []).length > 0 ? (
                  (Array.isArray(recommendations) ? recommendations : []).map((rec: any, i) => (
                    <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 capitalize mb-1">{rec.activity}</div>
                        <p className="text-sm text-slate-600 leading-relaxed">{rec.tip}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 p-4">No AI recommendations available at this time.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
