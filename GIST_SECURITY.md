# 🔐 Discord Bot Security Best Practices - Gist

## Essential Security Measures for Discord Bots

### 1. **Environment Variables Security**

```bash
# Never commit these files
.env
.env.local
.env.production
*.env

# Use environment templates instead
.env.template  # ✅ Safe to commit
.env.example   # ✅ Safe to commit
```

### 2. **Token Management**

```javascript
// ❌ NEVER do this
const token = "MTMzNjk2ODc0NjQ1MDgxMjkyOA.GqMKMJ.EXAMPLE_FAKE_TOKEN_NEVER_COMMIT_REAL_TOKENS";

// ✅ Always use environment variables
const token = process.env.DISCORD_BOT_TOKEN;

// ✅ Add validation
if (!token) {
    console.error('❌ Discord bot token is required');
    process.exit(1);
}
```

### 3. **Input Sanitization**

```javascript
// ✅ Sanitize user inputs
const sanitizeInput = (input) => {
    return input
        .replace(/[^\w\s]/gi, '') // Remove special characters
        .substring(0, 100)        // Limit length
        .trim();                  // Remove whitespace
};

// ✅ Unicode attack prevention
const normalizeText = (text) => {
    return text.normalize('NFKC');
};
```

### 4. **Rate Limiting**

```javascript
// ✅ Implement rate limiting
const rateLimits = new Map();

function checkRateLimit(userId, limit = 5, windowMs = 60000) {
    const now = Date.now();
    const userLimits = rateLimits.get(userId) || { count: 0, resetTime: now + windowMs };
    
    if (now > userLimits.resetTime) {
        userLimits.count = 0;
        userLimits.resetTime = now + windowMs;
    }
    
    if (userLimits.count >= limit) {
        return false; // Rate limited
    }
    
    userLimits.count++;
    rateLimits.set(userId, userLimits);
    return true; // Allowed
}
```

### 5. **Permission Validation**

```javascript
// ✅ Always validate permissions
const validatePermissions = (interaction, requiredPermissions) => {
    if (!interaction.member.permissions.has(requiredPermissions)) {
        return interaction.reply({ 
            content: '❌ You do not have permission to use this command.', 
            ephemeral: true 
        });
    }
    return true;
};
```

### 6. **Secure Error Handling**

```javascript
// ❌ Don't expose sensitive information
catch (error) {
    console.log(error); // This might log sensitive data
    await interaction.reply('Error: ' + error.message); // Exposes error details
}

// ✅ Secure error handling
catch (error) {
    console.error('Command error:', error.message); // Log safely
    await interaction.reply({ 
        content: '❌ An error occurred. Please try again later.', 
        ephemeral: true 
    });
}
```

### 7. **Database Security**

```javascript
// ✅ Use prepared statements
const getUserData = async (userId) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    return await database.query(query, [userId]);
};

// ❌ Never use string concatenation
const badQuery = `SELECT * FROM users WHERE id = ${userId}`; // SQL injection risk
```

### 8. **GitHub Integration Security**

```bash
# Environment variables for GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret    # Keep secret!
GITHUB_WEBHOOK_SECRET=your_webhook_secret  # Keep secret!
GITHUB_ACCESS_TOKEN=your_access_token      # Keep secret!
```

### 9. **Webhook Security**

```javascript
// ✅ Verify webhook signatures
const crypto = require('crypto');

function verifyGitHubSignature(payload, signature, secret) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(`sha256=${expectedSignature}`),
        Buffer.from(signature)
    );
}
```

### 10. **Dependency Security**

```bash
# Regular security audits
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update dependencies regularly
npm update

# Use exact versions for critical dependencies
"discord.js": "14.21.0"  # Exact version
```

### 11. **Logging Security**

```javascript
// ✅ Safe logging
const logInteraction = (interaction) => {
    console.log(`Command: ${interaction.commandName}, User: ${interaction.user.id}, Guild: ${interaction.guild?.id}`);
};

// ❌ Don't log sensitive data
console.log(`Token: ${process.env.DISCORD_BOT_TOKEN}`); // Never do this!
```

### 12. **Production Deployment**

```dockerfile
# ✅ Use non-root user in Docker
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# ✅ Set NODE_ENV
ENV NODE_ENV=production
```

## 🔍 Security Checklist

- [ ] All tokens in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] Input validation and sanitization
- [ ] Rate limiting implemented
- [ ] Permission checks on all commands
- [ ] Secure error handling
- [ ] Regular dependency updates
- [ ] Webhook signature verification
- [ ] Non-root Docker user
- [ ] Secure logging practices

## 🚨 Red Flags to Avoid

1. **Hardcoded tokens** in source code
2. **Committing `.env` files** to git
3. **Missing input validation** on user commands
4. **Exposing error details** to users
5. **Running as root** in production
6. **Ignoring dependency vulnerabilities**
7. **Missing permission checks**
8. **Logging sensitive information**

## 📚 Resources

- [Discord.js Security Guide](https://discordjs.guide/additional-info/security.html)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

**Remember**: Security is not optional - it's essential for protecting your users and community!
