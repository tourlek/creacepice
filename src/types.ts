export type TabId = "crm" | "sop" | "ai" | "docs" | "scripts" | "campaigns";

export enum KOLPlatform {
  TIKTOK = "TIKTOK",
  INSTAGRAM = "INSTAGRAM",
  YOUTUBE = "YOUTUBE",
  FACEBOOK = "FACEBOOK",
}

export enum KOLStatus {
  CONTRACT = "1. รอเซ็นสัญญา",
  DRAFTING = "2. กำลังผลิตดราฟต์",
  BRAND_REVIEW = "3. รอแบรนด์ตรวจ",
  AWAITING_POST = "4. รอโพสต์จริง",
  LIVE = "5. ออนแอร์แล้ว",
}

export interface Campaign {
  id: string;
  name: string;
  brand: string;
}

export interface SocialAccount {
  id?: string;
  platform: KOLPlatform;
  username: string;
  profileUrl: string;
  followers: number;
}


export interface Influencer {
  id: string;
  name: string;
  phone: string;
  email: string;
  lineId: string;
  nickname: string;
  address: string;
  behavioralRemark: string;
  dealConditions: string;
  baseClientPrice: number;
  baseNetCost: number;
  socialAccounts?: SocialAccount[];
}

export interface KOL {
  id: string;
  name: string;
  platform: KOLPlatform;
  followers: number; // e.g., 150000 -> displays "150K"
  status: KOLStatus;
  phone: string;
  email: string;
  lineId: string;
  nickname: string;
  address: string;
  clientPrice: number;
  netCost: number;
  profit: number;
  behavioralRemark: string;
  dealConditions: string;
  draftDeadline: string; // YYYY-MM-DD
  liveDeadline: string;  // YYYY-MM-DD
  draftLink: string;
  liveLink: string;
  profileUrl: string;
  campaignId: string;
  influencerId?: string;
  baseClientPrice?: number;
  baseNetCost?: number;
  socialAccounts?: SocialAccount[];
  username?: string; // Assigned username for the campaign
}

export interface SopPackage {
  id: number;
  title: string;
  energy: string;
  color: "emerald" | "blue" | "amber" | "rose" | "slate";
  definition: string;
  steps: string[];
  deliverables: string;
  guard: string;
}

export interface CreativeBrief {
  hook: string;
  body: string;
  dos: string[];
  donts: string[];
}
