import re

with open("src/kolRepository.ts", "r") as f:
    content = f.read()

new_methods = """
export async function getAllInfluencers(): Promise<any[]> {
  if (useMemoryFallback || !pool) {
    return memoryInfluencers.map(inf => ({
      ...inf,
      socialAccounts: memorySocials.filter(s => s.influencerId === inf.id)
    }));
  }
  try {
    const infRes = await pool.query('SELECT * FROM influencers ORDER BY id ASC');
    const socRes = await pool.query('SELECT * FROM influencer_socials');
    
    const socialsMap: Record<string, any[]> = {};
    socRes.rows.forEach(r => {
      if (!socialsMap[r.influencer_id]) socialsMap[r.influencer_id] = [];
      socialsMap[r.influencer_id].push({
        id: r.id,
        platform: r.platform,
        username: r.username,
        profileUrl: r.profile_url,
        followers: parseInt(r.followers, 10) || 0
      });
    });

    return infRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      phone: row.phone || "",
      email: row.email || "",
      lineId: row.line_id || "",
      nickname: row.nickname || "",
      address: row.address || "",
      behavioralRemark: row.behavioral_remark || "",
      dealConditions: row.deal_conditions || "",
      baseClientPrice: parseInt(row.base_client_price, 10) || 0,
      baseNetCost: parseInt(row.base_net_cost, 10) || 0,
      socialAccounts: socialsMap[row.id] || []
    }));
  } catch (err) {
    console.error("Failed to query influencers:", err);
    return memoryInfluencers;
  }
}

export async function addInfluencer(inf: any): Promise<any> {
  if (useMemoryFallback || !pool) {
    const newInf = { ...inf, id: `INF-${Date.now()}` };
    memoryInfluencers.push(newInf);
    if (inf.socialAccounts) {
      inf.socialAccounts.forEach((soc: any) => {
        memorySocials.push({ ...soc, id: `SOC-${Date.now()}-${Math.random()}`, influencerId: newInf.id });
      });
    }
    return { ...newInf, socialAccounts: memorySocials.filter(s => s.influencerId === newInf.id) };
  }

  try {
    const res = await pool.query(`
      INSERT INTO influencers (
        id, name, phone, email, line_id, nickname, address, 
        behavioral_remark, deal_conditions, base_client_price, base_net_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
      inf.id || `INF-${Date.now()}`,
      inf.name, inf.phone, inf.email, inf.lineId, inf.nickname, inf.address,
      inf.behavioralRemark, inf.dealConditions, inf.baseClientPrice, inf.baseNetCost
    ]);

    const dbInfId = res.rows[0].id;

    if (inf.socialAccounts && inf.socialAccounts.length > 0) {
      for (const social of inf.socialAccounts) {
        await pool.query(`
          INSERT INTO influencer_socials (id, influencer_id, platform, username, profile_url, followers)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          social.id || `SOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          dbInfId, social.platform, social.username || "", social.profileUrl || "", social.followers || 0
        ]);
      }
    }

    const all = await getAllInfluencers();
    return all.find(i => i.id === dbInfId);
  } catch (err) {
    console.error("Failed to add influencer:", err);
    throw err;
  }
}

export async function updateInfluencer(id: string, updates: any): Promise<any> {
  if (useMemoryFallback || !pool) {
    const infIndex = memoryInfluencers.findIndex(i => i.id === id);
    if (infIndex === -1) return null;
    const inf = memoryInfluencers[infIndex];
    Object.assign(inf, updates);
    if (updates.socialAccounts) {
      updates.socialAccounts.forEach((soc: any) => {
        const existing = memorySocials.find(s => s.influencerId === id && s.platform === soc.platform);
        if (existing) {
          Object.assign(existing, soc);
        } else {
          memorySocials.push({ ...soc, id: `SOC-${Date.now()}-${Math.random()}`, influencerId: id });
        }
      });
    }
    return { ...inf, socialAccounts: memorySocials.filter(s => s.influencerId === id) };
  }

  try {
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
      updates.behavioralRemark, updates.dealConditions, updates.baseClientPrice, updates.baseNetCost, id
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
          id, social.platform, social.username || "", social.profileUrl || "", social.followers || 0
        ]);
      }
    }
    const all = await getAllInfluencers();
    return all.find(i => i.id === id);
  } catch (err) {
    console.error("Failed to update influencer:", err);
    throw err;
  }
}

export async function deleteInfluencer(id: string): Promise<boolean> {
  if (useMemoryFallback || !pool) {
    const idx = memoryInfluencers.findIndex(i => i.id === id);
    if (idx === -1) return false;
    memoryInfluencers.splice(idx, 1);
    return true;
  }
  try {
    const res = await pool.query('DELETE FROM influencers WHERE id = $1 RETURNING id', [id]);
    return res.rowCount !== null && res.rowCount > 0;
  } catch (err) {
    console.error("Failed to delete influencer:", err);
    throw err;
  }
}
"""

content += "\n\n" + new_methods

with open("src/kolRepository.ts", "w") as f:
    f.write(content)
