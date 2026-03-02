import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, Clock, CheckCircle, XCircle, Bell, LogOut, User, Plus, Search, Wifi, WifiOff, Shield } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const map = { pending: 'bg-yellow-100 text-yellow-800', under_review: 'bg-blue-100 text-blue-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.pending}`}>{status.replace('_', ' ').toUpperCase()}</span>;
};

export default function CitizenDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, notifRes] = await Promise.all([
          api.get('/citizen/applications'),
          api.get('/notifications?limit=5')
        ]);
        const apps = appsRes.data.applications || [];
        setApplications(apps);
        setNotifications(notifRes.data.notifications || []);
        setStats({ pending: apps.filter(a => ['pending','under_review'].includes(a.status)).length, approved: apps.filter(a => a.status === 'approved').length, rejected: apps.filter(a => a.status === 'rejected').length });
      } catch (err) {
        if (!navigator.onLine) toast('Offline mode - showing cached data', { icon: '📴' });
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7" />
            <div><h1 className="font-bold text-lg">JANSEVA</h1><p className="text-blue-200 text-xs">जनसेवा पोर्टल</p></div>
          </div>
          <div className="flex items-center gap-3">
            {isOnline ? <span className="text-green-300 text-xs flex gap-1 items-center"><Wifi className="w-3 h-3"/>Online</span> : <span className="text-red-300 text-xs flex gap-1 items-center"><WifiOff className="w-3 h-3"/>Offline</span>}
            <div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center"><User className="w-4 h-4"/></div><span className="text-sm hidden md:block">{user?.full_name}</span></div>
            <button onClick={async () => { await logout(); navigate('/login'); }} className="p-1.5 hover:bg-blue-800 rounded-lg"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6"><h2 className="text-xl font-semibold text-gray-800">नमस्ते, {user?.full_name?.split(' ')[0]}!</h2><p className="text-gray-500 text-sm">Welcome to your JANSEVA dashboard</p></div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{label:'Pending',val:stats.pending,icon:Clock,cls:'text-yellow-600 bg-yellow-50'},{label:'Approved',val:stats.approved,icon:CheckCircle,cls:'text-green-600 bg-green-50'},{label:'Rejected',val:stats.rejected,icon:XCircle,cls:'text-red-600 bg-red-50'}].map(({label,val,icon:Icon,cls})=>(
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><div className={`inline-flex p-2 rounded-lg ${cls} mb-2`}><Icon className="w-5 h-5"/></div><p className="text-2xl font-bold">{val}</p><p className="text-xs text-gray-500">{label}</p></div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/services" className="bg-blue-900 text-white rounded-xl p-4 flex items-center gap-3 hover:bg-blue-800 transition"><Plus className="w-6 h-6"/><div><p className="font-semibold">Apply for Service</p><p className="text-blue-200 text-xs">नई अर्जी करें</p></div></Link>
          <Link to="/track" className="bg-white text-blue-900 rounded-xl p-4 flex items-center gap-3 hover:bg-blue-50 transition border border-blue-100"><Search className="w-6 h-6"/><div><p className="font-semibold">Track Application</p><p className="text-gray-400 text-xs">अर्जी स्थिति जानें</p></div></Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between"><h3 className="font-semibold text-gray-800">Recent Applications</h3><Link to="/track" className="text-blue-700 text-sm">View all</Link></div>
          {loading ? <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"/></div>
          : applications.length === 0 ? <div className="p-8 text-center text-gray-400"><FileText className="w-12 h-12 mx-auto mb-2 opacity-30"/><p>No applications yet</p><Link to="/services" className="text-blue-700 text-sm mt-2 block">Apply for first service</Link></div>
          : <div className="divide-y">{applications.slice(0,5).map(app=>(<div key={app.id} className="px-5 py-3 flex justify-between"><div><p className="text-sm font-medium">{app.service_type}</p><p className="text-xs text-gray-400">{app.application_number}</p></div><StatusBadge status={app.status}/></div>))}</div>}
        </div>
      </main>
    </div>
  );
}
