import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace the Promise.all fetch block
fetch_old = """    Promise.all([
      fetch("/api/kols").then((res) => res.json()),
      fetch("/api/campaigns").then((res) => res.json())
    ])
      .then(([kolsData, campsData]) => {
        setKols(kolsData);
        setCampaigns(campsData);
        setLoading(false);
      })"""

fetch_new = """    Promise.all([
      fetch("/api/kols").then((res) => res.json()),
      fetch("/api/campaigns").then((res) => res.json()),
      fetch("/api/influencers").then((res) => res.json())
    ])
      .then(([kolsData, campsData, infsData]) => {
        setKols(kolsData);
        setCampaigns(campsData);
        setInfluencers(infsData);
        setLoading(false);
      })"""

content = content.replace(fetch_old, fetch_new)

# Remove the unused handleAddKOL, handleUpdateKOL, handleDeleteKOL
content = re.sub(r'  // Callback to update any selected KOL.*?// Determine which tab to render based on selection', '  // Determine which tab to render based on selection', content, flags=re.DOTALL)

# Update the render switch block for CrmTab
crm_old = """          <CrmTab
            kols={kols}
            campaigns={campaigns}
            onUpdateKOL={handleUpdateKOL}
            onAddKOL={handleAddKOL}
            onDeleteKOL={handleDeleteKOL}
          />"""
crm_new = """          <CrmTab
            kols={kols}
            setKols={setKols}
            campaigns={campaigns}
            influencers={influencers}
            setInfluencers={setInfluencers}
          />"""

content = content.replace(crm_old, crm_new)

# Update CampaignsTab
camps_old = """          <CampaignsTab 
            campaigns={campaigns}
            setCampaigns={setCampaigns}
          />"""
camps_new = """          <CampaignsTab 
            campaigns={campaigns}
            setCampaigns={setCampaigns}
            influencers={influencers}
            setKols={setKols}
          />"""

content = content.replace(camps_old, camps_new)

with open("src/App.tsx", "w") as f:
    f.write(content)
