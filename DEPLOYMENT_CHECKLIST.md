# TiltCheck Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Dependencies
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Verify `jsonwebtoken` is installed (required for OAuth)
- [ ] Check `package.json` has all required dependencies

### 2. Tests
- [ ] Run `npm test` - Basic RTP and Claims tests
- [ ] Run `npm run test:all` - Full test suite (requires dependencies)
- [ ] Run `npm run test:rtp` - RTP verification only
- [ ] Run `npm run test:claims` - Casino claims analyzer only
- [ ] Run `npm run test:mobile` - Mobile integration (requires dependencies)
- [ ] Run `npm run test:compliance` - Compliance monitoring (requires dependencies)

### 3. Build & Lint
- [ ] Run `npm run build` (currently skipped - no build required)
- [ ] Run `npm run lint` (currently skipped - no linter configured)

### 4. Environment Variables
Ensure these are set in your deployment environment:

**Required:**
- [ ] `MAGIC_SECRET_KEY` - Magic.link secret key
- [ ] `MAGIC_PUBLISHABLE_KEY` - Magic.link public key
- [ ] `SESSION_SECRET` - Session encryption secret
- [ ] `DEVELOPER_DISCORD_WEBHOOK` - Discord webhook for alerts

**Optional:**
- [ ] `DATABASE_URL` - Database connection (production)
- [ ] `REDIS_URL` - Redis connection for sessions
- [ ] `AI_ENDPOINT` - AI/LLM endpoint for claims analysis
- [ ] `AI_API_KEY` - API key for AI service

### 5. File Structure
Verify these files exist:

**Core Systems:**
- [x] `rtpVerificationAnalyzer.js`
- [x] `aiFairnessMonitor.js`
- [x] `tiltCheckOAuthFlow.js`
- [x] `mobileGameplayAnalyzer.js`
- [x] `magicCollectClockAuth.js`
- [x] `casinoComplianceMonitor.js`
- [x] `provablyFairVerifier.js`
- [x] `casinoClaimsAnalyzer.js`
- [x] `legalTermsManager.js`

**Tests:**
- [x] `test_rtp_verification.js`
- [x] `test_casino_claims_analyzer.js`
- [x] `test_mobile_integration.js`
- [x] `test_compliance_monitoring.js`

**Documentation:**
- [x] `MOBILE_APP_INTEGRATION_GUIDE.md`
- [x] `IMPLEMENTATION_COMPLETE.md`
- [x] `COMPLETE_SYSTEM_SUMMARY.md`
- [x] `DEPLOYMENT_CHECKLIST.md` (this file)

### 6. Data Directories
These directories will be created automatically on first run:
- `./data/` - Storage for compliance data, claims, evidence
- `./data/casino_evidence/` - Evidence for legal cases

### 7. Port Configuration
Default ports (ensure they're available):
- `3000` - Main application
- `3001` - OAuth handler
- `3002` - CollectClock integration

## 🚀 Deployment Steps

### Railway Deployment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   - Add all required env vars in Railway dashboard
   - Verify `DEVELOPER_DISCORD_WEBHOOK` is valid

3. **Start Command**
   ```bash
   npm start
   ```

4. **Verify Deployment**
   - Check health endpoint: `curl https://your-app.railway.app/health`
   - Monitor logs for startup errors
   - Verify Discord webhook receives test alert

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` File**
   ```bash
   MAGIC_SECRET_KEY=your_key_here
   MAGIC_PUBLISHABLE_KEY=your_key_here
   SESSION_SECRET=generate_with_crypto
   DEVELOPER_DISCORD_WEBHOOK=your_webhook_url
   ```

3. **Run Tests**
   ```bash
   npm run test:all
   ```

4. **Start Server**
   ```bash
   npm start
   ```

## 🐛 Common Issues

### Issue: `Cannot find module 'jsonwebtoken'`
**Solution:** Run `npm install` to install all dependencies

### Issue: Test script fails with "crypto-test.js not found"
**Solution:** Fixed in latest commit. Use `npm run test:rtp` or `npm run test:claims`

### Issue: Mobile integration tests fail
**Solution:** Ensure dependencies are installed with `npm install`

### Issue: No Discord alerts received
**Solution:** Verify `DEVELOPER_DISCORD_WEBHOOK` environment variable is set and valid

### Issue: Data directory errors
**Solution:** Ensure write permissions for `./data/` directory. It will be created automatically.

## ✅ Post-Deployment Verification

1. **Health Check**
   ```bash
   curl https://your-app.railway.app/health
   ```

2. **Test OAuth Flow**
   - Visit OAuth initiation endpoint
   - Verify redirect works
   - Check session creation

3. **Test Compliance Alert**
   - Trigger a critical RTP deviation
   - Verify Discord webhook receives alert
   - Check evidence is saved

4. **Monitor Logs**
   - Watch for startup errors
   - Verify system initialization messages
   - Check for dependency warnings

## 📊 Success Criteria

✅ All core modules load without errors
✅ Tests pass (at minimum: RTP and Claims tests)
✅ Health endpoint responds
✅ Discord webhook receives alerts
✅ Data directories are writable
✅ No critical errors in logs

## 🆘 Support

If deployment fails:
- Check this checklist
- Review logs for error messages
- Verify all environment variables are set
- Ensure all dependencies are installed
- Contact @jmenichole on Discord

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
