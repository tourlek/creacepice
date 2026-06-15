import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import CrmTab from "./components/CrmTab";
import SopTab from "./components/SopTab";
import AiTab from "./components/AiTab";
import DocsTab from "./components/DocsTab";
import ScriptsTab from "./components/ScriptsTab";
import CampaignsTab from "./components/CampaignsTab";
import { TabId, KOL, Campaign } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("crm");
  const [kols, setKols] = useState<KOL[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch KOLs and Campaigns from database
  useEffect(() => {
    Promise.all([
      fetch("/api/kols").then((res) => res.json()),
      fetch("/api/campaigns").then((res) => res.json()),
      fetch("/api/influencers").then((res) => res.json())
    ])
      .then(([kolsData, campsData, infsData]) => {
        setKols(kolsData);
        setCampaigns(campsData);
        setInfluencers(infsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load ecosystem data:", err);
        setLoading(false);
      });
  }, []);

  // Determine which tab to render based on selection
  const renderTabContent = () => {
    switch (activeTab) {
      case "crm":
        return (
          <CrmTab
            kols={kols}
            setKols={setKols}
            campaigns={campaigns}
            influencers={influencers}
            setInfluencers={setInfluencers}
          />
        );
      case "campaigns":
        return (
          <CampaignsTab 
            campaigns={campaigns}
            setCampaigns={setCampaigns}
            influencers={influencers}
            setKols={setKols}
          />
        );
      case "sop":
        return <SopTab />;
      case "ai":
        return <AiTab />;
      case "docs":
        return <DocsTab kols={kols} />;
      case "scripts":
        return <ScriptsTab />;
      default:
        return (
          <div className="text-center py-20 text-slate-400">
            Tab not recognized or currently under construction.
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Campaign Ecosystem…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen font-sans flex relative overflow-hidden" id="app-root-layout">
      {/* Decorative premium background glows */}
      <div className="stripe-bg-glow top-[-100px] left-[100px]" />
      <div className="stripe-bg-glow bottom-[-150px] right-[-50px]" />

      {/* Global Navigation Layout Left Side rail */}
      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Main workspace section right side of sidebar */}
      <main className="ml-20 flex-1 p-8 md:p-10 min-h-screen" id="app-workspace-main">
        {renderTabContent()}
      </main>

      {/* Persistent global synced footer state */}
      <div 
        id="global-sync-footer-indicator"
        className="fixed bottom-6 right-6 flex items-center gap-2 px-3.5 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-800 shadow-2xl z-50 hover:scale-105 transition-transform"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Console Active: Synced</span>
      </div>
    </div>
  );
}
