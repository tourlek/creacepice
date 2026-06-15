import re

with open("src/kolRepository.ts", "r") as f:
    content = f.read()

# 1. Update memory arrays
content = content.replace("let memoryInfluencers: any[] = [];", "let memoryInfluencers: any[] = [];\nlet memorySocials: any[] = [];")

# 2. Update getAllKOLs
getAll = """
  try {
    const query = `
      SELECT 
        ck.id AS assignment_id, ck.campaign_id, ck.status, ck.client_price, ck.net_cost, ck.profit,
        ck.draft_deadline, ck.live_deadline, ck.draft_link, ck.live_link, ck.platform AS assigned_platform,
        ck.username AS assigned_username, ck.profile_url AS assigned_profile_url, ck.followers AS assigned_followers,
        inf.id AS influencer_id, inf.name, inf.phone, inf.email, inf.line_id, inf.nickname, inf.address,
        inf.behavioral_remark, inf.deal_conditions, inf.base_client_price, inf.base_net_cost
      FROM campaign_kols ck
      LEFT JOIN influencers inf ON ck.influencer_id = inf.id
      ORDER BY ck.id ASC
    `;
    const res = await pool.query(query);
    
    // Fetch all socials
    const socialsRes = await pool.query('SELECT * FROM influencer_socials');
    const socialsMap: Record<string, any[]> = {};
    socialsRes.rows.forEach(r => {
      if (!socialsMap[r.influencer_id]) socialsMap[r.influencer_id] = [];
      socialsMap[r.influencer_id].push({
        id: r.id,
        platform: r.platform,
        username: r.username,
        profileUrl: r.profile_url,
        followers: parseInt(r.followers, 10) || 0
      });
    });

    return res.rows.map(row => ({
      id: row.assignment_id,
      influencerId: row.influencer_id,
      name: row.name || "Unknown",
      phone: row.phone || "",
      email: row.email || "",
      lineId: row.line_id || "",
      nickname: row.nickname || "",
      address: row.address || "",
      behavioralRemark: row.behavioral_remark || "",
      dealConditions: row.deal_conditions || "",
      baseClientPrice: parseInt(row.base_client_price, 10) || 0,
      baseNetCost: parseInt(row.base_net_cost, 10) || 0,
      socialAccounts: socialsMap[row.influencer_id] || [],
      
      campaignId: row.campaign_id,
      status: row.status as KOLStatus,
      clientPrice: parseInt(row.client_price, 10) || 0,
      netCost: parseInt(row.net_cost, 10) || 0,
      profit: parseInt(row.profit, 10) || 0,
      draftDeadline: row.draft_deadline || "",
      liveDeadline: row.live_deadline || "",
      draftLink: row.draft_link || "",
      liveLink: row.live_link || "",
      
      platform: (row.assigned_platform || KOLPlatform.TIKTOK) as KOLPlatform,
      username: row.assigned_username || "",
      profileUrl: row.assigned_profile_url || "",
      followers: parseInt(row.assigned_followers, 10) || 0
    }));
  } catch (err) {
    console.error("Failed to query database:", err);
    return memoryAssignments.map(a => {
      const inf = memoryInfluencers.find(i => i.id === a.influencerId);
      const socials = memorySocials.filter(s => s.influencerId === a.influencerId);
      return {
        ...a,
        influencerId: a.influencerId,
        name: inf ? inf.name : "Unknown",
        phone: inf ? inf.phone : "",
        email: inf ? inf.email : "",
        lineId: inf ? inf.lineId : "",
        nickname: inf ? inf.nickname : "",
        address: inf ? inf.address : "",
        behavioralRemark: inf ? inf.behavioralRemark : "",
        dealConditions: inf ? inf.dealConditions : "",
        baseClientPrice: inf ? inf.baseClientPrice : 0,
        baseNetCost: inf ? inf.baseNetCost : 0,
        socialAccounts: socials
      };
    });
  }
"""

content = re.sub(r'  try {\n    const query = `\n      SELECT \n        ck\.id AS assignment_id.*?  }\n', getAll, content, flags=re.DOTALL)

with open("src/kolRepository.ts", "w") as f:
    f.write(content)
