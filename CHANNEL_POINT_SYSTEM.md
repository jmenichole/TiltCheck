# 📊 Channel-Specific Point System

## Overview
The TrapHouse bot now awards different respect points based on which Discord channel users post in, encouraging more diverse community participation and transparency.

## Point Values

### Channel Bonuses
| Channel | Points | Purpose |
|---------|--------|---------|
| `#showoff-your-hits` | **50 points** | Regular wins, good plays, celebrations |
| `#busted-and-disgusted` | **75 points** | Losses, bad beats, learning moments |

### Other Point Sources (Unchanged)
| Action | Points | Notes |
|--------|--------|-------|
| `!work` command | 15 points | Daily grinding |
| 🔥 Fire reactions | 10 points | Community engagement |
| `!respect @user` | 100 points | 1-hour cooldown |
| Job completion | 25 points | Varies by job |

## Why More Points for Busted-and-Disgusted?

### 🎯 **Psychological Benefits**
- **Transparency Reward**: Users get extra points for being honest about losses
- **Learning Incentive**: Encourages sharing mistakes for community learning
- **Accountability Support**: Builds trust through vulnerability
- **Balanced Community**: Prevents only showing wins (promotes realistic gambling culture)

### 📈 **Strategic Impact**
- **50% Bonus**: 75 vs 50 points (25-point difference)
- **Encourages Honesty**: Higher reward for sharing struggles
- **Community Building**: Creates supportive environment for accountability
- **Anti-Toxic Culture**: Prevents "flexing only" mentality

## Implementation Details

### Code Changes
1. **New Respect Value**: Added `BUSTED_POST: 75` to respect values
2. **Generic Handler**: Created `handleChannelPost()` function for extensibility
3. **Channel Detection**: Enhanced message handler to detect both channels
4. **Documentation**: Updated help commands and guides

### Server Setup Required
To use this feature, Discord servers need:
1. Create `#showoff-your-hits` channel
2. Create `#busted-and-disgusted` channel  
3. Both channels should be in "The stove" category (or as desired)

### Testing
```bash
# Run the test script
node test_channel_points.js

# Test in Discord:
# 1. Post in #showoff-your-hits → Should award +50 points
# 2. Post in #busted-and-disgusted → Should award +75 points
# 3. Check !help command for updated information
```

## Future Enhancements

### Potential Additional Channels
- `#strategies-and-tips` (moderate points for educational content)
- `#tilt-recovery` (high points for tilt management posts)
- `#milestone-achievements` (variable points based on achievement level)

### Advanced Features
- **Streak Bonuses**: Extra points for consistent posting in both channels
- **Quality Metrics**: AI analysis of post quality for bonus points
- **Peer Ratings**: Community voting on most helpful posts
- **Monthly Challenges**: Special events with channel-specific goals

## Community Impact

### Expected Behavior Changes
1. **More Balanced Sharing**: Users will share both wins AND losses
2. **Increased Accountability**: Higher rewards for transparency create accountability culture
3. **Learning Community**: Mistakes become learning opportunities worth sharing
4. **Reduced Toxicity**: Less "wins only" mentality, more supportive environment

### Success Metrics
- **Channel Activity Balance**: Both channels should see regular activity
- **Community Sentiment**: More supportive responses to loss posts
- **Transparency Increase**: Users share struggles more openly
- **Learning Engagement**: Comments and discussions on busted posts

---

## Configuration Summary

```javascript
// respectManager.js - Point Values
const RESPECT_VALUES = {
    SHOWOFF_POST: 50,      // #showoff-your-hits
    BUSTED_POST: 75,       // #busted-and-disgusted (NEW)
    FIRE_REACTION: 10,
    JOB_COMPLETE: 25,
    RESPECT_GIVEN: 100,
    WORK_COMMAND: 15
};
```

This feature supports the TrapHouse bot's core mission of promoting responsible gambling through community accountability and transparency.
