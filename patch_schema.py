import re

with open("src/kolRepository.ts", "r") as f:
    content = f.read()

old_schema = """    CREATE TABLE IF NOT EXISTS influencers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      platform VARCHAR(50) NOT NULL,
      followers INT DEFAULT 0,
      phone VARCHAR(100),
      email VARCHAR(255),
      line_id VARCHAR(255),
      nickname VARCHAR(255),
      address TEXT,
      profile_url VARCHAR(500),
      behavioral_remark TEXT,
      deal_conditions TEXT,
      base_client_price DECIMAL(10, 2) DEFAULT 0,
      base_net_cost DECIMAL(10, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );"""

new_schema = """    CREATE TABLE IF NOT EXISTS influencers (
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
    );"""

content = content.replace(old_schema, new_schema)

with open("src/kolRepository.ts", "w") as f:
    f.write(content)
