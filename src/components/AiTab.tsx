import React, { useState } from "react";
import { Sparkles, Terminal, Check, AlertCircle, HelpCircle, AlertTriangle } from "lucide-react";
import { CreativeBrief } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AiTab() {
  const [product, setProduct] = useState("");
  const [target, setTarget] = useState("");
  const [tone, setTone] = useState("Educational & Trustworthy");
  
  const [brief, setBrief] = useState<CreativeBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [simulatedStep, setSimulatedStep] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) {
      alert("Please enter a valid Product Name & USP first.");
      return;
    }

    setIsLoading(true);
    setErrorText(null);
    setBrief(null);

    // Simulate system phases
    setSimulatedStep("Analyzing USP & audience demographics…");
    
    setTimeout(() => {
      setSimulatedStep("Synthesizing creative tone parameters…");
    }, 600);

    setTimeout(() => {
      setSimulatedStep("Formulating hook & narrative arc blueprints…");
    }, 1200);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product, target, tone }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to communicate with AI server");
      }

      const data: CreativeBrief = await response.json();
      setBrief(data);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Error generating brief. Try again.");
    } finally {
      setIsLoading(false);
      setSimulatedStep("");
    }
  };

  return (
    <div className="space-y-8" id="ai-tab-root">
      
      {/* Tab Header area */}
      <header id="ai-header">
        <h1 className="font-sans text-3xl font-extrabold text-slate-900 tracking-tight" id="ai-title">
          AI Brief Pilot
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1.5" id="ai-subtitle">
          Generate creative directions using Gemini-powered logic
        </p>
      </header>

      {/* Two-column editor and response workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="ai-workspace-grid">
        
        {/* Left column: Parameters Input block */}
        <div className="stripe-card p-7 space-y-6" id="ai-input-panel">
          <div className="border-b border-slate-100 pb-3" id="ai-panel-heading">
            <h3 className="font-bold text-slate-800 text-sm tracking-wider uppercase">
              Campaign &amp; Audience Configuration
            </h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5" id="ai-generator-form">
            {/* Input 1 */}
            <div className="space-y-2">
              <label htmlFor="ai-product-input" className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-sans">
                Product Name &amp; USP / ชื่อสินค้าและจุดขายสูงสุด
              </label>
              <input
                className="w-full stripe-input"
                name="productUsp"
                autoComplete="off"
                placeholder="e.g. Cleansing Balm - ละลายเมคอัพใน 10 วินาทีโดยไม่ต้องถูแรง…"
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                id="ai-product-input"
              />
              <p className="text-[10px] text-slate-400 font-medium">ระบุจุดเด่นสำคัญที่สุดที่คลิปวิดีโอต้องสื่อสารออกมาเด่นชัด</p>
            </div>

            {/* Input 2 */}
            <div className="space-y-2">
              <label htmlFor="ai-target-input" className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-sans">
                Target Audience / ลูกค้าเป้าหมายหลัก
              </label>
              <input
                className="w-full stripe-input"
                name="targetAudience"
                autoComplete="off"
                placeholder="e.g. พนักงานออฟฟิศผิวแพ้ง่ายที่ขี้เกียจแต่งหน้าล้างหน้านาน…"
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                id="ai-target-input"
              />
            </div>

             <div className="space-y-2">
              <label htmlFor="ai-tone-select" className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-sans">
                Primary Vibe / Tone of Voice / มู้ดโทนแคมเปญ
              </label>
              <Select value={tone} onValueChange={(val) => setTone(val)}>
                <SelectTrigger id="ai-tone-select">
                  <SelectValue placeholder="Select Tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Educational & Trustworthy">Educational & Trustworthy / ได้ความรู้ น่าเชื่อถือ</SelectItem>
                  <SelectItem value="Funny & Relatable">Funny & Relatable / สไตล์สนุกสนาน เข้าใจง่าย</SelectItem>
                  <SelectItem value="Luxury & Aesthetic">Luxury & Aesthetic / บิวตี้แพงหรูหรา มินิมอล</SelectItem>
                  <SelectItem value="Fast-paced & Energetic">Fast-paced & Energetic / ไวรัล ตื่นเต้น มีพลัง</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Button trigger */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full stripe-button-primary cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              id="ai-generate-btn"
            >
              <Sparkles className="w-4 h-4 text-slate-100 animate-pulse" aria-hidden="true" />
              <span>{isLoading ? "Analyzing Blueprint…" : "Generate Master Brief"}</span>
            </button>
          </form>
        </div>

        {/* Right column: AI content generated blueprint */}
        <div 
          className="bg-slate-950 rounded-3xl p-8 text-white min-h-[420px] border border-slate-900 shadow-2xl relative overflow-hidden flex flex-col justify-between"
          id="ai-output-terminal"
        >
          {/* 1. Loading screen state */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-10 p-6" id="ai-loading-screen">
              <div className="w-12 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-black text-slate-200 animate-pulse tracking-wide">
                Gemini Master Intelligence Processing...
              </p>
              <p className="text-[11px] text-slate-450 mt-2 font-mono h-4">
                {simulatedStep}
              </p>
            </div>
          )}

          {/* 2. Error state box */}
          {errorText && (
            <div className="p-5 bg-rose-950/40 border border-rose-900/50 rounded-2xl text-rose-200 space-y-2 my-auto" id="ai-error-box">
              <div className="flex items-center gap-2 font-bold text-xs uppercase">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>Creative Intel Failure</span>
              </div>
              <p className="text-xs leading-relaxed font-semibold">
                {errorText}
              </p>
              <p className="text-[10px] text-rose-400">
                Ensure GEMINI_API_KEY is properly added in Settings secret variables panel.
              </p>
            </div>
          )}

          {/* 3. Empty Placeholder state */}
          {!brief && !errorText && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-500 opacity-60 my-auto" id="ai-placeholder-screen">
              <Terminal className="w-14 h-14 mb-4 stroke-[1.25]" />
              <p className="text-sm italic font-medium">Waiting for campaign specifications...</p>
              <p className="text-[10px] uppercase tracking-wider mt-2">Configure variables on the left panel</p>
            </div>
          )}

          {/* 4. Complete Generated Details output block */}
          {brief && (
            <div className="space-y-6 animate-in fade-in duration-300" id="ai-success-output">
              
              {/* Header tags in terminal */}
              <div className="pb-4 border-b border-slate-910 flex items-center justify-between" id="ai-output-banner">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                    Creative Strategy Blueprints Synchronised
                  </span>
                </div>
                <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-blue-400 font-mono">
                  v3.5 Live
                </span>
              </div>

              {/* Step 1: Hook */}
              <div className="space-y-1.5" id="brief-hook-section">
                <h4 className="text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1 h-3.5 bg-blue-500 rounded-full" />
                  <span>Content Hook / วิติดเปิดสายตาครอมเปญ (3 Secs)</span>
                </h4>
                <div className="p-4 bg-slate-910 rounded-2xl border border-slate-900 relative group">
                  <p className="text-sm font-bold leading-relaxed text-slate-100">
                    {brief.hook}
                  </p>
                </div>
              </div>

              {/* Step 2: Body Narrative */}
              <div className="space-y-1.5" id="brief-body-section">
                <h4 className="text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
                  <span>Body Narrative Arc / ลำดับเรื่องวิดีโอสั้น</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {brief.body}
                </p>
              </div>

              {/* Step 3: Do's & Don'ts */}
              <div className="grid grid-cols-2 gap-4 pt-2" id="brief-guidelines-grid">
                
                {/* DO's panel */}
                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15" id="guideline-dos-card">
                  <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    <span>Recommended DO's</span>
                  </h5>
                  <ul className="text-[10px] text-slate-300 space-y-1.5 font-medium leading-relaxed">
                    {brief.dos.map((item, index) => (
                      <li key={index} className="flex gap-1.5">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DONT's panel */}
                <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/15" id="guideline-donts-card">
                  <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                    <span>CRITICAL DON'Ts</span>
                  </h5>
                  <ul className="text-[10px] text-slate-350 space-y-1.5 font-medium leading-relaxed">
                    {brief.donts.map((item, index) => (
                      <li key={index} className="flex gap-1.5">
                        <span className="text-rose-500 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Active Terminal console footer */}
          <div className="pt-4 border-t border-slate-910 flex items-center justify-between text-[9px] text-slate-500" id="ai-terminal-footer">
            <span>Powered by Gemini 3.5 Flash Model API</span>
            <span className="font-mono">Lat: Synced ok</span>
          </div>
        </div>
      </div>
    </div>
  );
}
