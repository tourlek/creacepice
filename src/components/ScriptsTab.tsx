import React, { useState } from "react";
import { Timer, ShieldAlert, Gavel, Copy, Check } from "lucide-react";

interface ScriptItem {
  id: string;
  style: string;
  text: string;
}

interface ScriptGroup {
  level: string;
  title: string;
  colorClass: string;
  icon: React.ComponentType<any>;
  items: ScriptItem[];
}

export default function ScriptsTab() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const groups: ScriptGroup[] = [
    {
      level: "Level 1",
      title: "Chasing Drafts / ตามแก้งาน",
      colorClass: "text-amber-600 border-amber-100 bg-amber-50/40",
      icon: Timer,
      items: [
        {
          id: "l1-cute",
          style: "STYLE: CUTE & FRIENDLY / ทวงแบบน่ารัก",
          text: "ฮัลโหลค่าคุณ... (ชื่อแบรนด์/KOL) ทวงดราฟต์น้องนิดนึงน้า แบรนด์แอบถามมา กลัวไม่ทันวันโพสต์ค่า พอมีอัปเดตงานให้ชื่นใจมั้ยคะ 💖",
        },
        {
          id: "l1-formal",
          style: "STYLE: FORMAL / ทวงแบบเป็นทางการ",
          text: "เรียนคุณ... ตามกำหนดเวลาที่ตกลงในสัญญาของแคมเปญ วันนี้เป็นวันกำหนดส่งงานดราฟต์วิดีโอ เพื่อป้องกันผลกระทบต่อตารางออนแอร์ รบกวนแจ้งความคืบหน้าในช่วงบ่ายนี้ด้วยนะคะ ขอบคุณค่ะ",
        },
      ],
    },
    {
      level: "Level 2",
      title: "Scope Protection / ป้องกันงานงอก",
      colorClass: "text-blue-600 border-blue-100 bg-blue-50/40",
      icon: ShieldAlert,
      items: [
        {
          id: "l2-extra",
          style: "STYLE: DENY EXTRA WORK / ปฏิเสธงานนอกเงื่อนไข",
          text: "สำหรับส่วนที่ขอเพิ่มเข้ามานี้ อยู่นอกเหนือจากข้อตกลงและบรีฟหลักของโปรเจกต์เดิมค่ะ หากต้องการเพิ่มเติมจริงทางทีมขอเสนอราคาคิดค่าใช้จ่ายส่วนต่างเพิ่ม... หรือหากยืนยันตามงบเดิมเราทำตามบรีฟที่มีได้เลยค่ะ",
        },
        {
          id: "l2-limit",
          style: "STYLE: REVISION LIMIT / คุมโควต้าการแก้คลิป",
          text: "ทางแบรนด์และตัวแทนแก้ไขคลิปนี้เป็นรอบที่ 3 แล้วนะคะ เกินจำนวนโควต้าการตรวจแก้ฟรีที่ตกลงกันไว้ รบกวนพิจารณาให้ความเห็นจุดแก้ไขทั้งหมดพร้อมกันเป็นรอบสุดท้ายเลยน้าน้า ไม่งั้นต้องขอเก็บค่าตรวจแก้ไขเพิ่มต่อครั้งค่ะ",
        },
      ],
    },
    {
      level: "Level 3",
      title: "Strict & Legal / ทวงขั้นเด็ดขาด",
      colorClass: "text-rose-600 border-rose-100 bg-rose-50/40",
      icon: Gavel,
      items: [
        {
          id: "l3-warn",
          style: "STYLE: FINAL WARNING / แจ้งยกเลิกและเรียกคืนมัดจำ",
          text: "หากบริษัทไม่ได้รับการตอบกลับหรือส่งมอบไฟล์ภายในเวลา 18:00 น. วันนี้ ทางเราจำเป็นจะต้องใช้สิทธิ์แจ้งขอยกเลิกงานจ้างทันที และเรียกคืนเงินค่าตอบแทนมัดจำตามเงื่อนไขสัญญาร่วมงาน ข้อพฤติกรรมล่าช้าค่ะ",
        },
        {
          id: "l3-black",
          style: "STYLE: BAD BEHAVIOR BLACKLIST / บันทึกประวัติเสี่ยง",
          text: "เนื่องจากสถานพฤติกรรมการปละละเลยงานจ้างและส่งงานไม่ตรงกำหนดโดยไม่มีการชี้แจง ทางเรามีความจำเป็นต้องขอเรียนบันทึกรายงานพฤติกรรมนี้ลงสู่ระบบบัญชีดำ (CRM Blacklist) เพื่อพิจารณาพาร์ทเนอร์ในแคมเปญถัดไปค่ะ",
        },
      ],
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="space-y-8" id="scripts-tab-root">
      <header id="scripts-header">
        <h1 className="font-sans text-3xl font-extrabold text-slate-900 tracking-tight" id="scripts-title">
          Crisis Script Bank
        </h1>
        <p className="text-sm text-slate-500 font-medium" id="scripts-subtitle">
          Copyable templates for chasing work and handling difficult situations
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="scripts-groups-container">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.level}
              id={`script-group-col-${group.level.replace(/\s+/g, "")}`}
              className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col h-full shadow-xs"
            >
              {/* Box Heading */}
              <div className={`flex items-center gap-2 mb-6 font-extrabold text-xs uppercase tracking-wider pb-3 border-b border-slate-100 ${group.colorClass.split(" ")[0]}`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
                <span>{group.level}: {group.title}</span>
              </div>

              {/* Items in level */}
              <div className="space-y-4 flex-1">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    id={`script-item-card-${item.id}`}
                    className="p-4 bg-slate-50 border border-slate-150 rounded-2xl group/item relative hover:bg-slate-100/50 transition-colors"
                  >
                    <h5 className="text-[9px] font-bold text-slate-400 mb-2.5 tracking-wider uppercase">
                      {item.style}
                    </h5>
                    <p className="text-xs leading-relaxed text-slate-650 pr-8 font-medium">
                      {item.text}
                    </p>
                    <button
                      onClick={() => handleCopy(item.text, item.id)}
                      className={`absolute top-3.5 right-3.5 p-1.5 rounded-lg transition-all ${
                        copiedId === item.id
                          ? "bg-emerald-100 text-emerald-700 font-bold"
                          : "text-slate-350 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 shadow-xs"
                      }`}
                      title="Copy script"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
