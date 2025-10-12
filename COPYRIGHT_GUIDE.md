# Copyright Protection Guide for TiltCheck Repository

## Overview

This repository now has comprehensive copyright and licensing protection to prevent unauthorized use, copying, or theft of your intellectual property.

## Copyright Protection Components

### 1. Legal Files
- **LICENSE** - Full proprietary license terms
- **COPYRIGHT** - Detailed copyright and IP information
- **NOTICE** - Third-party attribution and legal notices
- **CONTRIBUTING.md** - Contributor guidelines and copyright requirements

### 2. Copyright Headers
All source code files (432+ files) now include copyright headers:

**JavaScript/TypeScript:**
```javascript
/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */
```

**HTML:**
```html
<!--
  Copyright (c) 2024-2025 JME (jmenichole)
  All Rights Reserved
  
  PROPRIETARY AND CONFIDENTIAL
  Unauthorized copying of this file, via any medium, is strictly prohibited.
  
  This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
  For licensing information, see LICENSE file in the root directory.
-->
```

### 3. Documentation Protection
- Main README.md includes comprehensive license section
- Key README files have copyright notices
- Package.json updated with copyright information

### 4. Automated Tools
- **add-copyright-headers.js** - Script to add headers to new files
- **.gitattributes** - Helps track copyright file changes

## What This Protects

### Intellectual Property
✅ **Protected Software Components:**
- TiltCheck - Player behavior monitoring system
- TrapHouse Discord Bot - Discord bot ecosystem
- JustTheTip Bot - Cryptocurrency accountability bot
- CollectClock - Timer and notification system
- Casino Trust Scoring - Casino compliance analysis
- NFT Trust System - Blockchain verification
- All APIs, algorithms, and business logic

✅ **Protected Trademarks:**
- TiltCheck™
- JustTheTip™
- TrapHouse Discord Bot™
- CollectClock™

### Legal Protection
✅ **Prevents:**
- Unauthorized copying of code
- Distribution without permission
- Commercial use without license
- Removal of copyright notices
- Reverse engineering
- Creation of derivative works

✅ **Establishes:**
- Clear ownership
- Copyright dates
- Licensing terms
- Contact information
- Legal recourse options

## Using the Copyright System

### Adding Headers to New Files

Run the automated script:
```bash
node add-copyright-headers.js
```

This will:
- Scan all source files
- Add copyright headers to files without them
- Skip files that already have copyright notices
- Provide summary of changes

### Manual Header Addition

If you need to add a header manually, use the templates in CONTRIBUTING.md or look at any existing file for the correct format.

### Checking Copyright Coverage

To see how many files have copyright headers:
```bash
# Count JS/TS files with copyright
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" \
  -exec grep -l "Copyright (c) 2024-2025 JME" {} \; | wc -l

# Count HTML files with copyright
find . -type f -name "*.html" ! -path "*/node_modules/*" ! -path "*/.git/*" \
  -exec grep -l "Copyright (c) 2024-2025 JME" {} \; | wc -l
```

## Best Practices

### 1. Always Include Headers
- Add copyright headers to every new file
- Use the automated script for batches
- Check headers before committing

### 2. Update Copyright Year
- When updating files in new years, update the year range
- Example: "2024-2025" becomes "2024-2026" in 2026

### 3. Protect Sensitive Code
- Keep proprietary algorithms confidential
- Don't share code snippets publicly
- Use private repositories only

### 4. Monitor Usage
- Watch for unauthorized forks
- Check for code theft via GitHub search
- Report violations via DMCA if needed

### 5. License Management
- Only grant licenses in writing
- Track who has access
- Revoke access when needed

## Enforcement

### If Someone Copies Your Code

1. **Document the Theft**
   - Take screenshots
   - Save URLs
   - Note dates

2. **Contact the Infringer**
   - Reference your copyright
   - Request removal
   - Set a deadline

3. **DMCA Takedown**
   - File DMCA with GitHub if ignored
   - GitHub: https://github.com/contact/dmca
   - Include all documentation

4. **Legal Action**
   - Consult a lawyer for serious cases
   - Copyright infringement has penalties
   - Keep all evidence

## Statistics

Current Protection Coverage:
- **JavaScript files**: 272+ with copyright headers
- **TypeScript/TSX files**: 12+ with copyright headers
- **HTML files**: 73+ with copyright headers
- **Shell scripts**: 45+ with copyright headers
- **Total protected files**: 400+ files

## Additional Resources

### GitHub Settings
Consider these GitHub repository settings for additional protection:

1. **Make Repository Private** (if not already)
   - Settings > General > Danger Zone
   - Only invite trusted collaborators

2. **Enable Branch Protection**
   - Require PR reviews
   - Prevent force pushes
   - Require signed commits

3. **Audit Log**
   - Review who accesses your code
   - Monitor for suspicious activity

### External Protection

1. **Copyright Registration**
   - Consider registering with US Copyright Office
   - Costs ~$65 per work
   - Provides additional legal benefits

2. **Patent Protection**
   - For unique algorithms/systems
   - More expensive but stronger protection
   - Consult a patent attorney

3. **Trademark Registration**
   - Register TiltCheck™ and other marks
   - US: USPTO.gov
   - Protects brand names

## Quick Reference

| File | Purpose |
|------|---------|
| LICENSE | Full legal license text |
| COPYRIGHT | Detailed copyright info |
| NOTICE | Attribution and disclaimers |
| CONTRIBUTING.md | Contributor guidelines |
| add-copyright-headers.js | Automated header tool |
| .gitattributes | Git tracking config |

## Questions?

For questions about copyright protection:
- See [CONTRIBUTING.md](CONTRIBUTING.md)
- See [LICENSE](LICENSE)
- Contact: https://github.com/jmenichole

---

**Last Updated:** January 2025

**Remember:** Copyright protection is automatic upon creation, but proper notice and documentation strengthen your legal position.
