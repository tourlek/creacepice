import { Pool } from "pg";
import { KOL, KOLPlatform, KOLStatus, Campaign } from "./types";
import { INITIAL_KOLS, INITIAL_CAMPAIGNS } from "./data";

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_DEV;

let pool: Pool | null = null;
let useMemoryFallback = true;

// In-memory normalized store
let memoryCampaigns: Campaign[] = [...INITIAL_CAMPAIGNS];

let memoryInfluencers: {
  id: string;
  name: string;
  platform: KOLPlatform;
  followers: number;
  phone: string;
  email: string;
  lineId: string;
  nickname: string;
  address: string;
  profileUrl: string;
  behavioralRemark: string;
  dealConditions: string;
  baseClientPrice: number;
  baseNetCost: number;
}[] = [];

let memorySocials: any[] = [];

let memoryAssignments: {
  id: string;
  influencerId: string;
  campaignId: string;
  status: KOLStatus;
  clientPrice: number;
  netCost: number;
  profit: number;
  draftDeadline: string;
  liveDeadline: string;
  draftLink: string;
  liveLink: string;
}[] = [];

// Initialize memory store with INITIAL_KOLS
INITIAL_KOLS.forEach((k, index) => {
  const infId = `INF-${String(index + 1).padStart(3, "0")}`;
  memoryInfluencers.push({
    id: infId,
    name: k.name,
    platform: k.platform,
    followers: k.followers,
    phone: "",
    email: "",
    lineId: "",
    nickname: "",
    address: "",
    profileUrl: k.profileUrl,
    behavioralRemark: k.behavioralRemark,
    dealConditions: k.dealConditions,
    baseClientPrice: k.clientPrice || 0,
    baseNetCost: k.netCost || 0
  });
  memoryAssignments.push({
    id: k.id,
    influencerId: infId,
    campaignId: k.campaignId,
    status: k.status,
    clientPrice: k.clientPrice,
    netCost: k.netCost,
    profit: k.clientPrice - k.netCost,
    draftDeadline: k.draftDeadline,
    liveDeadline: k.liveDeadline,
    draftLink: k.draftLink,
    liveLink: k.liveLink
  });
});

if (databaseUrl) {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    });
    useMemoryFallback = false;
    console.log("PostgreSQL connection pool initialized.");
  } catch (err) {
    console.error("Failed to initialize PostgreSQL pool, falling back to memory:", err);
    useMemoryFallback = true;
  }
} else {
  console.warn("DATABASE_URL is not set. Running with in-memory fallback store.");
}

// Automatically create table if connected to DB
export async function initializeDatabase() {
  if (useMemoryFallback || !pool) return;

  const createCampaignsTable = `
    CREATE TABLE IF NOT EXISTS campaigns (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createInfluencersTable = `
    CREATE TABLE IF NOT EXISTS influencers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(100),
      email VARCHAR(255),
      line_id VARCHAR(255),
      nickname VARCHAR(255),
      address TEXT,
      behavioral_remark TEXT,
      deal_conditions TEXT,
      base_client_price DECIMAL(10, 2) DEFAULT 0,
      base_net_cost DECIMAL(10, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createCampaignKolsTable = `
    CREATE TABLE IF NOT EXISTS campaign_kols (
      id VARCHAR(50) PRIMARY KEY,
      influencer_id VARCHAR(50) NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
      campaign_id VARCHAR(100) NOT NULL,
      status VARCHAR(100) NOT NULL,
      platform VARCHAR(50) DEFAULT 'TIKTOK',
      username VARCHAR(255),
      profile_url VARCHAR(500),
      followers INT DEFAULT 0,
      client_price INT DEFAULT 0,
      net_cost INT DEFAULT 0,
      profit INT DEFAULT 0,
      draft_deadline VARCHAR(50),
      live_deadline VARCHAR(50),
      draft_link VARCHAR(500),
      live_link VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createInfluencerSocialsTable = `
    CREATE TABLE IF NOT EXISTS influencer_socials (
      id VARCHAR(50) PRIMARY KEY,
      influencer_id VARCHAR(50) NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL,
      username VARCHAR(255) NOT NULL,
      profile_url VARCHAR(500),
      followers INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(influencer_id, platform)
    );
  `;

  try {
    await pool.query(createCampaignsTable);
    
    // Attempt to create influencers table or alter it if missing columns
    await pool.query(createInfluencersTable);
    
    // Add new columns if migrating from old influencers table
    try {
      await pool.query("ALTER TABLE influencers ADD COLUMN IF NOT EXISTS phone VARCHAR(100)");
      await pool.query("ALTER TABLE influencers ADD COLUMN IF NOT EXISTS email VARCHAR(255)");
      await pool.query("ALTER TABLE influencers ADD COLUMN IF NOT EXISTS line_id VARCHAR(255)");
      await pool.query("ALTER TABLE influencers ADD COLUMN IF NOT EXISTS nickname VARCHAR(255)");
      await pool.query("ALTER TABLE influencers ADD COLUMN IF NOT EXISTS address TEXT");
      await pool.query("ALTER TABLE influencers ADD COLUMN IF NOT EXISTS base_client_price INT DEFAULT 0");
      await pool.query("ALTER TABLE influencers ADD COLUMN IF NOT EXISTS base_net_cost INT DEFAULT 0");
    } catch (err) {
      console.log("Columns already exist or alter failed softly.", err);
    }

    await pool.query(createCampaignKolsTable);
    
    // Add new columns to campaign_kols if they don't exist
    try {
      await pool.query("ALTER TABLE campaign_kols ADD COLUMN IF NOT EXISTS platform VARCHAR(50) DEFAULT 'TIKTOK'");
      await pool.query("ALTER TABLE campaign_kols ADD COLUMN IF NOT EXISTS username VARCHAR(255)");
      await pool.query("ALTER TABLE campaign_kols ADD COLUMN IF NOT EXISTS profile_url VARCHAR(500)");
      await pool.query("ALTER TABLE campaign_kols ADD COLUMN IF NOT EXISTS followers INT DEFAULT 0");
    } catch(err) {}

    await pool.query(createInfluencerSocialsTable);
    
    // Auto-migrate existing influencer platforms to the socials table
    try {
      await pool.query(`
        INSERT INTO influencer_socials (id, influencer_id, platform, username, profile_url, followers)
        SELECT gen_random_uuid()::varchar, id, platform, name, profile_url, followers
        FROM influencers
        ON CONFLICT (influencer_id, platform) DO NOTHING;
      `);
      
      // Auto-migrate campaign_kols platform info from influencers
      await pool.query(`
        UPDATE campaign_kols ck
        SET platform = i.platform,
            username = i.name,
            profile_url = i.profile_url,
            followers = i.followers
        FROM influencers i
        WHERE ck.influencer_id = i.id AND ck.platform = 'TIKTOK' AND ck.username IS NULL;
      `);
    } catch(err) {
      console.log("Migration of platforms failed softly", err);
    }
    console.log("Database tables 'campaigns', 'influencers' and 'campaign_kols' verified.");

    // Seed campaigns if empty
    const checkCampEmpty = await pool.query("SELECT COUNT(*) FROM campaigns");
    if (parseInt(checkCampEmpty.rows[0].count, 10) === 0) {
      console.log("Seeding campaigns table...");
      for (const camp of INITIAL_CAMPAIGNS) {
        await pool.query(
          "INSERT INTO campaigns (id, name, brand) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
          [camp.id, camp.name, camp.brand]
        );
      }
    }

    // Check if old 'kols' table exists and needs migration
    const kolsExistCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'kols'
      );
    `);

    if (kolsExistCheck.rows[0].exists) {
      console.log("Old 'kols' table detected. Starting migration to normalized schema...");
      
      const oldKols = await pool.query("SELECT * FROM kols");
      for (const row of oldKols.rows) {
        // Find or create influencer
        let infId = "";
        const existingInf = await pool.query("SELECT id FROM influencers WHERE name = $1", [row.name]);
        if (existingInf.rows.length > 0) {
          infId = existingInf.rows[0].id;
        } else {
          infId = `INF-${String(Math.random()).substring(2, 8)}`;
          await pool.query(`
            INSERT INTO influencers (id, name, platform, followers, profile_url, behavioral_remark, deal_conditions, base_client_price, base_net_cost)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [infId, row.name, row.platform, row.followers, row.profile_url || "", row.behavioral_remark || "", row.deal_conditions || "", row.client_price || 0, row.net_cost || 0]);
        }

        // Insert assignment
        await pool.query(`
          INSERT INTO campaign_kols (id, influencer_id, campaign_id, status, client_price, net_cost, profit, draft_deadline, live_deadline, draft_link, live_link)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING
        `, [row.id, infId, row.campaign_id || "CAMP-001", row.status, row.client_price, row.net_cost, row.profit, row.draft_deadline, row.live_deadline, row.draft_link, row.live_link]);
      }

      // Rename old table to prevent repeating migration
      await pool.query("ALTER TABLE kols RENAME TO kols_old");
      console.log("Migration completed. Old table renamed to 'kols_old'.");
    }

    // Seed database if empty
    const checkEmpty = await pool.query("SELECT COUNT(*) FROM campaign_kols");
    if (parseInt(checkEmpty.rows[0].count, 10) === 0) {
      console.log("Seeding normalized database with initial records...");
      for (const kol of INITIAL_KOLS) {
        await addKOL({
          ...kol,
          phone: "", email: "", lineId: "", nickname: "", address: "", baseClientPrice: kol.clientPrice, baseNetCost: kol.netCost
        } as KOL);
      }
      console.log("Seeding complete.");
    }
  } catch (err) {
    console.error("Error initializing database schema, falling back to memory:", err);
    useMemoryFallback = true;
  }
}

export async function getAllKOLs(): Promise<KOL[]> {
  if (useMemoryFallback || !pool) {
    return memoryAssignments.map(a => {
      const inf = memoryInfluencers.find(i => i.id === a.influencerId);
      return {
        id: a.id,
        influencerId: a.influencerId,
        name: inf ? inf.name : "Unknown Influencer",
        platform: inf ? inf.platform : KOLPlatform.TIKTOK,
        followers: inf ? inf.followers : 0,
        phone: inf ? inf.phone : "",
        email: inf ? inf.email : "",
        lineId: inf ? inf.lineId : "",
        nickname: inf ? inf.nickname : "",
        address: inf ? inf.address : "",
        profileUrl: inf ? inf.profileUrl : "",
        behavioralRemark: inf ? inf.behavioralRemark : "",
        dealConditions: inf ? inf.dealConditions : "",
        baseClientPrice: inf ? inf.baseClientPrice : 0,
        baseNetCost: inf ? inf.baseNetCost : 0,
        campaignId: a.campaignId,
        status: a.status,
        clientPrice: a.clientPrice,
        netCost: a.netCost,
        profit: a.profit,
        draftDeadline: a.draftDeadline,
        liveDeadline: a.liveDeadline,
        draftLink: a.draftLink,
        liveLink: a.liveLink
      };
    });
  }


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
}


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


export async function deleteKOL(id: string): Promise<boolean> {
  if (useMemoryFallback || !pool) {
    const assignIndex = memoryAssignments.findIndex((a) => a.id === id);
    if (assignIndex === -1) return false;
    const assignment = memoryAssignments[assignIndex];
    memoryAssignments.splice(assignIndex, 1);
    
    const hasOther = memoryAssignments.some(a => a.influencerId === assignment.influencerId);
    if (!hasOther) {
      memoryInfluencers = memoryInfluencers.filter(i => i.id !== assignment.influencerId);
    }
    return true;
  }

  try {
    const getAssign = await pool.query("SELECT influencer_id FROM campaign_kols WHERE id = $1", [id]);
    if (getAssign.rows.length === 0) return false;
    const influencerId = getAssign.rows[0].influencer_id;

    await pool.query("DELETE FROM campaign_kols WHERE id = $1", [id]);

    const otherAssign = await pool.query("SELECT COUNT(*) FROM campaign_kols WHERE influencer_id = $1", [influencerId]);
    if (parseInt(otherAssign.rows[0].count, 10) === 0) {
      await pool.query("DELETE FROM influencers WHERE id = $1", [influencerId]);
    }
    return true;
  } catch (err) {
    console.error(`Failed to delete assignment ${id} from database:`, err);
    return false;
  }
}

// --- CAMPAIGN CRUD METHODS ---

export async function getAllCampaigns(): Promise<Campaign[]> {
  if (useMemoryFallback || !pool) {
    return [...memoryCampaigns];
  }
  try {
    const res = await pool.query("SELECT id, name, brand FROM campaigns ORDER BY created_at DESC");
    return res.rows.map(r => ({ id: r.id, name: r.name, brand: r.brand }));
  } catch (err) {
    console.error("Failed to query campaigns from database, using memory:", err);
    return [...memoryCampaigns];
  }
}

export async function addCampaign(campaign: Campaign): Promise<Campaign> {
  if (useMemoryFallback || !pool) {
    const newCamp = { ...campaign, id: campaign.id || `CAMP-${String(memoryCampaigns.length + 1).padStart(3, "0")}` };
    memoryCampaigns.push(newCamp);
    return newCamp;
  }
  try {
    const id = campaign.id || `CAMP-${String(Math.random()).substring(2, 8)}`;
    const query = `
      INSERT INTO campaigns (id, name, brand)
      VALUES ($1, $2, $3)
      RETURNING id, name, brand
    `;
    const res = await pool.query(query, [id, campaign.name, campaign.brand]);
    return res.rows[0];
  } catch (err) {
    console.error("Failed to add campaign to database:", err);
    return campaign;
  }
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  if (useMemoryFallback || !pool) {
    const index = memoryCampaigns.findIndex(c => c.id === id);
    if (index === -1) return null;
    memoryCampaigns[index] = { ...memoryCampaigns[index], ...updates };
    return memoryCampaigns[index];
  }
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) { fields.push(`name = $${idx++}`); values.push(updates.name); }
    if (updates.brand !== undefined) { fields.push(`brand = $${idx++}`); values.push(updates.brand); }

    if (fields.length === 0) return null;
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE campaigns 
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, name, brand
    `;
    const res = await pool.query(query, values);
    return res.rows.length ? res.rows[0] : null;
  } catch (err) {
    console.error(`Failed to update campaign ${id} in database:`, err);
    return null;
  }
}

export async function deleteCampaign(id: string): Promise<boolean> {
  if (useMemoryFallback || !pool) {
    const index = memoryCampaigns.findIndex(c => c.id === id);
    if (index === -1) return false;
    memoryCampaigns.splice(index, 1);
    return true;
  }
  try {
    const res = await pool.query("DELETE FROM campaigns WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    console.error(`Failed to delete campaign ${id} from database:`, err);
    return false;
  }
}



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
