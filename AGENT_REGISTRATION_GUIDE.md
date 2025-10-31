# TiltCheck Agent Registration Guide

This guide explains how to register your TiltCheck agent with Agentverse for discoverability and ASI Chat Protocol integration.

## Prerequisites

Before registering your agent, ensure you have:

1. **Agentverse Account**: Create a free account at [https://agentverse.ai](https://agentverse.ai)
2. **Agentverse API Key**: Obtain your API key from the Agentverse dashboard
3. **Agent Seed Phrase**: A secure seed phrase for your agent (keep this secret!)
4. **Public Endpoint**: A publicly accessible URL where your agent will be hosted

## Installation

### Step 1: Install Dependencies

Make sure you have all required dependencies installed:

```bash
pip install -r requirements.txt
```

This will install:
- `uagents>=0.12.0` - Fetch.ai uAgents framework
- `uagents_core>=0.1.0` - Core utilities for agent registration
- `pandas>=2.0.0` - Data processing library

### Step 2: Configure Environment Variables

You need to set two environment variables for agent registration:

#### Option A: Using Environment Variables

```bash
export AGENTVERSE_KEY="your_agentverse_api_key_here"
export AGENT_SEED_PHRASE="your_secure_seed_phrase_here"
```

#### Option B: Using a .env File

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit the file and add your credentials
nano .env  # or use your preferred editor
```

Add these lines to your `.env` file:

```
AGENTVERSE_KEY=your_agentverse_api_key_here
AGENT_SEED_PHRASE=your_secure_seed_phrase_here
```

**⚠️ Security Note**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

## Registration Process

### Step 3: Run the Registration Script

Once your environment variables are configured, run the registration script:

```bash
python register_agent.py
```

### Expected Output

If successful, you should see output like this:

```
======================================================================
 TiltCheck Agent - Agentverse Registration 
======================================================================
2024-01-15 10:30:00 - __main__ - INFO - Starting TiltCheck agent registration...
2024-01-15 10:30:00 - __main__ - INFO - Agent Name: TiltCheck
2024-01-15 10:30:00 - __main__ - INFO - Endpoint: https://tiltcheck.it.com/agent
2024-01-15 10:30:01 - __main__ - INFO - ======================================================================
2024-01-15 10:30:01 - __main__ - INFO - ✅ TiltCheck agent successfully registered with Agentverse!
2024-01-15 10:30:01 - __main__ - INFO - ======================================================================
2024-01-15 10:30:01 - __main__ - INFO - Your agent is now:
2024-01-15 10:30:01 - __main__ - INFO -   - Discoverable on Agentverse
2024-01-15 10:30:01 - __main__ - INFO -   - Enabled for ASI Chat Protocol
2024-01-15 10:30:01 - __main__ - INFO -   - Available at: https://tiltcheck.it.com/agent
2024-01-15 10:30:01 - __main__ - INFO - ======================================================================

🎉 Registration complete!
You can now use the TiltCheck agent in your applications.
```

## Verification

### Verify on Agentverse

1. Log in to [Agentverse](https://agentverse.ai)
2. Navigate to "My Agents"
3. You should see "TiltCheck" listed among your agents
4. The agent status should show as "Active"

### Verify Chat Protocol

1. Go to ASI:One (accessible through Agentverse)
2. Search for "TiltCheck" in the agent directory
3. You should be able to find and interact with your agent

## Troubleshooting

### Error: "AGENTVERSE_KEY environment variable is not set"

**Solution**: Make sure you've set the `AGENTVERSE_KEY` environment variable:

```bash
export AGENTVERSE_KEY="your_api_key_here"
```

Or add it to your `.env` file.

### Error: "AGENT_SEED_PHRASE environment variable is not set"

**Solution**: Make sure you've set the `AGENT_SEED_PHRASE` environment variable:

```bash
export AGENT_SEED_PHRASE="your_seed_phrase_here"
```

Or add it to your `.env` file.

### Error: "Registration failed"

**Possible Causes**:
1. **Invalid API Key**: Double-check your Agentverse API key is correct
2. **Invalid Seed Phrase**: Ensure your seed phrase is properly formatted
3. **Network Issues**: Check your internet connection
4. **Service Unavailable**: Agentverse might be temporarily down

**Solutions**:
- Verify your credentials in the Agentverse dashboard
- Check the [Agentverse Status Page](https://status.agentverse.ai)
- Try again in a few minutes

### Error: "Module 'uagents_core' not found"

**Solution**: Install the missing dependency:

```bash
pip install uagents_core
```

Or reinstall all requirements:

```bash
pip install -r requirements.txt
```

## Agent Endpoint Configuration

The TiltCheck agent is configured to be accessible at:

```
https://tiltcheck.it.com/agent
```

### Setting Up Your Public Endpoint

For production deployment, you need to:

1. **Deploy the Agent**: Host the agent on a server that's publicly accessible
2. **Configure DNS**: Point `tiltcheck.it.com` to your server's IP
3. **Set Up SSL**: Use Let's Encrypt or another SSL certificate provider
4. **Configure Reverse Proxy**: Set up nginx or similar to route `/agent` to port 8001

### Example Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name tiltcheck.it.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /agent {
        proxy_pass http://localhost:8001/submit;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Testing with Ngrok (Development)

For testing purposes, you can use ngrok:

```bash
# Start your agent
python agent.py

# In another terminal, start ngrok
ngrok http 8001

# Update your registration with the ngrok URL
# e.g., https://abc123.ngrok.io/submit
```

## Running the Agent After Registration

Once registered, you can run your agent normally:

```bash
python agent.py
```

The agent will now:
- Use the seed phrase from `AGENT_SEED_PHRASE` environment variable
- Be discoverable on Agentverse
- Accept chat messages via ASI Chat Protocol
- Monitor for tilt behavior and send alerts

## Security Best Practices

1. **Keep Your Seed Phrase Secret**: Never share or commit it to version control
2. **Use Strong API Keys**: Generate secure API keys from Agentverse
3. **Rotate Credentials Regularly**: Update your keys periodically
4. **Use HTTPS**: Always use SSL/TLS for your agent endpoint
5. **Monitor Access**: Regularly check your Agentverse dashboard for unusual activity

## Additional Resources

- [Agentverse Documentation](https://docs.agentverse.ai)
- [uAgents Framework Docs](https://fetch.ai/docs/uagents)
- [ASI Chat Protocol Specification](https://fetch.ai/docs/protocols/chat)
- [TiltCheck Agent README](README_AGENT.md)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the [Agentverse Documentation](https://docs.agentverse.ai)
3. Open an issue on the [GitHub repository](https://github.com/jmenichole/TiltCheck/issues)

---

**Built with ❤️ using Fetch.ai uAgents Framework**
