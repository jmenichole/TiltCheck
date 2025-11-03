# Contributing to TiltCheck

First off, thank you for considering contributing to TiltCheck! It's people like you that make TiltCheck such a great tool for promoting responsible gaming.

## 🎯 Mission Statement

TiltCheck is dedicated to promoting responsible gaming through intelligent player behavior monitoring, trust scoring, and timely interventions. Every contribution should align with this mission of helping players make better decisions and maintain healthy gaming habits.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Community Testing Program](#community-testing-program)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards other community members

**Unacceptable behaviors:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Promoting gambling addiction or irresponsible gaming
- Other conduct that could reasonably be considered inappropriate

---

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**Good bug reports include:**
- Clear, descriptive title
- Exact steps to reproduce the problem
- Expected vs. actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, browser)
- Any relevant error messages or logs

**Template:**
```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., Ubuntu 22.04]
- Node Version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 118]

## Additional Context
[Screenshots, logs, etc.]
```

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**Good enhancement suggestions include:**
- Clear use case and problem statement
- Proposed solution with examples
- Alternative solutions you've considered
- How it aligns with responsible gaming goals
- Any potential risks or concerns

### 🔧 Code Contributions

We welcome code contributions in these areas:

1. **Tilt Detection Improvements**
   - New detection algorithms
   - Better threshold tuning
   - Edge case handling

2. **Trust Score System**
   - New verification methods
   - Scam detection improvements
   - Trust score visualization

3. **Analytics & Reporting**
   - New metrics
   - Better dashboards
   - Export functionality

4. **NFT Integration**
   - Metadata improvements
   - Cross-chain support
   - Dynamic NFT features

5. **Security Enhancements**
   - Vulnerability fixes
   - Better encryption
   - Input validation

6. **Documentation**
   - Tutorial improvements
   - API documentation
   - Code examples

7. **Testing**
   - Unit tests
   - Integration tests
   - End-to-end tests

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git
- MongoDB (for local development)
- A Discord account for bot testing

### Local Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/TiltCheck.git
   cd TiltCheck
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Create data directories**
   ```bash
   mkdir -p data analytics/logs analytics/data
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Run tests**
   ```bash
   npm test
   ```

### Development Workflow

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes and test them
npm test

# Commit with clear messages
git commit -m "Add feature: description of what you did"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

---

## 📝 Coding Standards

### JavaScript/TypeScript

We follow industry-standard practices:

```javascript
// ✅ Good
function calculateTiltScore(player) {
    const { bettingHistory, sessionDuration } = player;
    
    if (!bettingHistory || bettingHistory.length === 0) {
        return 0;
    }
    
    const recentBets = bettingHistory.slice(-10);
    const avgBetSize = recentBets.reduce((sum, bet) => sum + bet.amount, 0) / recentBets.length;
    
    return avgBetSize * Math.log(sessionDuration + 1);
}

// ❌ Bad
function calc(p) {
    if(!p.b) return 0;
    var r=p.b.slice(-10);
    var a=r.reduce((s,b)=>s+b.a,0)/r.length;
    return a*Math.log(p.d+1);
}
```

### Code Style

- **Indentation**: 4 spaces (not tabs)
- **Line Length**: Max 100 characters
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use them
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Comments**: JSDoc for functions, inline for complex logic

### File Organization

```javascript
/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * [Brief description of file purpose]
 */

// Imports
const fs = require('fs');
const path = require('path');

// Constants
const DEFAULT_CONFIG = { /* ... */ };

// Class definition
class TiltChecker {
    constructor() {
        // ...
    }

    // Public methods
    trackPlayer(playerId, options) {
        // ...
    }

    // Private methods
    _calculateScore(player) {
        // ...
    }
}

// Exports
module.exports = TiltChecker;
```

### JSDoc Comments

All public functions must have JSDoc comments:

```javascript
/**
 * Track a new player for tilt monitoring
 * 
 * @param {string} playerId - Unique player identifier
 * @param {Object} options - Configuration options
 * @param {number} options.initialStake - Starting balance
 * @param {string} options.riskProfile - 'low' | 'medium' | 'high'
 * @returns {Object} Player tracking object
 * @throws {Error} If playerId is invalid
 * 
 * @example
 * const player = tiltChecker.trackPlayer('player-123', {
 *     initialStake: 1000,
 *     riskProfile: 'medium'
 * });
 */
trackPlayer(playerId, options) {
    // Implementation
}
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows our style guidelines
- [ ] All tests pass (`npm test`)
- [ ] New tests cover your changes
- [ ] Documentation is updated
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] No merge conflicts with main branch

### PR Description Template

```markdown
## Description
[Clear description of what this PR does]

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Security fix

## Related Issues
Fixes #[issue number]

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing
- [ ] Beta user testing

## Testing Instructions
1. Step one
2. Step two
3. Expected result

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Additional Notes
[Any additional information]
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one maintainer reviews
3. **Testing**: Changes are tested in staging environment
4. **Approval**: Requires approval from maintainer
5. **Merge**: Squash and merge to main branch

---

## 🧪 Testing Guidelines

### Test Coverage

We aim for 80%+ code coverage. All new features must include tests.

### Test Structure

```javascript
const TiltChecker = require('./tiltCheck');

describe('TiltChecker', () => {
    let tiltChecker;

    beforeEach(() => {
        tiltChecker = new TiltChecker('test-api-key');
    });

    afterEach(() => {
        // Cleanup
    });

    describe('trackPlayer', () => {
        it('should create a new player tracking object', () => {
            const player = tiltChecker.trackPlayer('test-1', {
                initialStake: 1000
            });

            expect(player).toBeDefined();
            expect(player.id).toBe('test-1');
            expect(player.currentStake).toBe(1000);
        });

        it('should throw error for invalid playerId', () => {
            expect(() => {
                tiltChecker.trackPlayer('');
            }).toThrow('Invalid player ID');
        });
    });

    describe('tilt detection', () => {
        it('should detect stake increase tilt', () => {
            const player = tiltChecker.trackPlayer('test-2', {
                initialStake: 100
            });

            // Normal bets
            for (let i = 0; i < 5; i++) {
                tiltChecker.updatePlayerActivity('test-2', {
                    type: 'bet',
                    amount: 10
                });
            }

            // Large bet
            tiltChecker.updatePlayerActivity('test-2', {
                type: 'bet',
                amount: 100
            });

            const stats = tiltChecker.getPlayerStats('test-2');
            expect(stats.alerts).toContainEqual(
                expect.objectContaining({
                    type: 'stakeIncrease',
                    severity: 'high'
                })
            );
        });
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test-tilt-protection.js

# Run with coverage
npm test -- --coverage

# Watch mode for development
npm test -- --watch
```

---

## 🌟 Community Testing Program

### Beta Tester Program

We have an active beta testing community. Benefits include:

- Early access to new features
- Direct input on product development
- Trust score bonuses
- Special beta tester NFT
- Recognition in release notes

### How to Join

1. Express interest in GitHub issues or Discord
2. Complete beta tester application
3. Receive beta access credentials
4. Participate in testing cycles
5. Provide structured feedback

### Testing Responsibilities

- Test new features thoroughly
- Report bugs with detailed information
- Provide constructive feedback
- Suggest improvements
- Help other testers

### Feedback Format

```markdown
## Feature Tested
[Feature name]

## Testing Environment
- Platform: [Web/Discord/Mobile]
- Browser/Client: [Version]
- Date: [YYYY-MM-DD]

## What Worked Well
- [List positive aspects]

## Issues Found
- [List issues with steps to reproduce]

## Suggestions
- [List improvement ideas]

## Overall Rating
[1-10 with brief explanation]
```

---

## 🏆 Recognition

Contributors are recognized in:
- README.md Contributors section
- Release notes
- Discord community
- Annual contributor awards
- Special trust score bonuses

### Contribution Levels

- **🥉 Bronze**: 1-5 merged PRs
- **🥈 Silver**: 6-15 merged PRs
- **🥇 Gold**: 16-30 merged PRs
- **💎 Diamond**: 31+ merged PRs or major features

---

## 📞 Getting Help

### Resources

- **Documentation**: [docs/](../docs/)
- **Discord**: [Join our community](https://discord.gg/tiltcheck)
- **GitHub Issues**: For bugs and features
- **Email**: dev@tiltcheck.io

### Questions?

Don't hesitate to ask! We're here to help:

- Open a GitHub Discussion for general questions
- Join Discord #dev-help channel
- Comment on relevant issues
- Reach out to maintainers

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](../../LICENSE) file).

---

## 🙏 Thank You!

Your contributions make TiltCheck better for everyone. Whether it's code, documentation, bug reports, or community support - every contribution matters!

Together, we're building a safer, more responsible gaming ecosystem.

---

*Last Updated: November 2024*
*Version: 2.0.0*

**Happy Contributing! 🎉**
