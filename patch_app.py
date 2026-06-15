import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add influencers state
content = content.replace("const [kols, setKols] = useState<KOL[]>([]);", "const [kols, setKols] = useState<KOL[]>([]);\n  const [influencers, setInfluencers] = useState<any[]>([]);")

# Add fetch call
fetch_camps = """        const resCamps = await fetch("/api/campaigns");
        if (resCamps.ok) setCampaigns(await resCamps.json());

        const resInfs = await fetch("/api/influencers");
        if (resInfs.ok) setInfluencers(await resInfs.json());"""

content = content.replace('const resCamps = await fetch("/api/campaigns");\n        if (resCamps.ok) setCampaigns(await resCamps.json());', fetch_camps)

# Pass influencers to Tabs
content = content.replace('<CampaignsTab campaigns={campaigns} setCampaigns={setCampaigns} />', '<CampaignsTab campaigns={campaigns} setCampaigns={setCampaigns} influencers={influencers} setKols={setKols} />')
content = content.replace('<CrmTab kols={kols} setKols={setKols} campaigns={campaigns} />', '<CrmTab kols={kols} setKols={setKols} campaigns={campaigns} influencers={influencers} setInfluencers={setInfluencers} />')

with open("src/App.tsx", "w") as f:
    f.write(content)
