import React, { useState, useMemo } from "react";
import { Campaign, KOL, KOLPlatform, KOLStatus, Influencer, SocialAccount } from "../types";
import { Search, Plus, Phone, Calendar as CalendarIcon, FileEdit, Trash2, Mail, MapPin, MessageSquare, ExternalLink, Filter, TrendingUp, CheckCircle, Clock, Link as LinkIcon, AlertCircle, ChevronDown, Check, ChevronsUpDown, Instagram, Youtube, Facebook } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
  </svg>
);

const PLATFORM_ICONS = {
  [KOLPlatform.TIKTOK]: <TikTokIcon className="w-3.5 h-3.5" />,
  [KOLPlatform.INSTAGRAM]: <Instagram className="w-3.5 h-3.5" />,
  [KOLPlatform.YOUTUBE]: <Youtube className="w-3.5 h-3.5" />,
  [KOLPlatform.FACEBOOK]: <Facebook className="w-3.5 h-3.5" />
};

const PLATFORM_COLORS = {
  [KOLPlatform.TIKTOK]: "bg-black text-white hover:bg-black/90",
  [KOLPlatform.INSTAGRAM]: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:opacity-90",
  [KOLPlatform.YOUTUBE]: "bg-red-600 text-white hover:bg-red-700",
  [KOLPlatform.FACEBOOK]: "bg-blue-600 text-white hover:bg-blue-700"
};

interface CrmTabProps {
  kols: KOL[];
  setKols: React.Dispatch<React.SetStateAction<KOL[]>>;
  campaigns: Campaign[];
  influencers: Influencer[];
  setInfluencers: React.Dispatch<React.SetStateAction<Influencer[]>>;
}

export default function CrmTab({ kols, setKols, campaigns, influencers, setInfluencers }: CrmTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [campaignFilter, setCampaignFilter] = useState<string>("ALL");

  // Modal State for Master Profile
  const [modalMode, setModalMode] = useState<"add_master" | "edit_master" | "edit_assignment" | null>(null);
  const [editingMasterId, setEditingMasterId] = useState<string | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);

  // Form State Master Profile
  const [formName, setFormName] = useState("");
  const [formNickname, setFormNickname] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLineId, setFormLineId] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formBehavioralRemark, setFormBehavioralRemark] = useState("");
  const [formDealConditions, setFormDealConditions] = useState("");
  const [formBaseClientPrice, setFormBaseClientPrice] = useState(0);
  const [formBaseNetCost, setFormBaseNetCost] = useState(0);
  const [formSocials, setFormSocials] = useState<SocialAccount[]>([]);

  // Form State Assignment (Edit only)
  const [formStatus, setFormStatus] = useState<KOLStatus>(KOLStatus.CONTRACT);
  const [formClientPrice, setFormClientPrice] = useState(0);
  const [formNetCost, setFormNetCost] = useState(0);
  const [formDraftDeadline, setFormDraftDeadline] = useState<Date | undefined>(undefined);
  const [formLiveDeadline, setFormLiveDeadline] = useState<Date | undefined>(undefined);
  const [formDraftLink, setFormDraftLink] = useState("");
  const [formLiveLink, setFormLiveLink] = useState("");
  const [formAssignedPlatform, setFormAssignedPlatform] = useState<KOLPlatform>(KOLPlatform.TIKTOK);

  // Filtered KOLs
  const filteredKols = useMemo(() => {
    return kols.filter((k) => {
      const matchSearch =
        k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || k.status === statusFilter;
      const matchCampaign = campaignFilter === "ALL" || k.campaignId === campaignFilter;
      return matchSearch && matchStatus && matchCampaign;
    });
  }, [kols, searchTerm, statusFilter, campaignFilter]);

  const handleOpenAddMaster = () => {
    setModalMode("add_master");
    setEditingMasterId(null);
    setFormName("");
    setFormNickname("");
    setFormPhone("");
    setFormEmail("");
    setFormLineId("");
    setFormAddress("");
    setFormBehavioralRemark("");
    setFormDealConditions("");
    setFormBaseClientPrice(0);
    setFormBaseNetCost(0);
    setFormSocials([]);
  };

  const handleOpenEditMaster = (inf: Influencer) => {
    setModalMode("edit_master");
    setEditingMasterId(inf.id);
    setFormName(inf.name);
    setFormNickname(inf.nickname || "");
    setFormPhone(inf.phone || "");
    setFormEmail(inf.email || "");
    setFormLineId(inf.lineId || "");
    setFormAddress(inf.address || "");
    setFormBehavioralRemark(inf.behavioralRemark || "");
    setFormDealConditions(inf.dealConditions || "");
    setFormBaseClientPrice(inf.baseClientPrice || 0);
    setFormBaseNetCost(inf.baseNetCost || 0);
    setFormSocials(inf.socialAccounts || []);
  };

  const handleOpenEditAssignment = (kol: KOL) => {
    setModalMode("edit_assignment");
    setEditingAssignmentId(kol.id);
    setFormStatus(kol.status);
    setFormClientPrice(kol.clientPrice);
    setFormNetCost(kol.netCost);
    setFormDraftDeadline(kol.draftDeadline ? new Date(kol.draftDeadline) : undefined);
    setFormLiveDeadline(kol.liveDeadline ? new Date(kol.liveDeadline) : undefined);
    setFormDraftLink(kol.draftLink);
    setFormLiveLink(kol.liveLink);
    setFormAssignedPlatform(kol.platform);
  };

  const handleAddSocial = () => {
    setFormSocials(prev => [...prev, { platform: KOLPlatform.TIKTOK, username: "", profileUrl: "", followers: 0 }]);
  };

  const handleUpdateSocial = (index: number, field: keyof SocialAccount, value: any) => {
    const newSocials = [...formSocials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setFormSocials(newSocials);
  };

  const handleRemoveSocial = (index: number) => {
    const newSocials = [...formSocials];
    newSocials.splice(index, 1);
    setFormSocials(newSocials);
  };

  const handleSaveMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const payload = {
      name: formName,
      nickname: formNickname,
      phone: formPhone,
      email: formEmail,
      lineId: formLineId,
      address: formAddress,
      behavioralRemark: formBehavioralRemark,
      dealConditions: formDealConditions,
      baseClientPrice: formBaseClientPrice,
      baseNetCost: formBaseNetCost,
      socialAccounts: formSocials
    };

    if (modalMode === "add_master") {
      try {
        const res = await fetch("/api/influencers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const saved = await res.json();
          setInfluencers(prev => [...prev, saved]);
        }
      } catch (err) {}
    } else if (modalMode === "edit_master" && editingMasterId) {
      try {
        const res = await fetch(`/api/influencers/${editingMasterId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const saved = await res.json();
          setInfluencers(prev => prev.map(i => i.id === editingMasterId ? saved : i));
          // Refresh kols to reflect name changes
          fetch("/api/kols").then(r => r.json()).then(setKols);
        }
      } catch (err) {}
    }
    setModalMode(null);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignmentId) return;

    const payload = {
      status: formStatus,
      clientPrice: formClientPrice,
      netCost: formNetCost,
      profit: formClientPrice - formNetCost,
      draftDeadline: formDraftDeadline ? format(formDraftDeadline, "yyyy-MM-dd") : "",
      liveDeadline: formLiveDeadline ? format(formLiveDeadline, "yyyy-MM-dd") : "",
      draftLink: formDraftLink,
      liveLink: formLiveLink,
      platform: formAssignedPlatform
    };

    try {
      const res = await fetch(`/api/kols/${editingAssignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setKols(prev => prev.map(k => k.id === editingAssignmentId ? updated : k));
      }
    } catch (err) {}
    setModalMode(null);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบ Assignment นี้?")) return;
    try {
      const res = await fetch(`/api/kols/${id}`, { method: "DELETE" });
      if (res.ok) {
        setKols(prev => prev.filter(k => k.id !== id));
      }
    } catch (err) {}
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">KOL Assignments & Ledger</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">ดูข้อมูลงานที่ได้รับมอบหมายและจัดการ Master Profile ของ KOL</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[200px] xl:max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="stripe-input pl-9 w-full" placeholder="ค้นหาชื่อ, AKA, Username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="stripe-input w-[160px]"><Filter className="w-3.5 h-3.5 mr-2 opacity-50" /><SelectValue placeholder="All Campaigns" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Campaigns</SelectItem>
              {campaigns.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="stripe-input w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {Object.values(KOLStatus).map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button onClick={handleOpenAddMaster} className="gap-2 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> New KOL Profile
          </Button>
        </div>
      </header>

      <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <Table className="w-full whitespace-nowrap">
            <TableHeader className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 h-11 w-[300px]">KOL Profile</TableHead>
                <TableHead className="font-bold text-slate-700 h-11 w-[150px]">Campaign</TableHead>
                <TableHead className="font-bold text-slate-700 h-11 w-[150px]">Status</TableHead>
                <TableHead className="font-bold text-slate-700 h-11 text-right w-[120px]">Client Price</TableHead>
                <TableHead className="font-bold text-slate-700 h-11 text-right w-[120px]">Net Cost</TableHead>
                <TableHead className="font-bold text-slate-700 h-11 text-center w-[120px]">Deadlines</TableHead>
                <TableHead className="font-bold text-slate-700 h-11 w-[150px]">Links</TableHead>
                <TableHead className="font-bold text-slate-700 h-11 text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKols.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">ไม่มีข้อมูล Assignment (ไปที่เมนู Campaigns เพื่อ Assign งาน)</TableCell>
                </TableRow>
              ) : (
                filteredKols.map((kol) => {
                  const camp = campaigns.find((c) => c.id === kol.campaignId);
                  const inf = influencers.find((i) => i.id === kol.influencerId);
                  // Helper for profile URL link
                  const hrefUrl = kol.profileUrl ? (kol.profileUrl.startsWith('http') ? kol.profileUrl : `https://${kol.profileUrl}`) : '#';

                  return (
                    <TableRow key={kol.id} className="group transition-colors hover:bg-slate-50/50">
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-base text-slate-900">{kol.nickname || kol.name}</span>
                            {kol.nickname && <span className="text-xs text-muted-foreground font-medium">({kol.name})</span>}
                          </div>
                          
                          {/* Platform Badge */}
                          <div className="flex items-center gap-2">
                            {kol.profileUrl ? (
                              <a href={hrefUrl} target="_blank" rel="noopener noreferrer" 
                                 className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm transition-transform hover:scale-105 active:scale-95", PLATFORM_COLORS[kol.platform] || "bg-slate-800 text-white")}>
                                {PLATFORM_ICONS[kol.platform] || <ExternalLink className="w-3 h-3" />}
                                <span>{kol.username || kol.name}</span>
                              </a>
                            ) : (
                              <Badge variant="outline" className={cn("gap-1.5", PLATFORM_COLORS[kol.platform] || "bg-slate-800 text-white")}>
                                {PLATFORM_ICONS[kol.platform]} {kol.username || kol.name}
                              </Badge>
                            )}
                            
                            {/* Master Profile Edit Trigger */}
                            {inf && (
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleOpenEditMaster(inf)}>
                                <FileEdit className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 font-bold">
                          {camp?.name || "Unknown"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge variant="outline" className={cn(
                          "font-bold",
                          kol.status === KOLStatus.LIVE ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          kol.status === KOLStatus.BRAND_REVIEW ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-slate-50 text-slate-700 border-slate-200"
                        )}>
                          {kol.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <div className="font-black text-slate-900 tabular-nums">฿{kol.clientPrice?.toLocaleString() || "0"}</div>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <div className="font-black text-indigo-600 tabular-nums">฿{kol.netCost?.toLocaleString() || "0"}</div>
                        <div className="text-[10px] text-emerald-600 font-bold mt-0.5">+฿{kol.profit?.toLocaleString() || "0"}</div>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <div className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-600">
                          {kol.draftDeadline && <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> Draft: {kol.draftDeadline}</div>}
                          {kol.liveDeadline && <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Live: {kol.liveDeadline}</div>}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1.5">
                          {kol.draftLink && (
                            <a href={kol.draftLink.startsWith('http') ? kol.draftLink : `https://${kol.draftLink}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-1 rounded w-fit">
                              <LinkIcon className="w-3 h-3" /> Draft
                            </a>
                          )}
                          {kol.liveLink && (
                            <a href={kol.liveLink.startsWith('http') ? kol.liveLink : `https://${kol.liveLink}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded w-fit">
                              <LinkIcon className="w-3 h-3" /> Live
                            </a>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditAssignment(kol)} className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600">
                            <FileEdit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(kol.id)} className="h-8 w-8 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MASTER PROFILE MODAL */}
      <Dialog open={modalMode === "add_master" || modalMode === "edit_master"} onOpenChange={(open) => !open && setModalMode(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{modalMode === "add_master" ? "New Master Profile" : "Edit Master Profile"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Full Name</Label><Input className="stripe-input w-full" value={formName} onChange={e => setFormName(e.target.value)} required /></div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">AKA / Nickname</Label><Input className="stripe-input w-full" value={formNickname} onChange={e => setFormNickname(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Phone</Label><Input className="stripe-input w-full" value={formPhone} onChange={e => setFormPhone(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Email</Label><Input className="stripe-input w-full" value={formEmail} onChange={e => setFormEmail(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">LINE ID</Label><Input className="stripe-input w-full" value={formLineId} onChange={e => setFormLineId(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Address / Delivery</Label><Input className="stripe-input w-full" value={formAddress} onChange={e => setFormAddress(e.target.value)} /></div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">Social Platforms</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddSocial} className="h-8 gap-1"><Plus className="w-3.5 h-3.5"/> Add Platform</Button>
              </div>
              {formSocials.map((soc, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-start border p-3 rounded-lg bg-slate-50/50">
                  <div className="w-full md:w-[150px] space-y-1">
                    <Label className="text-[10px] uppercase">Platform</Label>
                    <Select value={soc.platform} onValueChange={(val) => handleUpdateSocial(idx, 'platform', val)}>
                      <SelectTrigger className="stripe-input w-full h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.values(KOLPlatform).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] uppercase">Username</Label>
                    <Input className="stripe-input w-full h-9" value={soc.username} onChange={e => handleUpdateSocial(idx, 'username', e.target.value)} placeholder="@username" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] uppercase">Profile URL</Label>
                    <Input className="stripe-input w-full h-9" value={soc.profileUrl} onChange={e => handleUpdateSocial(idx, 'profileUrl', e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="w-full md:w-[120px] space-y-1">
                    <Label className="text-[10px] uppercase">Followers</Label>
                    <Input type="number" className="stripe-input w-full h-9" value={soc.followers} onChange={e => handleUpdateSocial(idx, 'followers', Number(e.target.value))} />
                  </div>
                  <div className="pt-5">
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSocial(idx)} className="h-9 w-9 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Default Client Price</Label><Input type="number" className="stripe-input w-full" value={formBaseClientPrice} onChange={e => setFormBaseClientPrice(Number(e.target.value))} /></div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Default Net Cost</Label><Input type="number" className="stripe-input w-full" value={formBaseNetCost} onChange={e => setFormBaseNetCost(Number(e.target.value))} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label className="text-xs text-muted-foreground">Deal Conditions / Contract Notes</Label><Input className="stripe-input w-full" value={formDealConditions} onChange={e => setFormDealConditions(e.target.value)} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label className="text-xs text-muted-foreground">Behavioral Remarks</Label><Input className="stripe-input w-full" value={formBehavioralRemark} onChange={e => setFormBehavioralRemark(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalMode(null)}>Cancel</Button>
            <Button onClick={handleSaveMaster} className="bg-indigo-600 hover:bg-indigo-700">Save Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ASSIGNMENT EDIT MODAL */}
      <Dialog open={modalMode === "edit_assignment"} onOpenChange={(open) => !open && setModalMode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Assignment Details</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={formStatus} onValueChange={(val: KOLStatus) => setFormStatus(val)}>
                <SelectTrigger className="stripe-input w-full"><SelectValue/></SelectTrigger>
                <SelectContent>{Object.values(KOLStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assigned Platform</Label>
              <Select value={formAssignedPlatform} onValueChange={(val: KOLPlatform) => setFormAssignedPlatform(val)}>
                <SelectTrigger className="stripe-input w-full"><SelectValue/></SelectTrigger>
                <SelectContent>{Object.values(KOLPlatform).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Client Price</Label><Input type="number" className="stripe-input w-full" value={formClientPrice} onChange={e => setFormClientPrice(Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Net Cost</Label><Input type="number" className="stripe-input w-full" value={formNetCost} onChange={e => setFormNetCost(Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Draft Deadline</Label><Input type="date" className="stripe-input w-full" value={formDraftDeadline ? format(formDraftDeadline, "yyyy-MM-dd") : ""} onChange={e => setFormDraftDeadline(e.target.value ? new Date(e.target.value) : undefined)} /></div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Live Deadline</Label><Input type="date" className="stripe-input w-full" value={formLiveDeadline ? format(formLiveDeadline, "yyyy-MM-dd") : ""} onChange={e => setFormLiveDeadline(e.target.value ? new Date(e.target.value) : undefined)} /></div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Draft Link</Label><Input type="url" className="stripe-input w-full" value={formDraftLink} onChange={e => setFormDraftLink(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Live Link</Label><Input type="url" className="stripe-input w-full" value={formLiveLink} onChange={e => setFormLiveLink(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalMode(null)}>Cancel</Button>
            <Button onClick={handleSaveAssignment} className="bg-indigo-600 hover:bg-indigo-700">Save Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
