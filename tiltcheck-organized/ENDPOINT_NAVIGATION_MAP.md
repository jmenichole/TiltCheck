# 🛡️ TiltCheck Ecosystem - Complete Endpoint & Navigation Map

## 🌐 **Service Architecture**

| Service | Port | Base URL | Status |
|---------|------|----------|--------|
| **TiltCheck Webapp** | 3000 | `http://localhost:3000` | ✅ Running |
| **QualifyFirst Platform** | 3001 | `http://localhost:3001` | ✅ Running |
| **Integration Bridge API** | 3002 | `http://localhost:3002` | ✅ Running |

---

## 🛡️ **TiltCheck Webapp (Port 3000)**

### **Navigation Links (All use smooth scroll)**
| Link | Action | Target Section |
|------|--------|----------------|
| **Features** | `handleNavClick(e, 'features')` | Scrolls to `#features` |
| **Extension** | `handleNavClick(e, 'extension')` | Scrolls to `#extension` |
| **Earn Money** | `handleNavClick(e, 'surveys')` | Scrolls to `#surveys` |
| **Contact** | `handleNavClick(e, 'contact')` | Scrolls to `#contact` |

### **Action Buttons**
| Button | Function | Description |
|--------|----------|-------------|
| **Get Extension** (Nav) | `handleNavClick(e, 'extension')` | Scrolls to extension section |
| **Install Chrome Extension** (Hero) | `handleNavClick(e, 'extension')` | Scrolls to extension section |
| **📥 Install from Chrome Store** | *No action yet* | Future Chrome Web Store link |
| **🔧 Load Unpacked (Developers)** | `window.open('chrome://extensions/', '_blank')` | Opens Chrome extensions page |
| **🚀 Start Earning Now** | `window.open('http://localhost:3001', '_blank')` | Opens QualifyFirst platform |

### **External Resource Links**
| Link | URL | Purpose |
|------|-----|---------|
| **National Council on Problem Gambling** | `https://www.ncpgambling.org/` | Gambling addiction resources |
| **Gamblers Anonymous** | `https://www.gamblersanonymous.org/` | Support community |
| **SAMHSA National Helpline** | `https://www.samhsa.gov/` | Mental health services |
| **Crisis Hotline** | `tel:1-800-522-4700` | Emergency support |

### **Page Sections (Anchor Targets)**
- `#features` - How TiltCheck Works
- `#extension` - Chrome Extension Installation
- `#surveys` - QualifyFirst Integration Info
- `#contact` - Support & Resources

---

## 💰 **QualifyFirst Platform (Port 3001)**

### **Main Routes**
| Route | File | Description |
|-------|------|-------------|
| **`/`** | `app/page.tsx` | Home/Landing page |
| **`/login`** | `app/login/page.tsx` | User authentication |
| **`/dashboard`** | `app/dashboard/page.tsx` | Standard user dashboard |
| **`/smart-dashboard`** | `app/smart-dashboard/page.tsx` | Enhanced dashboard with TiltCheck features |
| **`/profile`** | `app/profile/page.tsx` | User profile management |
| **`/profile/edit`** | `app/profile/edit/page.tsx` | Edit user information |
| **`/profile/complete`** | `app/profile/complete/page.tsx` | Complete profile setup |
| **`/profile/save-profile`** | `app/profile/save-profile/page.tsx` | Save profile changes |

### **Survey & Earning Routes**
| Route | File | Description |
|-------|------|-------------|
| **`/cpx-research`** | `app/cpx-research/page.tsx` | CPX Research survey integration |
| **`/referrals`** | `app/referrals/page.tsx` | Referral program management |
| **`/test-referral`** | `app/test-referral/page.tsx` | Test referral functionality |

### **Legal Pages**
| Route | File | Description |
|-------|------|-------------|
| **`/legal/privacy-policy`** | `app/legal/privacy-policy/page.tsx` | Privacy policy |
| **`/legal/terms-of-service`** | `app/legal/terms-of-service/page.tsx` | Terms of service |

### **API Routes**
| Route | File | Description |
|-------|------|-------------|
| **`/auth/callback`** | `app/auth/callback/route.tsx` | Authentication callback |

---

## 🔗 **Integration Bridge API (Port 3002)**

### **Health & Status Endpoints**
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| **GET** | `/health` | Service health check | `{"status": "healthy", "timestamp": "..."}` |
| **GET** | `/api/integration/status` | Integration status | Service status for both platforms |

### **Intervention Endpoints**
| Method | Endpoint | Description | Body Parameters |
|--------|----------|-------------|-----------------|
| **POST** | `/api/intervention/redirect` | Handle tilt detection & redirect | `userId`, `tiltLevel`, `gamblingSession` |

### **Revenue Tracking Endpoints**  
| Method | Endpoint | Description | Body Parameters |
|--------|----------|-------------|-----------------|
| **POST** | `/api/revenue/track` | Track survey earnings & revenue share | `userId`, `surveyCompleted`, `earningAmount` |

---

## 🎯 **Cross-Platform Integration Flow**

### **User Journey Map**
1. **TiltCheck Detection** → Chrome Extension detects tilt
2. **Intervention Trigger** → POST to `/api/intervention/redirect`
3. **QualifyFirst Redirect** → User sent to `localhost:3001/cpx-research`
4. **Survey Completion** → Revenue tracked via `/api/revenue/track`
5. **Revenue Sharing** → 25% to TiltCheck, 75% to user

### **Navigation Bridges**
| From | To | Trigger | Method |
|------|----|---------|---------
| **TiltCheck Landing** | **QualifyFirst** | "Start Earning Now" button | `window.open('http://localhost:3001')` |
| **Chrome Extension** | **QualifyFirst** | Tilt detection | API call → redirect |
| **TiltCheck Landing** | **Chrome Extensions** | "Load Unpacked" button | `window.open('chrome://extensions/')` |

---

## 🛡️ **Chrome Extension Endpoints**

### **Extension Installation**
- **Developer Mode**: `chrome://extensions/` → Load Unpacked
- **Extension Folder**: `/Users/fullsail/tiltcheck/tiltcheck-organized/extension/`
- **Future Store**: Chrome Web Store (not yet published)

### **Extension Functionality**
- **Background Script**: Monitors gambling sites
- **Content Script**: Injects tilt detection
- **Popup Interface**: Shows statistics and settings
- **Overlay System**: Displays intervention UI

---

## 🚀 **Quick Access URLs**

| Service | URL | Purpose |
|---------|-----|---------|
| **🛡️ TiltCheck Home** | `http://localhost:3000` | Main landing page |
| **💰 QualifyFirst Dashboard** | `http://localhost:3001/dashboard` | User earnings dashboard |
| **🎯 CPX Research Surveys** | `http://localhost:3001/cpx-research` | Survey completion |
| **⚙️ Chrome Extensions** | `chrome://extensions/` | Extension installation |
| **🔗 API Health Check** | `http://localhost:3002/health` | Service status |
| **📊 Integration Status** | `http://localhost:3002/api/integration/status` | Platform connectivity |

---

## 📱 **Mobile Responsive Endpoints**

All endpoints are responsive and work on mobile devices:
- **TiltCheck**: Responsive design with mobile navigation
- **QualifyFirst**: Mobile-optimized survey interface  
- **API**: RESTful endpoints work with any client

---

*This mapping covers all active endpoints and navigation paths in your TiltCheck ecosystem. All services are currently running and accessible via the listed URLs.* 🎯