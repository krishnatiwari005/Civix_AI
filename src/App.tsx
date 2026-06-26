import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  User as UserIcon, 
  PlusCircle, 
  FileText, 
  Users, 
  Map, 
  Bot, 
  LineChart, 
  Bell, 
  LogOut, 
  Lock, 
  ShieldCheck, 
  Search, 
  Send, 
  ArrowRight, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Camera, 
  Check, 
  SlidersHorizontal,
  ThumbsUp,
  Award,
  Calendar,
  Layers,
  Sparkles,
  Play,
  Loader2,
  Building
} from 'lucide-react';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import IssueCard from './components/IssueCard.tsx';
import AnalyticsCharts from './components/AnalyticsCharts.tsx';
import CopilotChat from './components/CopilotChat.tsx';
import LiveMapDisplay from './components/LiveMapDisplay.tsx';
import { 
  User, 
  Issue, 
  Notification, 
  Department, 
  Comment, 
  AIAnalysis, 
  PredictiveAlert 
} from './types';

export default function App() {
  // --- Core Application States ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('civix_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentView, setCurrentView] = useState<string>(() => {
    const saved = localStorage.getItem('civix_user');
    return saved ? 'citizen-dashboard' : 'landing';
  });

  const [issues, setIssues] = useState<Issue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Form & Interaction States ---
  const [activeIssueDetail, setActiveIssueDetail] = useState<Issue | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // --- Auth View States ---
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authWard, setAuthWard] = useState('Ward 12 - Indiranagar');
  const [authRole, setAuthRole] = useState<'citizen' | 'authority' | 'admin'>('citizen');
  const [isRegistering, setIsRegistering] = useState(false);

  // --- Report Issue States ---
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Roads');
  const [newSeverity, setNewSeverity] = useState<string>('Medium');
  const [newLat, setNewLat] = useState<number>(12.9716);
  const [newLng, setNewLng] = useState<number>(77.5946);
  const [newAddress, setNewAddress] = useState('');
  const [newWard, setNewWard] = useState('Ward 12 - Indiranagar');
  const [newLandmark, setNewLandmark] = useState('');
  const [newImage, setNewImage] = useState<string>(''); // Base64 Data URL
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIAnalysis | null>(null);
  const [sizeWarning, setSizeWarning] = useState(false);

  // --- Filter States ---
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Admin/Authority Config States ---
  const [isSyncingEscalations, setIsSyncingEscalations] = useState(false);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [predictiveSummary, setPredictiveSummary] = useState('');
  const [isGeneratingPredictions, setIsGeneratingPredictions] = useState(false);

  // --- Load Full State from Server ---
  const fetchState = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      setIssues(data.issues || []);
      setDepartments(data.departments || []);
      setNotifications(data.notifications || []);
      setUsers(data.users || []);

      // Keep current user object fresh in case points or badge changed
      if (currentUser) {
        const freshUser = data.users.find((u: User) => u.uid === currentUser.uid);
        if (freshUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('civix_user', JSON.stringify(freshUser));
        }
      }
    } catch (err) {
      showToast('Error syncing with Civix server.', 'error');
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Run background synchronization check every 15 seconds
    const interval = setInterval(() => fetchState(true), 15000);
    return () => clearInterval(interval);
  }, []);

  // Update Detail modal issue when state refreshes
  useEffect(() => {
    if (activeIssueDetail) {
      const updated = issues.find(i => i.id === activeIssueDetail.id);
      if (updated) {
        setActiveIssueDetail(updated);
      }
    }
  }, [issues]);

  // --- Helper: Toast Notification ---
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // --- View Nav Guard ---
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  // --- Action Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail.trim() }),
      });
      const userData = await res.json();
      setCurrentUser(userData);
      localStorage.setItem('civix_user', JSON.stringify(userData));
      
      showToast(`Welcome back, ${userData.name}! 👋`, 'success');
      handleNavigate(userData.role === 'citizen' ? 'citizen-dashboard' : 'authority-dashboard');
    } catch (err) {
      showToast('Login failed. Check server connection.', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authName.trim()) return;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authName.trim(),
          email: authEmail.trim(),
          ward: authWard,
          role: authRole,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return showToast(err.error || 'Registration failed', 'error');
      }
      const userData = await res.json();
      setCurrentUser(userData);
      localStorage.setItem('civix_user', JSON.stringify(userData));

      showToast(`Account created! Welcome ${userData.name}. 🎉`, 'success');
      handleNavigate(userData.role === 'citizen' ? 'citizen-dashboard' : 'authority-dashboard');
    } catch (err) {
      showToast('Registration failed.', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('civix_user');
    showToast('Logged out successfully.', 'info');
    handleNavigate('landing');
  };

  // Upvote / Verify
  const handleVerifyIssue = async (issueId: string, vote: 'yes' | 'no') => {
    if (!currentUser) return handleNavigate('auth');

    try {
      const res = await fetch(`/api/issues/${issueId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid, vote }),
      });
      if (!res.ok) {
        const err = await res.json();
        return showToast(err.error || 'Verification failed', 'error');
      }
      await fetchState(true);
      showToast('Verification vote counted! Civic reward points awarded. 🏆', 'success');
    } catch (err) {
      showToast('Failed to log verification.', 'error');
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeIssueDetail || !commentInput.trim()) return;

    try {
      const res = await fetch(`/api/issues/${activeIssueDetail.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: currentUser.name,
          text: commentInput.trim(),
          isOfficial: currentUser.role !== 'citizen',
        }),
      });
      setCommentInput('');
      await fetchState(true);
      showToast('Comment published successfully!', 'success');
    } catch (err) {
      showToast('Failed to post comment.', 'error');
    }
  };

  // Update Status (Authority Action)
  const handleUpdateStatus = async (issueId: string, newStatus: string, commentText: string) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          commentText,
          authorityUserId: currentUser.uid,
          authorityUserName: currentUser.name,
        }),
      });
      await fetchState(true);
      showToast(`Status updated to: ${newStatus}`, 'success');
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await fetch({
        url: '/api/notifications/read-all',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid })
      } as any);
      // locally set to read for instant UI update
      setNotifications(prev => prev.map(n => n.userId === currentUser.uid ? { ...n, read: true } : n));
    } catch (err) {
      // ignore
    }
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Warning for files > 5MB
    if (file.size > 5 * 1024 * 1024) {
      setSizeWarning(true);
    } else {
      setSizeWarning(false);
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setNewImage(base64);

      // Trigger instant Vision AI assessment!
      setIsAnalyzingImage(true);
      setAiAnalysisResult(null);

      try {
        const cleanBase64 = base64.split(',')[1];
        const res = await fetch('/api/gemini/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Image: cleanBase64,
            mimeType: file.type,
          }),
        });
        const data = await res.json();
        if (data.analysis) {
          setAiAnalysisResult(data.analysis);
          setNewTitle(data.analysis.suggestedTitle || '');
          setNewCategory(data.analysis.category || 'Roads');
          setNewSeverity(data.analysis.severity || 'Medium');
          setNewDesc(data.analysis.description || '');
          showToast('Gemini Vision AI completed assessment successfully! ✨', 'success');
        }
      } catch (err) {
        showToast('Vision AI analysis failed. Please complete details manually.', 'info');
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Autocomplete geolocation coordinates
  const triggerAutoLocation = () => {
    if (!navigator.geolocation) {
      return showToast('Geolocation is not supported by your browser.', 'error');
    }
    showToast('Retrieving modern GPS coordinates...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewLat(Number(pos.coords.latitude.toFixed(6)));
        setNewLng(Number(pos.coords.longitude.toFixed(6)));
        // Simulate backward geocode coordinates
        setNewAddress(`Latitude: ${pos.coords.latitude.toFixed(4)}, Longitude: ${pos.coords.longitude.toFixed(4)}, Bengaluru, Karnataka`);
        showToast('Location coordinates matched successfully!', 'success');
      },
      (err) => {
        showToast('Permission denied or GPS signal lost. Standard coordinate bounds set.', 'error');
      }
    );
  };

  // Report Issue Submit
  const handleReportIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTitle.trim() || !newDesc.trim()) return;

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          category: newCategory,
          severity: newSeverity,
          latitude: newLat,
          longitude: newLng,
          address: newAddress || `${newWard}, Bengaluru, Karnataka`,
          ward: newWard,
          landmark: newLandmark.trim(),
          reportedBy: currentUser.uid,
          reporterName: currentUser.name,
          imageUrl: newImage,
          aiAnalysis: aiAnalysisResult || undefined,
        }),
      });

      const result = await res.json();
      await fetchState(true);

      if (result.isDuplicate) {
        showToast('Proximity Warning: Matching nearby issue found. Report upvoted! 👥', 'info');
      } else {
        showToast('Report submitted! Your issue is dispatched to the corresponding department. +10 PTS 🏆', 'success');
      }

      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewImage('');
      setAiAnalysisResult(null);
      setNewLandmark('');
      handleNavigate('my-reports');
    } catch (err) {
      showToast('Failed to submit report.', 'error');
    }
  };

  // Run Escalations Check
  const triggerEscalationCheck = async () => {
    setIsSyncingEscalations(true);
    try {
      const res = await fetch('/api/escalations/check', { method: 'POST' });
      const data = await res.json();
      await fetchState(true);
      showToast(`Audit complete! Escalated ${data.escalatedCount} overdue complaints.`, 'success');
    } catch (err) {
      showToast('Escalation check failed.', 'error');
    } finally {
      setIsSyncingEscalations(false);
    }
  };

  // Fetch AI Predictions
  const triggerPredictiveAnalytics = async () => {
    setIsGeneratingPredictions(true);
    try {
      const res = await fetch('/api/gemini/predict');
      const data = await res.json();
      setPredictiveAlerts(data.predictions || []);
      setPredictiveSummary(data.summary || '');
      showToast('Predictions generated successfully! 🧠', 'success');
    } catch (err) {
      showToast('Could not sync predictive assessments.', 'error');
    } finally {
      setIsGeneratingPredictions(false);
    }
  };

  // Send message to Copilot Advisor via endpoints
  const handleCopilotSend = async (message: string, history: any[]) => {
    const res = await fetch('/api/gemini/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const data = await res.json();
    return data.text;
  };

  // Admin: Update User Role
  const handleUpdateUserRole = async (userId: string, newRole: 'citizen' | 'authority' | 'admin') => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userId, role: newRole }),
      });
      if (res.ok) {
        showToast('User permissions modified successfully!', 'success');
        await fetchState(true);
      }
    } catch (err) {
      showToast('Failed to update user role.', 'error');
    }
  };

  // Admin: Clear database seed reset
  const handleResetDatabase = async () => {
    if (!window.confirm('This will wipe out all reports, points, and reset back to demo seed data. Proceed?')) return;
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Database reset to seed templates successfully!', 'success');
        await fetchState();
        handleNavigate('landing');
      }
    } catch (err) {
      showToast('Reset failed.', 'error');
    }
  };

  // --- Filtering Helper ---
  const getFilteredIssuesList = () => {
    return issues.filter(issue => {
      // search term
      const matchesSearch = 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = categoryFilter === 'All' || issue.category === categoryFilter;
      const matchesSev = severityFilter === 'All' || issue.severity === severityFilter;
      const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;

      return matchesSearch && matchesCat && matchesSev && matchesStatus;
    });
  };

  const activeIssuesList = getFilteredIssuesList();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#475569] font-sans" id="civix-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          className={`fixed top-20 right-6 z-50 px-5 py-4 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300 border ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar 
        user={currentUser} 
        notifications={notifications}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main Grid Structure */}
      <div className={`pt-16 ${currentUser ? 'md:pl-64' : ''} transition-all duration-300`}>
        {/* Sidebar */}
        <Sidebar 
          user={currentUser}
          currentView={currentView}
          notifications={notifications}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        {/* --- MAIN PAGE CONTENT --- */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* 1. Landing View */}
          {currentView === 'landing' && (
            <div className="space-y-16 py-8" id="view-landing">
              {/* Hero Banner Section */}
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-widest rounded-md border border-[#BFDBFE]">
                  <Sparkles className="w-3.5 h-3.5" /> <span>Next-Gen Municipal Engineering</span>
                </span>
                <h1 className="text-4xl sm:text-5xl font-bold text-[#0F172A] tracking-tight leading-tight">
                  Civic issue resolution, <br className="hidden sm:inline" />
                  powered by <span className="text-[#2563EB]">Gemini AI</span>
                </h1>
                <p className="text-sm text-[#64748B] max-w-2xl mx-auto leading-relaxed">
                  Report potholes, streetlights, leaks or safety hazards. Vision AI instantly categorizes reports, verifies locations, and routes tasks automatically to municipal departments.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
                  <button 
                    onClick={() => handleNavigate(currentUser ? 'citizen-dashboard' : 'auth')}
                    className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-150 shadow-sm"
                  >
                    <span>Get Started as Citizen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setAuthEmail('authority@civix.ai');
                      handleNavigate('auth');
                    }}
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] font-semibold text-sm px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-150 shadow-sm"
                  >
                    <span>Access Authority Console</span>
                  </button>
                </div>
              </div>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {[
                  { value: '5 mins', label: 'AI routing speed' },
                  { value: '1,240+', label: 'Verified Reports' },
                  { value: '98.2%', label: 'Category Accuracy' },
                  { value: '24/7', label: 'Active Ward Audit' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-[#E2E8F0] rounded-xl p-5 text-center shadow-sm">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#2563EB] font-mono">{stat.value}</h3>
                    <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Features Layout */}
              <div className="space-y-6">
                <div className="text-center max-w-xl mx-auto">
                  <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">The 8 AI Agents Driving Civix AI</h2>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">An autonomous network of specialized systems ensuring high reliability and zero complaint backlogs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Vision Agent', desc: 'Analyzes user-submitted photographs, identifies anomalies, and assesses detailed damage.' },
                    { title: 'Duplicate Engine', desc: 'Applies Haversine distance rules to prevent coordinate clashing and merge concurrent complaints.' },
                    { title: 'Routing Agent', desc: 'Dispatches tickets instantly to corresponding departmental heads without paper friction.' },
                    { title: 'Escalation Auditor', desc: 'Ranks delayed tasks and increments severity alerts automatically to senior officers.' },
                    { title: 'Geo Intelligence', desc: 'Coordinates lat/lng lookups to map verified municipal crossways.' },
                    { title: 'Severity Ranker', desc: 'Flags critical public risks instantly to expedite response team deployment.' },
                    { title: 'Risk Forecast Agent', desc: 'Monitors density clusters of civic activities and predicts structural breakdowns.' },
                    { title: 'Advisor Agent', desc: 'Powers Civix Copilot to provide custom charts, insights, and summaries for officers.' }
                  ].map((agent, idx) => (
                    <div key={idx} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] font-bold flex items-center justify-center text-xs mb-4">
                        {idx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A]">{agent.title}</h4>
                      <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{agent.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Auth View */}
          {currentView === 'auth' && (
            <div className="max-w-md mx-auto py-12" id="view-auth">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <div className="bg-[#2563EB] text-white w-11 h-11 rounded-lg flex items-center justify-center mx-auto shadow-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0F172A]">
                    {isRegistering ? 'Create Civic Account' : 'Sign in to Civix AI'}
                  </h2>
                  <p className="text-xs text-[#94A3B8] font-medium">
                    {isRegistering ? 'Register to report issues and earn points' : 'Passwordless secure portal for citizens & officials'}
                  </p>
                </div>

                {/* Form Selection Toggles */}
                {!isRegistering && (
                  <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl text-[10px] font-bold">
                    <button 
                      onClick={() => setAuthEmail('citizen@civix.ai')}
                      className={`py-1.5 rounded-lg transition-colors ${authEmail === 'citizen@civix.ai' ? 'bg-white text-[#2563EB] shadow-sm border border-[#E2E8F0]' : 'text-[#475569]'}`}
                    >
                      Citizen Byp
                    </button>
                    <button 
                      onClick={() => setAuthEmail('authority@civix.ai')}
                      className={`py-1.5 rounded-lg transition-colors ${authEmail === 'authority@civix.ai' ? 'bg-white text-[#2563EB] shadow-sm border border-[#E2E8F0]' : 'text-[#475569]'}`}
                    >
                      Authority Byp
                    </button>
                    <button 
                      onClick={() => setAuthEmail('admin@civix.ai')}
                      className={`py-1.5 rounded-lg transition-colors ${authEmail === 'admin@civix.ai' ? 'bg-white text-[#2563EB] shadow-sm border border-[#E2E8F0]' : 'text-[#475569]'}`}
                    >
                      Admin Byp
                    </button>
                  </div>
                )}

                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                  {isRegistering && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Amit Roy"
                          className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors bg-white text-[#0F172A]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Ward Name</label>
                        <select 
                          value={authWard}
                          onChange={(e) => setAuthWard(e.target.value)}
                          className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#2563EB] transition bg-white text-[#0F172A]"
                        >
                          <option>Ward 12 - Indiranagar</option>
                          <option>Ward 15 - Halasuru</option>
                          <option>Ward 22 - Koramangala</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Register as</label>
                        <select 
                          value={authRole}
                          onChange={(e: any) => setAuthRole(e.target.value)}
                          className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#2563EB] transition bg-white text-[#0F172A]"
                        >
                          <option value="citizen">Citizen</option>
                          <option value="authority">Department Authority</option>
                          <option value="admin">System Administrator</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. citizen@civix.ai"
                      className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors bg-white text-[#0F172A]"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs py-2.5 rounded-lg transition-colors uppercase tracking-wider shadow-sm"
                  >
                    {isRegistering ? 'Create Account' : 'Authenticate Security Core'}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-xs text-[#2563EB] font-semibold hover:underline"
                  >
                    {isRegistering ? 'Already have an account? Sign In' : 'New to Civix AI? Create Account'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Citizen Dashboard View */}
          {currentView === 'citizen-dashboard' && currentUser && (
            <div className="space-y-8" id="view-citizen-dashboard">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[#0F172A]">Citizen Command Console</h1>
                  <p className="text-xs text-[#64748B] mt-1">Submit visual evidence and verify municipal reports to build a safer neighborhood.</p>
                </div>
                <button 
                  onClick={() => handleNavigate('report-issue')}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors duration-150 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Report New Incident</span>
                </button>
              </div>

              {/* Points & Gamification Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1E293B] text-white rounded-2xl p-6 shadow-sm flex justify-between items-center relative overflow-hidden">
                  <div className="space-y-3 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Reward Balance</span>
                    <div>
                      <h3 className="text-3xl font-bold font-mono">{currentUser.points}</h3>
                      <p className="text-xs text-gray-400 mt-1">Points available to redeem</p>
                    </div>
                  </div>
                  <Award className="w-16 h-16 text-white/10 absolute -right-3 -bottom-3 stroke-1" />
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Badge Tier Achievement</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#0F172A] truncate">{currentUser.badge}</h4>
                      <p className="text-xs text-[#64748B] mt-0.5 truncate">Top 5% of active community</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Daily Civic Mission</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#475569]">Verify 3 nearby issues</span>
                      <span className="text-[#2563EB]">1/3</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#2563EB] h-full w-1/3" />
                    </div>
                    <p className="text-[10px] text-[#94A3B8] font-medium">Reward: +25 Points & Double XP</p>
                  </div>
                </div>
              </div>

              {/* Unresolved / Urgent Neighborhood Feed */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Urgent Reports in {currentUser.ward}
                  </h3>
                  <button onClick={() => handleNavigate('community-feed')} className="text-xs font-bold text-[#2563EB] hover:underline">
                    See Community Feed
                  </button>
                </div>

                {issues.filter(i => i.status !== 'Resolved').length === 0 ? (
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center text-[#94A3B8] text-xs">
                    No active complaints in your ward. You are clean! 🌳
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {issues.filter(i => i.status !== 'Resolved').slice(0, 3).map(issue => (
                      <IssueCard 
                        key={issue.id} 
                        issue={issue} 
                        currentUser={currentUser}
                        onVerify={(id, vote) => handleVerifyIssue(id, vote)}
                        onSelect={(issue) => setActiveIssueDetail(issue)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Report Issue View */}
          {currentView === 'report-issue' && currentUser && (
            <div className="max-w-3xl mx-auto py-4" id="view-report-issue">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-[#0F172A]">Intelligent Civic Incident Report</h1>
                  <p className="text-xs text-[#64748B] mt-1">Upload a photo first! Gemini Vision AI will scan the picture to generate high-fidelity titles, categorization and severities instantly.</p>
                </div>

                <form onSubmit={handleReportIssueSubmit} className="space-y-6">
                  {/* Photo Evidence upload */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">Photo Evidence</span>
                    <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 hover:bg-[#F8FAFC] transition text-center relative flex flex-col items-center">
                      {newImage ? (
                        <div className="relative w-full max-h-60 rounded-xl overflow-hidden">
                          <img src={newImage} alt="Uploaded evidence" className="w-full h-full object-contain mx-auto" />
                          <button 
                            type="button"
                            onClick={() => { setNewImage(''); setAiAnalysisResult(null); }}
                            className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg text-xs font-bold transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="bg-[#EFF6FF] text-[#2563EB] p-4 rounded-full mb-3">
                            <Camera className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-700">Drag & drop your photograph here, or click to browse</p>
                          <p className="text-[10px] text-[#94A3B8] mt-1 font-medium">Supports JPG, PNG, WEBP files up to 10MB</p>
                          <p className="text-[10px] text-[#2563EB] mt-2 font-bold flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1" /> Mobile Camera Supported
                          </p>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                    {sizeWarning && (
                      <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                        ⚠️ Large image detected! Your image is over 5MB. Processing times might be slightly slower.
                      </div>
                    )}
                  </div>

                  {/* AI analyzing skeleton status */}
                  {isAnalyzingImage && (
                    <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-5 rounded-xl flex items-center space-x-3.5">
                      <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-[#1E3A8A]">Gemini Vision AI Agent is assessing damage...</h4>
                        <p className="text-[10px] text-blue-600 mt-0.5">Calculating severity thresholds and mapping optimal response routing...</p>
                      </div>
                    </div>
                  )}

                  {/* Fields Container */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Suggested Incident Title</label>
                      <input 
                        type="text" 
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Major water logging on Cross Street"
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors bg-white text-[#0F172A]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Incident Category</label>
                        <select 
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#2563EB] transition bg-white text-[#0F172A]"
                        >
                          <option>Roads</option>
                          <option>Water</option>
                          <option>Electricity</option>
                          <option>Waste</option>
                          <option>Public Safety</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Severity Level</label>
                        <select 
                          value={newSeverity}
                          onChange={(e) => setNewSeverity(e.target.value)}
                          className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#2563EB] transition bg-white text-[#0F172A]"
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Ward</label>
                        <select 
                          value={newWard}
                          onChange={(e) => setNewWard(e.target.value)}
                          className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#2563EB] transition bg-white text-[#0F172A]"
                        >
                          <option>Ward 12 - Indiranagar</option>
                          <option>Ward 15 - Halasuru</option>
                          <option>Ward 22 - Koramangala</option>
                        </select>
                      </div>
                    </div>

                    {/* Geolocation Coordinate trigger */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Spatial Geotagging</span>
                        <button 
                          type="button" 
                          onClick={triggerAutoLocation}
                          className="bg-[#EFF6FF] text-[#2563EB] hover:bg-blue-100 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[#BFDBFE] transition"
                        >
                          Auto GPS Locating
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400">Latitude</label>
                          <input type="number" step="any" required value={newLat} onChange={(e)=>setNewLat(Number(e.target.value))} className="w-full border border-[#E2E8F0] bg-white rounded-lg p-2.5 mt-1 font-mono text-[11px] text-[#0F172A]" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400">Longitude</label>
                          <input type="number" step="any" required value={newLng} onChange={(e)=>setNewLng(Number(e.target.value))} className="w-full border border-[#E2E8F0] bg-white rounded-lg p-2.5 mt-1 font-mono text-[11px] text-[#0F172A]" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block">Nearby Landmark / Crossing Reference</label>
                        <input 
                          type="text" 
                          value={newLandmark} 
                          onChange={(e)=>setNewLandmark(e.target.value)} 
                          placeholder="e.g. Opposite Toit Brewpub, near pillar 120"
                          className="w-full border border-[#E2E8F0] bg-white rounded-lg p-2.5 mt-1 text-xs text-[#0F172A]" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Describe the incident</label>
                      <textarea 
                        rows={4}
                        required
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Detail exactly what the issue is, why it is dangerous, and what immediate action is required..."
                        className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#2563EB] transition bg-white text-[#0F172A]"
                      />
                    </div>
                  </div>

                  {/* AI diagnostics information card if analyzed */}
                  {aiAnalysisResult && (
                    <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl space-y-3.5">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h4 className="text-xs font-bold text-indigo-900">Gemini AI Diagnostics Log</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-slate-600">
                        <div>Risk Factors: <span className="font-bold text-indigo-700">{aiAnalysisResult.riskFactors?.join(', ')}</span></div>
                        <div>Urgency Index: <span className="font-bold text-indigo-700">{aiAnalysisResult.urgency}</span></div>
                        <div>Est. Repair Time: <span className="font-bold text-indigo-700">{aiAnalysisResult.estimatedRepairTime}</span></div>
                        <div>Confidence Score: <span className="font-bold text-indigo-700 font-mono">{aiAnalysisResult.confidence}%</span></div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs py-3 rounded-lg uppercase tracking-wider transition-colors duration-150 shadow-sm"
                  >
                    Submit Ticket to Department
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 5. My Reports View */}
          {currentView === 'my-reports' && currentUser && (
            <div className="space-y-8" id="view-my-reports">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A]">My Registered Incidents</h1>
                <p className="text-xs text-[#64748B] mt-1">Track ticket routing, official departmental messages, and community upvotes.</p>
              </div>

              {issues.filter(i => i.reportedBy === currentUser.uid).length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center text-slate-400 space-y-4 shadow-sm">
                  <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                  <p className="text-xs">You have not submitted any reports yet.</p>
                  <button 
                    onClick={() => handleNavigate('report-issue')}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2 rounded-lg inline-block transition-colors duration-150 shadow-sm"
                  >
                    Report First Issue
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {issues.filter(i => i.reportedBy === currentUser.uid).map(issue => (
                    <IssueCard 
                      key={issue.id} 
                      issue={issue} 
                      currentUser={currentUser}
                      onVerify={(id, vote) => handleVerifyIssue(id, vote)}
                      onSelect={(issue) => setActiveIssueDetail(issue)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. Community Feed View */}
          {currentView === 'community-feed' && currentUser && (
            <div className="space-y-8" id="view-community-feed">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[#0F172A]">Civic Community Board</h1>
                  <p className="text-xs text-[#64748B] mt-1">Recent municipal failures flagged by neighbors. Upvote to expedite municipal action.</p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search issues..."
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved'].map((stat) => (
                  <button
                    key={stat}
                    onClick={() => setStatusFilter(stat)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                      statusFilter === stat 
                        ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm' 
                        : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-slate-50'
                    }`}
                  >
                    {stat}
                  </button>
                ))}
              </div>

              {activeIssuesList.length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center text-[#94A3B8] text-xs shadow-sm">
                  No issues match the search filters. Try resetting terms.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeIssuesList.map(issue => (
                    <IssueCard 
                      key={issue.id} 
                      issue={issue} 
                      currentUser={currentUser}
                      onVerify={(id, vote) => handleVerifyIssue(id, vote)}
                      onSelect={(issue) => setActiveIssueDetail(issue)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. Live Map View */}
          {currentView === 'live-map' && currentUser && (
            <div className="space-y-6" id="view-live-map">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A]">Active Hotspot Map</h1>
                <p className="text-xs text-[#64748B] mt-1">Interactive spatial clustering showing hot spots and neighborhood complaints.</p>
              </div>

              <LiveMapDisplay issues={issues} onSelectIssue={setActiveIssueDetail} />
            </div>
          )}

          {/* 8. Authority Dashboard View */}
          {currentView === 'authority-dashboard' && currentUser && (
            <div className="space-y-8" id="view-authority-dashboard">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-5">
                <div>
                  <h1 className="text-xl font-bold text-[#0F172A]">Municipal Administration Panel</h1>
                  <p className="text-xs text-[#64748B] mt-1">Review verified community complaints, allocate department forces, and audit overdue items.</p>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button 
                    onClick={triggerEscalationCheck}
                    disabled={isSyncingEscalations}
                    className="w-full sm:w-auto bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-150"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingEscalations ? 'animate-spin' : ''}`} />
                    <span>Run Escalation Audit</span>
                  </button>
                </div>
              </div>

              {/* Grid of Boards (Kanban Board) */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Task Allocation Pipeline</h3>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-x-auto min-w-[1000px] pb-4">
                  
                  {/* Columns */}
                  {['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved'].map(col => {
                    const colIssues = issues.filter(i => i.status === col);
                    return (
                      <div key={col} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col space-y-4 h-[550px] overflow-y-auto shadow-2xs">
                        <div className="flex justify-between items-center px-2">
                          <span className="text-xs font-bold text-[#0F172A]">{col}</span>
                          <span className="bg-[#CBD5E1]/30 text-[#475569] text-[9px] font-semibold px-2 py-0.5 rounded-md">
                            {colIssues.length}
                          </span>
                        </div>

                        <div className="flex-1 space-y-3">
                          {colIssues.map(issue => (
                            <div 
                              key={issue.id}
                              onClick={() => setActiveIssueDetail(issue)}
                              className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] cursor-pointer hover:border-[#2563EB] hover:shadow-xs transition-all duration-150 space-y-3"
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-50 border border-[#E2E8F0] text-slate-600 rounded-md">
                                  {issue.category}
                                </span>
                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                                  issue.severity === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                                }`}>
                                  {issue.severity}
                                </span>
                              </div>
                              <h4 className="text-xs font-semibold text-[#0F172A] line-clamp-2 leading-snug">{issue.title}</h4>
                              <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-medium border-t border-[#F1F5F9] pt-2 mt-2">
                                <span>{issue.ward.split(' ')[0]}</span>
                                <span>{issue.verifications.yes} upvotes</span>
                              </div>
                            </div>
                          ))}
                          {colIssues.length === 0 && (
                            <div className="text-center py-20 text-[10px] text-slate-400 font-semibold">
                              Empty column
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            </div>
          )}

          {/* 9. Issue Management View */}
          {currentView === 'manage-issues' && currentUser && (
            <div className="space-y-8" id="view-manage-issues">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A]">Complaint Master Log</h1>
                <p className="text-xs text-[#64748B] mt-1">Audit, modify coordinates, update departments, and inspect duplicate reports in bulk.</p>
              </div>

              {/* Master filters block */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block">Search text</span>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e)=>setSearchTerm(e.target.value)}
                    placeholder="Search titles..." 
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors text-[#0F172A]" 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block">Category</span>
                  <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)} className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors text-[#0F172A]">
                    <option>All</option>
                    <option>Roads</option>
                    <option>Water</option>
                    <option>Electricity</option>
                    <option>Waste</option>
                    <option>Public Safety</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block">Severity</span>
                  <select value={severityFilter} onChange={(e)=>setSeverityFilter(e.target.value)} className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors text-[#0F172A]">
                    <option>All</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block">Status</span>
                  <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors text-[#0F172A]">
                    <option>All</option>
                    <option>Reported</option>
                    <option>Verified</option>
                    <option>Assigned</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>
              </div>

              {/* Grid of full cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeIssuesList.map(issue => (
                  <IssueCard 
                    key={issue.id}
                    issue={issue}
                    currentUser={currentUser}
                    onVerify={(id, vote) => handleVerifyIssue(id, vote)}
                    onSelect={(issue) => setActiveIssueDetail(issue)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 10. Analytics View */}
          {currentView === 'analytics' && currentUser && (
            <div className="space-y-8" id="view-analytics">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A]">Civic Intelligence Dashboard</h1>
                <p className="text-xs text-[#64748B] mt-1">Detailed charts analyzing department efficiency, cluster density, and monthly activity cycles.</p>
              </div>

              <AnalyticsCharts issues={issues} departments={departments} />
            </div>
          )}

          {/* 11. Civix Copilot View */}
          {currentView === 'copilot' && currentUser && (
            <div className="space-y-6" id="view-copilot">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A] font-sans">Municipal Copilot Advisor</h1>
                <p className="text-xs text-[#64748B] mt-1">Grounding-model assistant analyzing complaint loads and drafting formal department papers in real time.</p>
              </div>

              <CopilotChat onSendMessage={handleCopilotSend} />
            </div>
          )}

          {/* 12. Notifications View */}
          {currentView === 'notifications' && currentUser && (
            <div className="max-w-2xl mx-auto space-y-6" id="view-notifications">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4">
                <div>
                  <h1 className="text-xl font-bold text-[#0F172A]">My Notifications</h1>
                  <p className="text-xs text-[#64748B] mt-1">Alerts regarding your reported tickets and reward achievements.</p>
                </div>
                <button 
                  onClick={handleMarkNotificationsRead}
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                {notifications.filter(n => n.userId === currentUser.uid).length === 0 ? (
                  <div className="p-16 text-center text-[#94A3B8] text-xs">
                    You're all caught up! No notifications. 🎉
                  </div>
                ) : (
                  notifications.filter(n => n.userId === currentUser.uid).map(n => (
                    <div 
                      key={n.id}
                      className={`p-5 flex items-start space-x-4 hover:bg-slate-50 transition cursor-pointer ${!n.read ? 'bg-[#EFF6FF]/40' : ''}`}
                    >
                      <div className="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] mt-0.5">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-[#0F172A]">{n.title}</h4>
                        <p className="text-xs text-[#475569] mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-[#94A3B8] mt-2 block">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 13. Profile View */}
          {currentView === 'profile' && currentUser && (
            <div className="max-w-4xl mx-auto space-y-8" id="view-profile">
              {/* Profile Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-bold flex items-center justify-center text-2xl shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left space-y-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h2 className="text-xl font-bold text-[#0F172A]">{currentUser.name}</h2>
                    <span className="inline-block px-3 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold uppercase rounded-lg tracking-wider">
                      🏆 {currentUser.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] font-medium">Logged in via: {currentUser.email} • {currentUser.ward}</p>
                  <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Role: {currentUser.role}</p>
                </div>
                <div className="bg-[#1E293B] text-white rounded-xl px-6 py-4 text-center shrink-0 shadow-sm border border-[#334155]">
                  <h3 className="text-2xl font-black font-mono">{currentUser.points}</h3>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300 mt-0.5">Civix Points</p>
                </div>
              </div>

              {/* Gamification / Leaderboard */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Leaderboard & Ward Standings
                  </h3>
                  <p className="text-[11px] text-[#64748B] mt-1">Top-ranking citizen helpers earning rewards for community reports.</p>
                </div>

                <div className="divide-y divide-[#F1F5F9]">
                  {users.sort((a,b)=>b.points - a.points).map((u, idx) => (
                    <div key={u.uid} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-black font-mono text-[#94A3B8] w-6">#{idx + 1}</span>
                        <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-slate-700 font-bold flex items-center justify-center text-xs border border-[#E2E8F0]">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A]">{u.name} {u.uid === currentUser.uid && <span className="text-[#2563EB] font-semibold">(You)</span>}</h4>
                          <span className="text-[9px] font-medium text-[#94A3B8] block">{u.ward}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100 uppercase tracking-wider">{u.badge}</span>
                        <span className="text-xs font-black font-mono text-[#0F172A]">{u.points} PTS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 14. Admin Panel View */}
          {currentView === 'admin' && currentUser && currentUser.role === 'admin' && (
            <div className="space-y-8" id="view-admin">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A]">System Control Panel</h1>
                <p className="text-xs text-[#64748B] mt-1">Superuser parameters, permission adjustments, and database wipe tools.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Seed reset card */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-[#0F172A]">Database & State Control</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed font-medium">Wipe active complaint records, reset gamification points to zero, and restore the default five high-fidelity demo reports.</p>
                  <button 
                    onClick={handleResetDatabase}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-150 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear & Seed Database</span>
                  </button>
                </div>

                {/* Users Roles administration */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-[#0F172A]">Modify User Roles</h3>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {users.map(u => (
                      <div key={u.uid} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-[#0F172A]">{u.name}</p>
                          <p className="text-[10px] text-[#94A3B8]">{u.email}</p>
                        </div>
                        <select 
                          value={u.role}
                          onChange={(e: any) => handleUpdateUserRole(u.uid, e.target.value)}
                          className="border border-[#E2E8F0] bg-white rounded-lg p-1.5 font-semibold text-[10px] text-[#0F172A]"
                        >
                          <option value="citizen">Citizen</option>
                          <option value="authority">Authority</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Predictive Alert Simulator for Admin/Authority */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Risk Prediction Core Agent</h3>
                    <p className="text-xs text-[#64748B] mt-1">Scans ward report densities and runs predictive simulations for upcoming infrastructure hazards.</p>
                  </div>
                  <button 
                    onClick={triggerPredictiveAnalytics}
                    disabled={isGeneratingPredictions}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-150 shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGeneratingPredictions ? 'animate-spin' : ''}`} />
                    <span>Run Gemini Forecast</span>
                  </button>
                </div>

                {predictiveSummary && (
                  <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl text-xs text-slate-750 leading-relaxed font-semibold">
                    <span className="font-bold text-indigo-950 block mb-1.5 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" /> Executive Forecast Briefing:
                    </span>
                    {predictiveSummary}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictiveAlerts.map((alert, idx) => (
                    <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2.5 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {alert.riskLevel} Risk Forecast
                        </span>
                        <span className="text-[10px] font-bold font-mono text-[#94A3B8]">{alert.likelihood} likelihood</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#0F172A]">{alert.zone} • {alert.category} Breakdown</h4>
                      <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">{alert.recommendation}</p>
                      <span className="text-[9px] font-semibold text-[#94A3B8] block pt-1 border-t border-slate-100">
                        Action Frame: {alert.timeframe}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- 15. MODAL / DIALOG COMPONENT: INCIDENT DETAILS --- */}
      {activeIssueDetail && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col md:flex-row">
            {/* Left Image / Location panel */}
            <div className="w-full md:w-1/2 bg-slate-50 flex flex-col justify-between relative min-h-[300px]">
              {activeIssueDetail.imageUrl ? (
                <img 
                  src={activeIssueDetail.imageUrl} 
                  alt={activeIssueDetail.title} 
                  className="w-full h-full object-cover min-h-[300px]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                  <Building className="w-16 h-16 stroke-1 text-slate-300" />
                  <span className="text-xs mt-3 font-semibold">No photograph evidence uploaded</span>
                </div>
              )}
              {/* Geolocation Coordinate Panel overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-4 rounded-xl text-white space-y-1 border border-slate-800">
                <span className="text-[8px] font-bold uppercase text-blue-400 block">Incident Coordinates</span>
                <p className="text-xs font-bold font-mono">Lat: {activeIssueDetail.latitude}, Lng: {activeIssueDetail.longitude}</p>
                <p className="text-[10px] text-slate-300 truncate">{activeIssueDetail.address}</p>
              </div>
            </div>

            {/* Right Information Feed */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
              <div>
                {/* Header Actions */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[9px] font-bold uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                      {activeIssueDetail.category}
                    </span>
                    <span className="text-[9px] font-bold uppercase bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md ml-2 border border-slate-200">
                      Severity: {activeIssueDetail.severity} ({activeIssueDetail.severityScore}/100)
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveIssueDetail(null)}
                    className="text-slate-400 hover:text-[#0F172A] font-semibold text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-[#0F172A] leading-snug">{activeIssueDetail.title}</h2>
                <p className="text-xs text-[#475569] mt-3 leading-relaxed border-b border-[#F1F5F9] pb-4 font-medium">
                  {activeIssueDetail.description}
                </p>

                {/* Metadata details list */}
                <div className="py-4 space-y-2 border-b border-[#F1F5F9] text-xs">
                  <p className="text-[#64748B] flex items-center justify-between font-medium">
                    <span>Department Allocated:</span>
                    <span className="font-semibold text-[#0F172A]">{activeIssueDetail.department}</span>
                  </p>
                  <p className="text-[#64748B] flex items-center justify-between font-medium">
                    <span>Current Pipeline Status:</span>
                    <span className="font-semibold text-[#2563EB] uppercase text-[10px]">{activeIssueDetail.status}</span>
                  </p>
                  <p className="text-[#64748B] flex items-center justify-between font-medium">
                    <span>Community Upvotes:</span>
                    <span className="font-semibold text-[#0F172A]">{activeIssueDetail.verifications?.yes || 1}</span>
                  </p>
                  <p className="text-[#64748B] flex items-center justify-between font-medium">
                    <span>Escalation Level:</span>
                    <span className="font-semibold text-rose-600">Level {activeIssueDetail.escalationLevel}</span>
                  </p>
                </div>

                {/* Comment log feed */}
                <div className="py-4 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Activity Log & Message Feed</h4>
                  
                  <div className="space-y-3.5 max-h-44 overflow-y-auto">
                    {activeIssueDetail.comments?.map(cmt => (
                      <div key={cmt.id} className={`p-3.5 rounded-lg text-xs space-y-1 border ${cmt.isOfficial ? 'bg-amber-50/50 border-amber-200 text-slate-800' : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-700'}`}>
                        <div className="flex justify-between items-center font-bold text-slate-800">
                          <span className="flex items-center text-[11px]">
                            {cmt.userName} 
                            {cmt.isOfficial && <span className="inline-block ml-1 px-1.5 py-0.5 bg-amber-600 text-white text-[8px] font-black uppercase rounded-sm">Official</span>}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono font-medium">{new Date(cmt.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[#475569] leading-relaxed mt-0.5 text-[11px] font-medium">{cmt.text}</p>
                      </div>
                    ))}
                    {(!activeIssueDetail.comments || activeIssueDetail.comments.length === 0) && (
                      <p className="text-[11px] text-[#94A3B8] font-medium italic text-center py-4">No discussions yet. Ask a question below!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Comment input OR Authority Command logs */}
              <div className="pt-4 border-t border-[#F1F5F9] space-y-4">
                
                {/* Citizen comment input */}
                {currentUser && (
                  <form onSubmit={handleAddComment} className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      required
                      value={commentInput}
                      onChange={(e)=>setCommentInput(e.target.value)}
                      placeholder="Ask for updates or add landmark details..."
                      className="flex-1 border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors text-[#0F172A]"
                    />
                    <button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white p-2.5 rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* Authority action console */}
                {currentUser && currentUser.role !== 'citizen' && (
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl space-y-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] block">Authority Action Deck</span>
                    <div className="flex flex-wrap gap-2">
                      {['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved'].map((stat) => (
                        <button
                          key={stat}
                          onClick={() => handleUpdateStatus(activeIssueDetail.id, stat, `Status moved to: ${stat}`)}
                          className="text-[10px] font-bold bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB] px-3 py-1.5 rounded-lg transition-all duration-150 shadow-2xs"
                        >
                          {stat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
