import re

with open("src/kolRepository.ts", "r") as f:
    content = f.read()

addKOL = """
export async function addKOL(kol: KOL): Promise<KOL> {
  if (useMemoryFallback || !pool) {
    let influencer = memoryInfluencers.find(i => i.name.toLowerCase() === kol.name.toLowerCase());
    if (!influencer) {
      const infId = kol.influencerId || `INF-${String(memoryInfluencers.length + 1).padStart(3, "0")}`;
      influencer = {
        id: infId,
        name: kol.name,
        phone: kol.phone,
        email: kol.email,
        lineId: kol.lineId,
        nickname: kol.nickname,
        address: kol.address,
        behavioralRemark: kol.behavioralRemark,
        dealConditions: kol.dealConditions,
        baseClientPrice: kol.baseClientPrice || kol.clientPrice,
        baseNetCost: kol.baseNetCost || kol.netCost
      };
      memoryInfluencers.push(influencer);
    } else {
      influencer.phone = kol.phone;
      influencer.email = kol.email;
      influencer.lineId = kol.lineId;
      influencer.nickname = kol.nickname;
      influencer.address = kol.address;
      influencer.behavioralRemark = kol.behavioralRemark;
      influencer.dealConditions = kol.dealConditions;
      influencer.baseClientPrice = kol.baseClientPrice !== undefined ? kol.baseClientPrice : influencer.baseClientPrice;
      influencer.baseNetCost = kol.baseNetCost !== undefined ? kol.baseNetCost : influencer.baseNetCost;
    }

    if (kol.socialAccounts) {
      kol.socialAccounts.forEach(soc => {
        const existing = memorySocials.find(s => s.influencerId === influencer.id && s.platform === soc.platform);
        if (existing) {
          existing.username = soc.username;
          existing.profileUrl = soc.profileUrl;
          existing.followers = soc.followers;
        } else {
          memorySocials.push({ ...soc, id: `SOC-${Date.now()}-${Math.random()}`, influencerId: influencer.id });
        }
      });
    }

    const assignmentId = `ASN-${Date.now()}`;
    const assignment = {
      id: assignmentId,
      influencerId: influencer.id,
      campaignId: kol.campaignId,
      status: kol.status,
      clientPrice: kol.clientPrice,
      netCost: kol.netCost,
      profit: kol.profit,
      draftDeadline: kol.draftDeadline,
      liveDeadline: kol.liveDeadline,
      draftLink: kol.draftLink,
      liveLink: kol.liveLink,
      platform: kol.platform,
      username: kol.username || "",
      profileUrl: kol.profileUrl || "",
      followers: kol.followers || 0
    };
    memoryAssignments.push(assignment);

    return {
      ...assignment,
      name: influencer.name,
      phone: influencer.phone,
      email: influencer.email,
      lineId: influencer.lineId,
      nickname: influencer.nickname,
      address: influencer.address,
      behavioralRemark: influencer.behavioralRemark,
      dealConditions: influencer.dealConditions,
      baseClientPrice: influencer.baseClientPrice,
      baseNetCost: influencer.baseNetCost,
      socialAccounts: memorySocials.filter(s => s.influencerId === influencer.id)
    };
  }

  try {
    const assignmentId = `ASN-${Date.now()}`;
    
    const infRes = await pool.query(`
      INSERT INTO influencers (
        id, name, phone, email, line_id, nickname, address, 
        behavioral_remark, deal_conditions, base_client_price, base_net_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (name) DO UPDATE SET
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        line_id = EXCLUDED.line_id,
        nickname = EXCLUDED.nickname,
        address = EXCLUDED.address,
        behavioral_remark = EXCLUDED.behavioral_remark,
        deal_conditions = EXCLUDED.deal_conditions,
        base_client_price = EXCLUDED.base_client_price,
        base_net_cost = EXCLUDED.base_net_cost
      RETURNING id
    `, [
      kol.influencerId || `INF-${Date.now()}`,
      kol.name, kol.phone, kol.email, kol.lineId, kol.nickname, kol.address,
      kol.behavioralRemark, kol.dealConditions, kol.baseClientPrice || kol.clientPrice, kol.baseNetCost || kol.netCost
    ]);

    const dbInfId = infRes.rows[0].id;

    if (kol.socialAccounts && kol.socialAccounts.length > 0) {
      for (const social of kol.socialAccounts) {
        await pool.query(`
          INSERT INTO influencer_socials (id, influencer_id, platform, username, profile_url, followers)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (influencer_id, platform) DO UPDATE SET
            username = EXCLUDED.username,
            profile_url = EXCLUDED.profile_url,
            followers = EXCLUDED.followers
        `, [
          social.id || `SOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          dbInfId, social.platform, social.username || "", social.profileUrl || "", social.followers || 0
        ]);
      }
    }

    await pool.query(`
      INSERT INTO campaign_kols (
        id, influencer_id, campaign_id, status, platform, username, profile_url, followers,
        client_price, net_cost, profit, draft_deadline, live_deadline, draft_link, live_link
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      assignmentId, dbInfId, kol.campaignId, kol.status, kol.platform, kol.username || "", kol.profileUrl || "", kol.followers || 0,
      kol.clientPrice, kol.netCost, kol.profit, kol.draftDeadline, kol.liveDeadline, kol.draftLink, kol.liveLink
    ]);

    return { ...kol, id: assignmentId, influencerId: dbInfId };
  } catch (err) {
    console.error("Failed to add KOL:", err);
    throw err;
  }
}
"""

updateKOL = """
export async function updateKOL(id: string, updates: Partial<KOL>): Promise<KOL | null> {
  if (useMemoryFallback || !pool) {
    const aIndex = memoryAssignments.findIndex(a => a.id === id);
    if (aIndex === -1) return null;
    const assignment = memoryAssignments[aIndex];

    if (updates.campaignId !== undefined) assignment.campaignId = updates.campaignId;
    if (updates.status !== undefined) assignment.status = updates.status;
    if (updates.clientPrice !== undefined) assignment.clientPrice = updates.clientPrice;
    if (updates.netCost !== undefined) assignment.netCost = updates.netCost;
    if (updates.profit !== undefined) assignment.profit = updates.profit;
    if (updates.draftDeadline !== undefined) assignment.draftDeadline = updates.draftDeadline;
    if (updates.liveDeadline !== undefined) assignment.liveDeadline = updates.liveDeadline;
    if (updates.draftLink !== undefined) assignment.draftLink = updates.draftLink;
    if (updates.liveLink !== undefined) assignment.liveLink = updates.liveLink;
    if (updates.platform !== undefined) assignment.platform = updates.platform;
    if (updates.username !== undefined) assignment.username = updates.username;
    if (updates.profileUrl !== undefined) assignment.profileUrl = updates.profileUrl;
    if (updates.followers !== undefined) assignment.followers = updates.followers;

    const infId = assignment.influencerId;
    const influencer = memoryInfluencers.find(i => i.id === infId);
    if (influencer) {
      if (updates.name !== undefined) influencer.name = updates.name;
      if (updates.phone !== undefined) influencer.phone = updates.phone;
      if (updates.email !== undefined) influencer.email = updates.email;
      if (updates.lineId !== undefined) influencer.lineId = updates.lineId;
      if (updates.nickname !== undefined) influencer.nickname = updates.nickname;
      if (updates.address !== undefined) influencer.address = updates.address;
      if (updates.behavioralRemark !== undefined) influencer.behavioralRemark = updates.behavioralRemark;
      if (updates.dealConditions !== undefined) influencer.dealConditions = updates.dealConditions;
      if (updates.baseClientPrice !== undefined) influencer.baseClientPrice = updates.baseClientPrice;
      if (updates.baseNetCost !== undefined) influencer.baseNetCost = updates.baseNetCost;
      
      if (updates.socialAccounts) {
        updates.socialAccounts.forEach(soc => {
          const existing = memorySocials.find(s => s.influencerId === infId && s.platform === soc.platform);
          if (existing) {
            existing.username = soc.username;
            existing.profileUrl = soc.profileUrl;
            existing.followers = soc.followers;
          } else {
            memorySocials.push({ ...soc, id: `SOC-${Date.now()}-${Math.random()}`, influencerId: infId });
          }
        });
      }
    }
    
    return {
      ...assignment,
      name: influencer?.name || "Unknown",
      phone: influencer?.phone || "",
      email: influencer?.email || "",
      lineId: influencer?.lineId || "",
      nickname: influencer?.nickname || "",
      address: influencer?.address || "",
      behavioralRemark: influencer?.behavioralRemark || "",
      dealConditions: influencer?.dealConditions || "",
      baseClientPrice: influencer?.baseClientPrice || 0,
      baseNetCost: influencer?.baseNetCost || 0,
      socialAccounts: memorySocials.filter(s => s.influencerId === infId)
    };
  }

  try {
    const ckRes = await pool.query(`
      UPDATE campaign_kols
      SET campaign_id = COALESCE($1, campaign_id),
          status = COALESCE($2, status),
          client_price = COALESCE($3, client_price),
          net_cost = COALESCE($4, net_cost),
          profit = COALESCE($5, profit),
          draft_deadline = COALESCE($6, draft_deadline),
          live_deadline = COALESCE($7, live_deadline),
          draft_link = COALESCE($8, draft_link),
          live_link = COALESCE($9, live_link),
          platform = COALESCE($10, platform),
          username = COALESCE($11, username),
          profile_url = COALESCE($12, profile_url),
          followers = COALESCE($13, followers)
      WHERE id = $14
      RETURNING influencer_id
    `, [
      updates.campaignId, updates.status, updates.clientPrice, updates.netCost, updates.profit,
      updates.draftDeadline, updates.liveDeadline, updates.draftLink, updates.liveLink,
      updates.platform, updates.username, updates.profileUrl, updates.followers, id
    ]);

    if (ckRes.rowCount === 0) return null;
    const infId = ckRes.rows[0].influencer_id;

    await pool.query(`
      UPDATE influencers
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          line_id = COALESCE($4, line_id),
          nickname = COALESCE($5, nickname),
          address = COALESCE($6, address),
          behavioral_remark = COALESCE($7, behavioral_remark),
          deal_conditions = COALESCE($8, deal_conditions),
          base_client_price = COALESCE($9, base_client_price),
          base_net_cost = COALESCE($10, base_net_cost)
      WHERE id = $11
    `, [
      updates.name, updates.phone, updates.email, updates.lineId, updates.nickname, updates.address,
      updates.behavioralRemark, updates.dealConditions, updates.baseClientPrice, updates.baseNetCost, infId
    ]);
    
    if (updates.socialAccounts) {
      for (const social of updates.socialAccounts) {
        await pool.query(`
          INSERT INTO influencer_socials (id, influencer_id, platform, username, profile_url, followers)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (influencer_id, platform) DO UPDATE SET
            username = EXCLUDED.username,
            profile_url = EXCLUDED.profile_url,
            followers = EXCLUDED.followers
        `, [
          social.id || `SOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          infId, social.platform, social.username || "", social.profileUrl || "", social.followers || 0
        ]);
      }
    }

    const all = await getAllKOLs();
    return all.find(k => k.id === id) || null;
  } catch (err) {
    console.error("Failed to update KOL:", err);
    throw err;
  }
}
"""

content = re.sub(r'export async function addKOL.*?export async function updateKOL', addKOL + '\n\nexport async function updateKOL', content, flags=re.DOTALL)
content = re.sub(r'export async function updateKOL.*?export async function deleteKOL', updateKOL + '\n\nexport async function deleteKOL', content, flags=re.DOTALL)

with open("src/kolRepository.ts", "w") as f:
    f.write(content)
