#!/bin/bash

# Session Monitor for ClawMarket
# Watches .opencode/logs/ for new sessions and displays latest activity
# Usage: ./monitor-sessions.sh or just monitor-sessions

LOG_DIR=".opencode/logs"
INTERVAL=300  # 5 minutes

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Store last known file count
LAST_COUNT=$(ls -1 "$LOG_DIR"/*.md 2>/dev/null | wc -l)

echo -e "${BLUE}🔍 Starting Session Monitor${NC}"
echo -e "${BLUE}   Watching: $LOG_DIR${NC}"
echo -e "${BLUE}   Interval: 5 minutes${NC}"
echo -e "${BLUE}   Press Ctrl+C to stop${NC}"
echo ""

while true; do
    # Get current file count
    CURRENT_COUNT=$(ls -1 "$LOG_DIR"/*.md 2>/dev/null | wc -l)
    
    # Get timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    if [ "$CURRENT_COUNT" -gt "$LAST_COUNT" ]; then
        NEW_FILES=$((CURRENT_COUNT - LAST_COUNT))
        echo -e "${GREEN}[$TIMESTAMP] ✨ $NEW_FILES new session(s) detected!${NC}"
        echo ""
        
        # Show latest files
        echo -e "${YELLOW}Latest sessions:${NC}"
        ls -lt "$LOG_DIR"/*.md 2>/dev/null | head -5 | awk '{print "  " $9 " (" $6 " " $7 " " $8 ")"}'
        echo ""
        
        # Show latest session details
        LATEST_FILE=$(ls -t "$LOG_DIR"/*.md 2>/dev/null | head -1)
        if [ -f "$LATEST_FILE" ]; then
            echo -e "${YELLOW}Latest session details:${NC}"
            ROAD=$(grep "roadmap_item:" "$LATEST_FILE" 2>/dev/null | head -1 | cut -d':' -f2 | tr -d ' ')
            STATUS=$(grep "status:" "$LATEST_FILE" 2>/dev/null | head -1 | cut -d':' -f2 | tr -d ' ')
            MODEL=$(grep "model:" "$LATEST_FILE" 2>/dev/null | head -1 | cut -d':' -f2 | tr -d ' ')
            
            [ -n "$ROAD" ] && echo -e "  Roadmap Item: ${GREEN}$ROAD${NC}"
            [ -n "$STATUS" ] && echo -e "  Status: ${GREEN}$STATUS${NC}"
            [ -n "$MODEL" ] && echo -e "  Model: ${GREEN}$MODEL${NC}"
            echo ""
        fi
        
        echo -e "${YELLOW}💡 OpenCode Command (copy & paste):${NC}"
        echo -e "${GREEN}   @agent-manager analyze session for $ROAD${NC}"
        echo ""
        
        # Try to copy to clipboard if available
        if command -v pbcopy &> /dev/null; then
            echo "@agent-manager analyze session for $ROAD" | pbcopy
            echo -e "${GREEN}   (copied to clipboard!)${NC}"
        elif command -v xclip &> /dev/null; then
            echo "@agent-manager analyze session for $ROAD" | xclip -selection clipboard
            echo -e "${GREEN}   (copied to clipboard!)${NC}"
        elif command -v clip &> /dev/null; then
            echo "@agent-manager analyze session for $ROAD" | clip
            echo -e "${GREEN}   (copied to clipboard!)${NC}"
        fi
        echo ""
        
        # Update last count
        LAST_COUNT=$CURRENT_COUNT
    else
        echo -e "[$TIMESTAMP] ✓ No new sessions (total: $CURRENT_COUNT)"
    fi
    
    # Show recent activity summary every hour (12 intervals)
    MINUTE=$(date +%M)
    if [ "$MINUTE" == "00" ] || [ "$MINUTE" == "30" ]; then
        echo ""
        echo -e "${BLUE}📊 Recent Activity Summary:${NC}"
        ls -lt "$LOG_DIR"/*.md 2>/dev/null | head -3 | while read line; do
            FILE=$(echo $line | awk '{print $9}')
            if [ -f "$FILE" ]; then
                ROAD=$(grep "roadmap_item:" "$FILE" 2>/dev/null | head -1 | cut -d':' -f2 | tr -d ' ')
                [ -n "$ROAD" ] && echo "  - $ROAD"
            fi
        done
        echo ""
    fi
    
    # Wait 5 minutes
    sleep $INTERVAL
done
