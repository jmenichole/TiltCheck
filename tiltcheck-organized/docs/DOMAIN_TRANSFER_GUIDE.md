# Domain Transfer Guide - tiltcheck.it.com

## 🔄 Domain Transfer Options & Process

### Current Status
- **Domain**: tiltcheck.it.com
- **Current Registrar**: Namecheap
- **Purchase**: Recently acquired with Positive SSL certificate

### Why Transfer a Domain?

**Common Reasons:**
- Better pricing or features at another registrar
- Consolidate domains under one provider
- Better customer support
- More advanced DNS management tools
- Integration with hosting provider
- Better API access for automation

### ⚠️ Important Considerations Before Transfer

**60-Day Lock Period:**
- Newly registered domains cannot be transferred for 60 days
- Recent changes to registrant info also trigger 60-day lock
- Check your domain registration date first

**SSL Certificate Impact:**
- Your Positive SSL certificate from Namecheap may not transfer
- You'll need to reissue or purchase new SSL at destination registrar
- Consider timing: finish SSL setup before transferring

**Email & DNS Services:**
- Backup all DNS records before transfer
- Email forwarding services may be interrupted
- Plan DNS migration carefully

### 🎯 Recommended Registrars for Developers

#### 1. **Cloudflare Registrar** ⭐ BEST FOR DEVELOPERS
- **Pros:**
  - At-cost pricing (no markup)
  - Excellent DNS management
  - Free SSL certificates
  - Great API for automation
  - Advanced security features
  - Fast DNS propagation
- **Cons:**
  - Limited to existing Cloudflare customers
  - Fewer traditional registrar features
- **Transfer Cost**: At-cost (usually $8-12/year for .com)

#### 2. **Porkbun** ⭐ GREAT VALUE
- **Pros:**
  - Competitive pricing
  - Free WHOIS privacy
  - Good API
  - Developer-friendly
- **Cons:**
  - Smaller company
  - Less enterprise features
- **Transfer Cost**: Usually $8-10/year

#### 3. **Google Domains** (Now Squarespace)
- **Pros:**
  - Clean interface
  - Good integration with Google services
  - Reliable infrastructure
- **Cons:**
  - Recently acquired by Squarespace (uncertain future)
  - Higher pricing
- **Transfer Cost**: $12-15/year

#### 4. **AWS Route 53**
- **Pros:**
  - Excellent for AWS users
  - Programmatic management
  - High reliability
- **Cons:**
  - More expensive
  - Complex for simple use cases
- **Transfer Cost**: $12/year + DNS query charges

### 📋 Pre-Transfer Checklist

**1. Check Transfer Eligibility:**
```bash
# Check domain status
whois tiltcheck.it.com | grep -i "status\|lock\|transfer"
```

**2. Backup Current Configuration:**
- Export DNS records from Namecheap
- Document email forwarding rules
- Save SSL certificate details
- Note any special configurations

**3. Unlock Domain:**
- Login to Namecheap
- Disable domain lock/transfer protection
- Get authorization code (EPP code)

**4. Prepare New Registrar:**
- Create account at destination registrar
- Add payment method
- Verify contact information

### 🚀 Transfer Process (General Steps)

#### Step 1: Prepare at Current Registrar (Namecheap)
1. Login to Namecheap account
2. Go to Domain List
3. Click "Manage" next to tiltcheck.it.com
4. Disable "Domain Lock" or "Registrar Lock"
5. Get "Authorization Code" or "EPP Code"
6. Ensure contact email is accessible

#### Step 2: Initiate at New Registrar
1. Start transfer process at new registrar
2. Enter domain name: tiltcheck.it.com
3. Provide authorization code
4. Verify contact information
5. Pay transfer fee (usually includes 1-year renewal)

#### Step 3: Confirm Transfer
1. Check email for transfer confirmation
2. Approve transfer within 5 days
3. Wait for completion (usually 5-7 days)
4. Update DNS records at new registrar

### 🌐 DNS Migration Strategy

#### Current Namecheap DNS Records to Backup:
```bash
# Get current DNS records
dig tiltcheck.it.com ANY
dig www.tiltcheck.it.com A
dig api.tiltcheck.it.com A
dig dashboard.tiltcheck.it.com A
dig admin.tiltcheck.it.com A
```

#### Post-Transfer DNS Setup:
```bash
# Your VPS IP (replace with actual IP)
VPS_IP="YOUR_VPS_IP_HERE"

# Required DNS records:
# A records:
# tiltcheck.it.com → VPS_IP
# www.tiltcheck.it.com → VPS_IP
# api.tiltcheck.it.com → VPS_IP
# dashboard.tiltcheck.it.com → VPS_IP
# admin.tiltcheck.it.com → VPS_IP

# CNAME (alternative):
# www → tiltcheck.it.com
```

### 🔒 SSL Certificate Considerations

**Option 1: Free Let's Encrypt (Recommended)**
- Use the VPS deployment script
- Automatic renewal
- Works with any registrar
- No additional cost

**Option 2: Use Your Positive SSL**
- May need to reissue after transfer
- Contact new registrar about SSL options
- Consider migration timing

**Option 3: New SSL from New Registrar**
- Compare pricing with current setup
- Often included with hosting packages

### 💰 Cost Comparison

#### Staying with Namecheap:
- Domain renewal: ~$12-15/year
- SSL certificate: Already purchased
- Total: ~$12-15/year (plus SSL cost)

#### Transferring to Cloudflare:
- Transfer + 1 year renewal: ~$8-10
- SSL: Free
- DNS: Free (advanced features)
- Total: ~$8-10/year

#### Transferring to Porkbun:
- Transfer + 1 year renewal: ~$8-10
- SSL: ~$5-10/year or free basic
- DNS: Free
- Total: ~$8-20/year

### ⏰ Timeline Considerations

**Immediate (Today):**
- Check domain lock status
- Backup DNS records
- Get authorization code

**Within 24 hours:**
- Initiate transfer if desired
- Set up DNS at new registrar

**5-7 days:**
- Transfer completion
- Update all DNS records
- Test all services

### 🛡️ Risk Mitigation

**Minimize Downtime:**
1. Set up DNS records at new registrar BEFORE transfer completes
2. Lower TTL values 24 hours before transfer
3. Monitor services during transition
4. Have rollback plan ready

**Backup Plan:**
- Keep Namecheap account accessible during transfer
- Document all current settings
- Have VPS IP address ready
- Test DNS changes before going live

### 📞 When to Contact Support

**Namecheap Support Needed:**
- Domain appears locked and can't unlock
- Authorization code not working
- Transfer is blocked

**New Registrar Support Needed:**
- Transfer fails to initiate
- DNS setup questions
- SSL certificate issues

### 🎯 Recommendation for Your Situation

**For TiltCheck.it.com, I recommend:**

1. **Short-term**: Stay with Namecheap for now
   - You just purchased the domain and SSL
   - Focus on getting the site live first
   - Use the VPS deployment script with Let's Encrypt

2. **Long-term**: Consider Cloudflare transfer
   - Better developer tools
   - Lower costs
   - Superior DNS performance
   - Free SSL
   - Wait until after 60-day lock period

3. **Immediate action**: Set up VPS hosting
   - Use current Namecheap DNS
   - Point A records to your VPS IP
   - Get site live and tested
   - Plan transfer for later

### 🚀 Next Steps

**Today:**
1. Get your VPS IP address
2. Update Namecheap DNS to point to VPS
3. Run the VPS deployment script
4. Test the live site

**After site is stable (in 60+ days):**
1. Evaluate transfer benefits
2. Compare total costs (domain + SSL + features)
3. Execute transfer if beneficial

**Quick Namecheap DNS Update:**
```bash
# In Namecheap DNS management:
# Type: A, Host: @, Value: YOUR_VPS_IP
# Type: A, Host: www, Value: YOUR_VPS_IP
# Type: A, Host: api, Value: YOUR_VPS_IP
# Type: A, Host: dashboard, Value: YOUR_VPS_IP
# Type: A, Host: admin, Value: YOUR_VPS_IP
```

Would you like me to help you get the VPS deployment running first, or do you want to proceed with a domain transfer immediately?
