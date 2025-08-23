#!/bin/bash

# Zazaki Game Deployment Script with Secret Argument
# This script helps deploy the Zazaki Language Learning Game to Netlify
# with the correct environment variables for FaunaDB integration.
#
# Usage: ./deploy-with-secret.sh YOUR_FAUNADB_SECRET_KEY

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Zazaki Language Learning Game Deployment ===${NC}"
echo -e "This script will deploy your game to Netlify with FaunaDB integration."
echo

# Check if a secret was provided as an argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: FaunaDB server secret is required as an argument.${NC}"
    echo -e "Usage: ${YELLOW}./deploy-with-secret.sh YOUR_FAUNADB_SECRET_KEY${NC}"
    exit 1
fi

FAUNA_SECRET="$1"
echo -e "${GREEN}FaunaDB secret provided.${NC}"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${RED}Error: Netlify CLI is not installed.${NC}"
    echo -e "Please install it with: ${YELLOW}npm install -g netlify-cli${NC}"
    exit 1
fi

# Check if user is logged in to Netlify
NETLIFY_USER=$(netlify status 2>&1 | grep "Email:" | cut -d ":" -f2 | xargs)
if [ -z "$NETLIFY_USER" ]; then
    echo -e "${YELLOW}You are not logged in to Netlify.${NC}"
    echo -e "Please log in with: ${YELLOW}netlify login${NC}"
    exit 1
else
    echo -e "${GREEN}Logged in to Netlify as:${NC} $NETLIFY_USER"
fi

# Check if the project is already linked to a Netlify site
SITE_NAME=$(netlify status 2>&1 | grep "Site:" | cut -d ":" -f2 | xargs)

if [ -z "$SITE_NAME" ]; then
    echo
    echo -e "${BLUE}Creating a new Netlify site...${NC}"
    
    # Initialize a new Netlify site
    netlify init
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to initialize Netlify site.${NC}"
        exit 1
    fi
    
    # Get the site name after initialization
    SITE_NAME=$(netlify status 2>&1 | grep "Site:" | cut -d ":" -f2 | xargs)
else
    echo
    echo -e "${GREEN}Project is already linked to Netlify site:${NC} $SITE_NAME"
fi

# Set the FaunaDB environment variable
echo
echo -e "${BLUE}Setting FaunaDB environment variable...${NC}"
netlify env:set FAUNADB_SERVER_SECRET "$FAUNA_SECRET"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to set environment variable.${NC}"
    exit 1
fi

# Build the project
echo
echo -e "${BLUE}Building the project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Build failed.${NC}"
    exit 1
fi

# Deploy to Netlify
echo
echo -e "${BLUE}Deploying to Netlify...${NC}"
netlify deploy --prod

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Deployment failed.${NC}"
    exit 1
fi

echo
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your Zazaki Language Learning Game is now deployed with FaunaDB integration."
echo -e "You can access the admin panel at: ${YELLOW}https://$SITE_NAME.netlify.app/admin.html${NC}"
echo -e "Default admin credentials: username: ${YELLOW}admin${NC}, password: ${YELLOW}zazaki123${NC}"
echo
echo -e "To test the Netlify Functions, visit: ${YELLOW}https://$SITE_NAME.netlify.app/function-tester.html${NC}"
echo
echo -e "If you encounter any issues, please refer to the ${YELLOW}TROUBLESHOOTING.md${NC} file."
