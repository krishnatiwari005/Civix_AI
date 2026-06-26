import React from 'react';
import { 
  ThumbsUp, 
  MapPin, 
  Clock, 
  ChevronRight, 
  AlertTriangle,
  Building 
} from 'lucide-react';
import { Issue, User as UserType } from '../types';

interface IssueCardProps {
  issue: Issue;
  currentUser: UserType | null;
  onVerify: (id: string, vote: 'yes' | 'no') => any;
  onSelect: (issue: Issue) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ 
  issue, 
  currentUser, 
  onVerify, 
  onSelect 
}) => {
  
  const hasVerified = currentUser ? issue.verifiedBy.includes(currentUser.uid) : false;

  // Severity styles
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-50 text-red-600 border border-red-100';
      case 'High':
        return 'bg-orange-50 text-orange-600 border border-orange-100';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
      case 'Low':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-[#E2E8F0]';
    }
  };

  // Status badges
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-50 text-green-600 border border-green-100';
      case 'In Progress':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Assigned':
        return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'Verified':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-[#E2E8F0]';
    }
  };

  // Progress Bar Steps helper
  const statuses = ['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved'];
  const currentStepIndex = statuses.indexOf(issue.status);

  // Time elapsed helper
  const formatTimeAgo = (dateStr: string) => {
    const elapsed = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(elapsed / 60000);
    const hrs = Math.floor(mins / 6000);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  return (
    <div 
      className={`bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between ${
        issue.severity === 'Critical' ? 'border-l-4 border-l-rose-500' : ''
      }`}
      id={`issue-card-${issue.id}`}
    >
      {/* Top Image (with fallback background if no imageUrl) */}
      <div className="relative h-44 bg-[#F8FAFC] flex items-center justify-center cursor-pointer" onClick={() => onSelect(issue)}>
        {issue.imageUrl ? (
          <img 
            src={issue.imageUrl} 
            alt={issue.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-center p-6 text-slate-400">
            <Building className="w-12 h-12 mx-auto stroke-1" />
            <span className="text-xs mt-2 block">No image uploaded</span>
          </div>
        )}
        <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#0F172A] border border-[#E2E8F0] shadow-sm rounded-md">
          {issue.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Badges */}
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getSeverityStyles(issue.severity)}`}>
              {issue.severity}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getStatusStyles(issue.status)}`}>
              {issue.status}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(issue)}
            className="text-base font-bold text-[#0F172A] leading-snug hover:text-[#2563EB] cursor-pointer transition line-clamp-1"
          >
            {issue.title}
          </h3>

          {/* Location & Time */}
          <div className="mt-2.5 space-y-1">
            <p className="text-xs text-[#64748B] flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
              <span className="truncate">{issue.landmark ? `${issue.landmark}, ` : ''}{issue.ward}</span>
            </p>
            <p className="text-[11px] text-[#94A3B8] flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
              <span>Reported {formatTimeAgo(issue.createdAt)} by {issue.reporterName}</span>
            </p>
          </div>
        </div>

        {/* Status Mini Progress Tracker */}
        <div className="my-5 border-t border-b border-[#E2E8F0] py-3.5">
          <div className="flex items-center justify-between">
            {statuses.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div 
                      title={step}
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        isPassed 
                          ? 'bg-[#2563EB] ring-4 ring-[#EFF6FF]' 
                          : 'bg-slate-200 border-2 border-white'
                      }`}
                    />
                    <span className="text-[8px] font-bold text-[#94A3B8] mt-1 uppercase scale-90 origin-top hidden sm:block">
                      {step.split(' ')[0]}
                    </span>
                  </div>
                  {idx < statuses.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition ${idx < currentStepIndex ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Upvote Button */}
          <button
            onClick={() => !hasVerified && onVerify(issue.id, 'yes')}
            disabled={hasVerified}
            className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              hasVerified 
                ? 'bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7] cursor-not-allowed' 
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-slate-100 border border-[#E2E8F0]'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasVerified ? 'fill-[#15803D] stroke-[#15803D]' : ''}`} />
            <span>{hasVerified ? 'Verified' : 'Verify'} ({issue.verifications.yes})</span>
          </button>

          {/* Details trigger */}
          <button 
            onClick={() => onSelect(issue)}
            className="flex items-center text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <span>Details</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
