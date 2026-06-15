import React, { useState } from "react";
import { Campaign, Influencer, KOL, KOLPlatform, KOLStatus } from "../types";
import { Plus, Edit, Trash2, Tag, Briefcase, Users, ChevronRight, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CampaignsTabProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  influencers: Influencer[];
  setKols: React.Dispatch<React.SetStateAction<KOL[]>>;
}

export default function CampaignsTab({ campaigns, setCampaigns, influencers, setKols }: CampaignsTabProps) {
  const [modalMode, setModalMode] = useState<"add" | "edit" | "assign_step1" | "assign_step2" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("");
  
  // Assignment states
  const [assignCampId, setAssignCampId] = useState<string | null>(null);
  const [selectedInfIds, setSelectedInfIds] = useState<string[]>([]);
  const [assignmentDetails, setAssignmentDetails] = useState<Record<string, any>>({});

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setFormName("");
    setFormBrand("");
  };

  const handleOpenEdit = (camp: Campaign) => {
    setModalMode("edit");
    setEditingId(camp.id);
    setFormName(camp.name);
    setFormBrand(camp.brand);
  };

  const handleOpenAssign = (campId: string) => {
    setAssignCampId(campId);
    setSelectedInfIds([]);
    setAssignmentDetails({});
    setModalMode("assign_step1");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบแคมเปญนี้? ข้อมูลการมอบหมายงานจะยังคงอยู่แต่ไร้แคมเปญอ้างอิง")) return;
    try {
      const response = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (response.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error deleting campaign:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formBrand) return;

    if (modalMode === "add") {
      try {
        const response = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName, brand: formBrand }),
        });
        if (response.ok) {
          const saved = await response.json();
          setCampaigns((prev) => [saved, ...prev]);
        }
      } catch (err) {}
    } else if (modalMode === "edit" && editingId) {
      try {
        const response = await fetch(`/api/campaigns/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName, brand: formBrand }),
        });
        if (response.ok) {
          const saved = await response.json();
          setCampaigns((prev) => prev.map((c) => (c.id === editingId ? saved : c)));
        }
      } catch (err) {}
    }
    setModalMode(null);
  };

  const handleNextStep2 = () => {
    const details: Record<string, any> = {};
    selectedInfIds.forEach(id => {
      const inf = influencers.find(i => i.id === id);
      if (inf) {
        const primarySoc = inf.socialAccounts?.[0];
        details[id] = {
          influencerId: inf.id,
          name: inf.name,
          platform: primarySoc?.platform || KOLPlatform.TIKTOK,
          username: primarySoc?.username || "",
          profileUrl: primarySoc?.profileUrl || "",
          followers: primarySoc?.followers || 0,
          clientPrice: inf.baseClientPrice || 0,
          netCost: inf.baseNetCost || 0,
          draftDeadline: "",
          liveDeadline: "",
          status: KOLStatus.CONTRACT
        };
      }
    });
    setAssignmentDetails(details);
    setModalMode("assign_step2");
  };

  const handleUpdateDetail = (infId: string, field: string, value: any) => {
    setAssignmentDetails(prev => ({
      ...prev,
      [infId]: { ...prev[infId], [field]: value }
    }));
  };

  const handlePlatformChange = (infId: string, platform: string) => {
    const inf = influencers.find(i => i.id === infId);
    const soc = inf?.socialAccounts?.find(s => s.platform === platform);
    setAssignmentDetails(prev => ({
      ...prev,
      [infId]: {
        ...prev[infId],
        platform: platform,
        username: soc?.username || "",
        profileUrl: soc?.profileUrl || "",
        followers: soc?.followers || 0
      }
    }));
  };

  const handleAssignSubmit = async () => {
    if (!assignCampId) return;
    try {
      const promises = Object.values(assignmentDetails).map(detail => {
        return fetch("/api/kols", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...detail,
            campaignId: assignCampId,
          })
        }).then(res => res.json());
      });
      const results = await Promise.all(promises);
      setKols(prev => [...results, ...prev]);
      setModalMode(null);
    } catch (err) {
      console.error("Failed to assign KOLs", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-none">
            Brands & Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            จัดการแบรนด์และแคมเปญ และมอบหมายงานให้ KOL ได้ทีละหลายคน
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <Card key={camp.id} className="group relative overflow-hidden transition-all hover:shadow-md border-border/50 bg-background/50 backdrop-blur-sm flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight">{camp.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium mt-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{camp.brand}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto space-y-3 pt-4 border-t border-border/50">
                <Button variant="default" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => handleOpenAssign(camp.id)}>
                  <Users className="w-4 h-4" /> Assign KOLs
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(camp)} className="flex-1 gap-1.5 h-8">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(camp.id)} className="h-8 w-12 p-0 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalMode === "add" || modalMode === "edit"} onOpenChange={(open) => !open && setModalMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="text-indigo-500 w-5 h-5" />
              {modalMode === "add" ? "New Campaign" : "Edit Campaign"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Campaign Name</Label>
              <Input className="stripe-input w-full" required value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Brand Name</Label>
              <Input className="stripe-input w-full" required value={formBrand} onChange={(e) => setFormBrand(e.target.value)} />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalMode(null)}>Cancel</Button>
              <Button type="submit">{modalMode === "add" ? "Create Campaign" : "Save Changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === "assign_step1"} onOpenChange={(open) => !open && setModalMode(null)}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Step 1: Select KOLs</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 py-4">
            {influencers.map(inf => {
              const isSelected = selectedInfIds.includes(inf.id);
              return (
                <div key={inf.id} 
                     onClick={() => {
                       if (isSelected) setSelectedInfIds(prev => prev.filter(i => i !== inf.id));
                       else setSelectedInfIds(prev => [...prev, inf.id]);
                     }}
                     className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-border hover:bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-input'}`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-bold">{inf.nickname ? `${inf.nickname} (${inf.name})` : inf.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Platforms: {inf.socialAccounts?.map(s => s.platform).join(", ") || "None"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalMode(null)}>Cancel</Button>
            <Button disabled={selectedInfIds.length === 0} onClick={handleNextStep2} className="gap-2">
              Next Step <ChevronRight className="w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalMode === "assign_step2"} onOpenChange={(open) => !open && setModalMode(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Step 2: Set Campaign Conditions</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {selectedInfIds.map(infId => {
              const inf = influencers.find(i => i.id === infId);
              const detail = assignmentDetails[infId] || {};
              return (
                <Card key={infId} className="border border-border/50 shadow-sm">
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="font-bold text-lg flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      {inf?.nickname ? `${inf.nickname} (${inf?.name})` : inf?.name}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-1.5 md:col-span-1">
                        <Label className="text-xs text-muted-foreground">Platform</Label>
                        <Select value={detail.platform} onValueChange={(val) => handlePlatformChange(infId, val)}>
                          <SelectTrigger className="stripe-input w-full h-10"><SelectValue placeholder="Platform" /></SelectTrigger>
                          <SelectContent>
                            {inf?.socialAccounts?.map(soc => (
                              <SelectItem key={soc.platform} value={soc.platform}>{soc.platform}</SelectItem>
                            ))}
                            {(!inf?.socialAccounts || inf.socialAccounts.length === 0) && (
                              <SelectItem value="TIKTOK">TIKTOK (Default)</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 md:col-span-1">
                        <Label className="text-xs text-muted-foreground">Client Price</Label>
                        <Input type="number" className="stripe-input w-full h-10" value={detail.clientPrice} onChange={(e) => handleUpdateDetail(infId, 'clientPrice', Number(e.target.value))} />
                      </div>
                      <div className="space-y-1.5 md:col-span-1">
                        <Label className="text-xs text-muted-foreground">Net Cost</Label>
                        <Input type="number" className="stripe-input w-full h-10" value={detail.netCost} onChange={(e) => handleUpdateDetail(infId, 'netCost', Number(e.target.value))} />
                      </div>
                      <div className="space-y-1.5 md:col-span-1">
                        <Label className="text-xs text-muted-foreground">Draft Deadline</Label>
                        <Input type="date" className="stripe-input w-full h-10" value={detail.draftDeadline} onChange={(e) => handleUpdateDetail(infId, 'draftDeadline', e.target.value)} />
                      </div>
                      <div className="space-y-1.5 md:col-span-1">
                        <Label className="text-xs text-muted-foreground">Live Deadline</Label>
                        <Input type="date" className="stripe-input w-full h-10" value={detail.liveDeadline} onChange={(e) => handleUpdateDetail(infId, 'liveDeadline', e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalMode("assign_step1")}>Back</Button>
            <Button onClick={handleAssignSubmit} className="bg-indigo-600 hover:bg-indigo-700">Confirm Assignments</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
