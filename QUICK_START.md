# Quick Start - TiltCheck

> 📚 **Looking for more documentation?** See the [Documentation Index](DOCUMENTATION_INDEX.md) for all guides.

## 🚀 Quick Access

- **Live Site**: [https://tiltcheck.it.com](https://tiltcheck.it.com)
- **GitHub Repository**: [https://github.com/jmenichole/TiltCheck](https://github.com/jmenichole/TiltCheck)
- **Full Documentation**: [README.md](README.md)

## 🎯 For Developers

### 1. Clone the Repository
```bash
git clone https://github.com/jmenichole/TiltCheck.git
cd TiltCheck
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Development
```bash
npm start
```

## 🌐 Deployment

The site is automatically deployed to GitHub Pages at [https://tiltcheck.it.com](https://tiltcheck.it.com) when changes are pushed to the main branch.

For detailed deployment instructions, see:
- [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## ✅ What's Included

This PR adds:
- ✨ Automated deployment workflow
- 🔄 Auto-deploy on every push to main
- 📝 Complete setup documentation
- 🛠️ GitHub Actions configuration

## 📋 Checklist

Before merging:
- [ ] Review the workflow file: `.github/workflows/deploy.yml`
- [ ] Verify package.json has correct homepage URL

After merging:
- [ ] Go to Settings → Pages
- [ ] Set Source to "GitHub Actions"  
- [ ] Wait 2-3 minutes for first deployment
- [ ] Visit https://jmenichole.github.io/TiltCheck/

## 🆘 Need Help?

See detailed instructions in `GITHUB_PAGES_SETUP.md`

## 🎯 What You'll See

The TiltCheck landing page featuring:
- Professional hero section
- Feature showcase
- Stats and metrics
- Email subscription form
- Investor presentation button
- Dashboard demo button
