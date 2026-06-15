import React from "react";
import { TabId } from "../types";
import { 
  Users, 
  FileText, 
  Sparkles, 
  FileSpreadsheet, 
  MessageSquare,
  Settings,
  Rocket,
  Briefcase
} from "lucide-react";

interface SidebarProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
}

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  const navItems = [
    { id: "crm" as TabId, label: "CRM Tab", icon: Users, tooltip: "CRM Tracker" },
    { id: "campaigns" as TabId, label: "Campaigns", icon: Briefcase, tooltip: "Campaigns" },
    { id: "sop" as TabId, label: "SOP Manual", icon: FileSpreadsheet, tooltip: "SOP Setup" },
    { id: "ai" as TabId, label: "AI Brief", icon: Sparkles, tooltip: "AI Insight" },
    { id: "docs" as TabId, label: "Workspace Docs", icon: FileText, tooltip: "Docs" },
    { id: "scripts" as TabId, label: "Crisis Scripts", icon: MessageSquare, tooltip: "Scripts" },
  ];

  return (
    <aside 
      id="global-sidebar"
      className="fixed left-0 top-0 h-full w-20 stripe-sidebar flex flex-col items-center py-6 gap-8 z-55"
    >
      {/* Brand Launcher Icon */}
      <div 
        id="brand-logo-container"
        className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm pointer-events-none"
      >
        <Rocket className="text-white w-6 h-6 stroke-[2]" id="brand-rocket-icon" aria-hidden="true" />
      </div>

      {/* Nav Menu Items */}
      <nav className="flex flex-col gap-4 flex-1" id="sidebar-nav-container">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onChangeTab(item.id)}
              aria-label={item.tooltip}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors transition-transform duration-150 group relative cursor-pointer ${
                isActive
                  ? "bg-blue-50 text-blue-600 border border-blue-100 scale-105"
                  : "text-slate-450 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <IconComponent className="w-5 h-5" id={`nav-btn-icon-${item.id}`} aria-hidden="true" />
              
              {/* Custom tooltip helper */}
              <span 
                id={`nav-btn-tooltip-${item.id}`}
                className="absolute left-16 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity duration-150 border border-slate-800 z-50 transform translate-x-1 group-hover:translate-x-0"
              >
                {item.tooltip}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Settings Action Button */}
      <button 
        id="sidebar-settings-btn"
        aria-label="Settings"
        className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors duration-150 group relative cursor-pointer"
      >
        <Settings className="w-5 h-5" id="settings-icon" aria-hidden="true" />
        <span 
          id="tooltip-settings"
          className="absolute left-16 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity duration-150 border border-slate-800 z-50"
        >
          Settings
        </span>
      </button>
    </aside>
  );
}
