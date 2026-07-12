#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Travel Gold - cPanel Deployment Script ===${NC}\n"

# 1. Check Node.js
echo -e "${YELLOW}1. Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}\n"

# 2. Install dependencies
echo -e "${YELLOW}2. Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install root dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Root dependencies installed${NC}\n"

# 3. Install client dependencies
echo -e "${YELLOW}3. Installing client dependencies...${NC}"
npm install --prefix client
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install client dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Client dependencies installed${NC}\n"

# 4. Install server dependencies
echo -e "${YELLOW}4. Installing server dependencies...${NC}"
npm install --prefix server
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install server dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server dependencies installed${NC}\n"

# 5. Build Vite frontend
echo -e "${YELLOW}5. Building Vite frontend...${NC}"
npm run build --prefix client
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend built successfully${NC}\n"

# 6. Create .env if not exists
echo -e "${YELLOW}6. Checking environment configuration...${NC}"
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Backend Configuration
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=your_database_url
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password

# JWT/Auth
JWT_SECRET=change_this_to_random_string

# API Configuration
VITE_API_URL=https://vanirgroup.com/api

# Email (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password

# Firebase (if using)
FIREBASE_API_KEY=your_key
FIREBASE_PROJECT_ID=your_project_id
EOF
    echo -e "${YELLOW}Created .env file. Please edit it with your credentials${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi
echo ""

# 7. Summary
echo -e "${GREEN}=== Deployment Preparation Complete ===${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Edit .env file with your actual credentials"
echo "2. Upload to cPanel (git push or FTP)"
echo "3. In cPanel Node.js Manager:"
echo "   - Create new application"
echo "   - Set startup file to: start.js"
echo "   - Set application root to: /home/your_user/public_html/travel-gold"
echo "   - Click Create"
echo ""
echo -e "${GREEN}✓ Ready for cPanel deployment!${NC}"
