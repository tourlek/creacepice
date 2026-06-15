import React, { useState } from "react";
import { KOL } from "../types";
import { FileText, Copy, Download, Check, ShieldCheck, FileCheck, Star } from "lucide-react";

interface DocsTabProps {
  kols: KOL[];
}

export default function DocsTab({ kols }: DocsTabProps) {
  const [selectedKOLId, setSelectedKOLId] = useState<string>(kols[0]?.id || "");
  const [isCopied, setIsCopied] = useState(false);

  const activeKOL = kols.find((k) => k.id === selectedKOLId) || kols[0];

  // Formatting Thai Baht helper
  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace("฿", "฿");
  };

  // Pre-generate standard dates relative to record values or current simulated year
  const getSimulatedDateText = () => "15 มิถุนายน 2569";

  const handleCopyContract = () => {
    setIsCopied(true);
    const contractText = `
หนังสือสัญญาว่าจ้างผลิตและเผยแพร่คอนเทนต์สื่อออนไลน์
ผู้ว่าจ้าง: บริษัท เอเจนซี่ พาร์ทเนอร์ จำกัด 
ผู้รับจ้าง: ${activeKOL?.name || "(ชื่อครีเอเตอร์)"}

รายละเอียดสัญญา:
1. ผู้รับจ้างตกลงรับทำงานทำสื่อโฆษณาในรูปแบบวิดีโอ ช่องทางแพลตฟอร์ม ${activeKOL?.platform || "TikTok"}
2. ค่าจ้างการจ้างงาน: สรุปในจำนวนตกลง ${formatBaht(activeKOL?.clientPrice || 15000)} หักภาษี ณ ที่จ่ายตามกฎหมายกำหนด
3. กำหนดส่งดราฟต์งานตรวจ: ${activeKOL?.draftDeadline || "20 มิ.ย. 2569"}
4. กำหนดเผยแพร่ออนแอร์ (Live Date): ${activeKOL?.liveDeadline || "25 มิ.ย. 2569"}
5. ข้อกำหนดเฉพาะและดีลพิเศษ: "${activeKOL?.dealConditions || "ตามบรีฟมาตรฐานแบรนด์"}"
    `;
    
    navigator.clipboard.writeText(contractText.trim());
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadMockPdf = () => {
    alert(`Downloading ${activeKOL?.name || "KOL"}_Agreement.pdf\n\n(ในการใช้งานจริงไฟล์ PDF ฉบับกฎหมายอย่างเป็นทางการจะจัดส่งขึ้นระบบ Cloud Storage เพื่อความปลอดภัย)`);
  };

  return (
    <div className="space-y-8" id="docs-tab-root">
      
      {/* Header Panel */}
      <header id="docs-header">
        <h1 className="font-sans text-3xl font-extrabold text-slate-900 tracking-tight" id="docs-title">
          Workspace Docs &amp; Contracts
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1.5" id="docs-subtitle">
          Auto-generate custom legal agreements and contract drafts from CRM active records
        </p>
      </header>

      {/* Main Workspace split panel: selector list vs preview box */}
      <div 
        className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row h-[720px]"
        id="docs-workspace-container"
      >
        
        {/* Left column: KOL active lists select bar */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-6 space-y-4 flex flex-col justify-between" id="docs-selector-sidebar">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Select Active KOL Profile
            </label>
            
            <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1" id="selector-buttons-list">
              {kols.map((kol) => {
                const isSelected = selectedKOLId === kol.id;
                return (
                  <button
                    key={kol.id}
                    id={`doc-selector-${kol.id}`}
                    onClick={() => setSelectedKOLId(kol.id)}
                    className={`w-full p-4 text-left transition-all group shrink-0 kol-card-premium cursor-pointer ${
                      isSelected
                        ? "kol-card-selected"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {kol.name}
                      </h4>
                      {isSelected && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Rate: {formatBaht(kol.clientPrice)}</span>
                      <span className="uppercase text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                        {kol.platform}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick legal checklist box on the side */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2 text-blue-900" id="legal-side-checklist">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Compliant Check</span>
            </div>
            <p className="text-[10.5px] leading-relaxed text-blue-900/85">
              สัญญาฉบับมาตรฐานได้รับการผูกตามกฎเกณฑ์สิทธิส่งเสริมการขายโฆษณา คุ้มครองสิทธิ์ยิงแอมป์ 3 เดือน
            </p>
          </div>
        </div>

        {/* Right column: Formatted classical Thailand legal document simulator */}
        <div className="flex-1 p-8 flex flex-col bg-slate-100/50 h-full overflow-hidden" id="docs-preview-panel">
          
          {/* Preview action bar */}
          <div className="flex justify-between items-center mb-5 shrink-0" id="docs-preview-actions">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
              <FileCheck className="w-5 h-5 text-blue-600 stroke-[2.2]" />
              <span>KOL &amp; Content Creator Agreement / พิมพ์ร่างเอกสารจ้างงาน</span>
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleCopyContract}
                className={`stripe-button-secondary flex items-center gap-2 cursor-pointer transition-colors duration-150 ${
                  isCopied ? "text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-50" : ""
                }`}
                id="btn-copy-contract"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadMockPdf}
                className="stripe-button-primary flex items-center gap-2 cursor-pointer"
                id="btn-pdf-contract"
              >
                <Download className="w-4 h-4 text-slate-100" aria-hidden="true" />
                <span>PDF Download</span>
              </button>
            </div>
          </div>

          {/* Thai Contract sheet paper layout */}
          {activeKOL ? (
            <div 
              className="flex-1 bg-white p-10 border border-slate-250 rounded-xl shadow-inner overflow-y-auto font-serif text-slate-850 text-sm leading-relaxed"
              id="printed-contract-sheet"
            >
              {/* Thailand Garuda logo emulator / header text */}
              <div className="text-center mb-8" id="contract-centering-title">
                <h2 className="text-xl font-bold uppercase underline tracking-wide">สัญญาจ้างงานผลิตเนื้อหาและเผยแพร่สื่อโฆษณา</h2>
                <span className="text-[10px] uppercase text-slate-400 font-mono tracking-widest block mt-1.5">KOL CONTENT CREATOR AGREEMENT</span>
              </div>

              {/* Preamble section */}
              <div className="space-y-4" id="contract-preamble">
                <p>
                  หนังสือสัญญาฉบับนี้ทำขึ้น ณ บริษัท เอเจนซี่ พาร์ทเนอร์ จำกัด เมื่อวันที่ <span className="bg-blue-50/80 px-2.5 py-0.5 border-b border-blue-200 font-serif font-semibold">{getSimulatedDateText()}</span> ระหว่างสองฝ่ายดังนี้:
                </p>
                
                <p className="pl-6 font-medium">
                  <strong>ผู้ว่าจ้าง:</strong> บริษัท เอเจนซี่ พาร์ทเนอร์ จำกัด หรือ บจก.ผู้รับมอบลิขสิทธิ์โฆษณา (ซึ่งต่อไปในสัญญานี้จะเรียกว่า <strong>&ldquo;ผู้ว่าจ้าง&rdquo;</strong>) ฝ่ายหนึ่ง กับ
                </p>
                
                <p className="pl-6 font-medium">
                  <strong>ผู้รับจ้าง:</strong> คริเอเตอร์เจ้าของช่องผู้มีชื่อเสียงอ้างอิง <span className="bg-blue-50/80 px-2.5 py-0.5 border-b border-blue-200 font-bold text-slate-900">{activeKOL.name}</span> ซึ่งติดต่อผ่านข้อมูลอ้างอิง {activeKOL.contact} (ซึ่งต่อไปในสัญญานี้จะเรียกว่า <strong>&ldquo;ครีเอเตอร์&rdquo;</strong>) อีกฝ่ายหนึ่ง
                </p>

                <p>
                  คู่สัญญาทั้งสองฝ่ายได้ตกลงความร่วมมือจ้างงานตามเงื่อนไขข้อตกลงและหลักประกันในสัญญาดังต่อไปนี้:
                </p>
              </div>

              {/* Clause sections */}
              <div className="mt-6 space-y-5" id="contract-content-clauses">
                
                <div>
                  <h4 className="font-bold underline text-slate-900 mb-1">ข้อ 1. รายละเอียดเนื้องานสื่อโฆษณาและค่าตอบแทนการจ้าง</h4>
                  <p className="pl-4">
                    ครีเอเตอร์รับจ้างผลิตสื่อสร้างสรรค์และเผยแพร่ลงช่องทาง แพลตฟอร์ม <span className="bg-blue-50/80 px-1.5 border-b border-blue-250 font-bold uppercase">{activeKOL.platform}</span> จำนวน 1 รายการวิดีโอ โดยผู้ว่าจ้างตกลงชำระเงินว่าจ้างในอัตราเรทราคาเน็ตจำนวน <span className="bg-blue-50/80 px-2 py-0.5 border-b border-blue-250 font-bold text-slate-950">{formatBaht(activeKOL.clientPrice)}</span> ซึ่งจะชำระตามข้อกำหนดงวดการเงินที่ระบุ
                  </p>
                </div>

                <div>
                  <h4 className="font-bold underline text-slate-900 mb-1">ข้อ 2. กำหนดการส่งตรวจดราฟต์และการออนแอร์เผยแพร่ (Schedules)</h4>
                  <p className="pl-4 leading-relaxed">
                    - ส่งมอบดราฟต์แรกเพื่อคัดกรองเนื้อหา (Draft Due Date): <span className="bg-amber-50 px-2 border-b border-amber-200 font-bold text-amber-900">{activeKOL.draftDeadline}</span><br />
                    - กำหนดออกอากาศหน้าจอสื่อสารสาธารณะ (Go-Live Date): <span className="bg-emerald-50 px-2 border-b border-emerald-200 font-bold text-emerald-900">{activeKOL.liveDeadline}</span>
                  </p>
                </div>

                <div>
                  <h4 className="font-bold underline text-slate-900 mb-1">ข้อ 3. ข้อกำหนดพิเศษและการรับบทเสริมขอบเขต</h4>
                  <p className="pl-4 italic text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-150 font-medium">
                    &ldquo;{activeKOL.dealConditions}&rdquo;
                  </p>
                </div>

                <div>
                  <h4 className="font-bold underline text-slate-900 mb-1">ข้อ 4. การคุ้มครองและโฆษณาสิทธิ์สรา้งสรรค์ (Usage Rights)</h4>
                  <p className="pl-4 text-slate-600">
                    ครีเอเตอร์ตกลงให้ผู้ว่าจ้างนำไฟล์คลิปวิดีโอสร้างสรรค์ชิ้นนี้ไปใช้โปรโมท แชร์ หรือซื้อบริการโฆษณาแอมป์ยิงแอดในฐานะผลิตภัณฑ์ (Usage Rights) เป็นระยะเวลา 3 เดือน นับแต่วัน Go-Live เป็นต้นไป โดยไม่มีค่าบริการลิขสิทธิ์เพิ่มเติม
                  </p>
                </div>
              </div>

              {/* Signature area */}
              <div className="mt-14 flex justify-between gap-8 pt-8 border-t border-slate-100" id="contract-signatures-row">
                <div className="text-center w-52 flex flex-col items-center">
                  <div className="border-b border-slate-300 w-full h-10 mb-2"></div>
                  <p className="text-[10px] text-slate-400 font-sans tracking-wide">ลงชื่อ .............................................................</p>
                  <p className="text-[10px] font-serif mt-1 font-bold">บริษัท เอเจนซี่ พาร์ทเนอร์ จำกัด (ผู้ว่าจ้าง)</p>
                </div>
                
                <div className="text-center w-52 flex flex-col items-center">
                  <div className="border-b border-slate-300 w-full h-10 mb-2"></div>
                  <p className="text-[10px] text-slate-400 font-sans tracking-wide">ลงชื่อ .............................................................</p>
                  <p className="text-[10px] font-serif mt-1 font-bold">{activeKOL.name} (ครีเอเตอร์ผู้จ้าง)</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center text-slate-405 font-medium" id="contract-no-data-alert">
              No influencer account is chosen. Select custom record to see drafts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
