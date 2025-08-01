#!/bin/bash
# TiltCheck Server Management Script

SERVER_HOST="server1.tiltcheck.it.com"
SERVER_USER="kvmnode202"
SERVER_PORT="6467"
SERVER_PASS="iVjgB6BM"

# Function to run commands on remote server
run_remote() {
    local command="$1"
    echo "🔧 [REMOTE] $command"
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "$command"
}

show_help() {
    echo "TiltCheck Server Management"
    echo "=========================="
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status      - Check all service status"
    echo "  start       - Start all TiltCheck services"
    echo "  stop        - Stop all TiltCheck services"
    echo "  restart     - Restart all TiltCheck services"
    echo "  logs        - Show service logs"
    echo "  ssl         - Check SSL certificate status"
    echo "  update      - Update TiltCheck code from repository"
    echo "  backup      - Create backup of important files"
    echo "  connect     - SSH into the server"
    echo "  aim-test    - Test AIM messenger functionality"
    echo ""
}

check_status() {
    echo "📊 Checking TiltCheck Server Status..."
    echo "======================================"
    
    run_remote "echo '🔍 System Info:' && uname -a"
    run_remote "echo '💾 Disk Usage:' && df -h /"
    run_remote "echo '🧠 Memory Usage:' && free -h"
    
    echo ""
    echo "🤖 TiltCheck Bot Status:"
    run_remote "sudo systemctl status tiltcheck --no-pager"
    
    echo ""
    echo "🎮 AIM Overlay Status:"
    run_remote "sudo systemctl status tiltcheck-overlay --no-pager"
    
    echo ""
    echo "🌐 Web Server Status:"
    run_remote "sudo systemctl status nginx --no-pager"
    
    echo ""
    echo "🔒 SSL Certificate Status:"
    run_remote "ssl-manager status"
}

start_services() {
    echo "🚀 Starting TiltCheck Services..."
    run_remote "sudo systemctl start tiltcheck"
    run_remote "sudo systemctl start tiltcheck-overlay"
    run_remote "sudo systemctl start nginx"
    echo "✅ All services started"
}

stop_services() {
    echo "🛑 Stopping TiltCheck Services..."
    run_remote "sudo systemctl stop tiltcheck"
    run_remote "sudo systemctl stop tiltcheck-overlay"
    echo "✅ TiltCheck services stopped"
}

restart_services() {
    echo "🔄 Restarting TiltCheck Services..."
    run_remote "sudo systemctl restart tiltcheck"
    run_remote "sudo systemctl restart tiltcheck-overlay"
    run_remote "sudo systemctl reload nginx"
    echo "✅ All services restarted"
}

show_logs() {
    echo "📜 TiltCheck Service Logs..."
    echo "============================="
    
    echo "🤖 Bot Logs (last 20 lines):"
    run_remote "sudo journalctl -u tiltcheck -n 20 --no-pager"
    
    echo ""
    echo "🎮 Overlay Logs (last 20 lines):"
    run_remote "sudo journalctl -u tiltcheck-overlay -n 20 --no-pager"
    
    echo ""
    echo "🌐 Nginx Error Logs (last 10 lines):"
    run_remote "sudo tail -10 /var/log/nginx/error.log"
}

check_ssl() {
    echo "🔒 SSL Certificate Status..."
    run_remote "ssl-manager check --domain server1.tiltcheck.it.com"
    run_remote "openssl x509 -in /etc/letsencrypt/live/server1.tiltcheck.it.com/fullchain.pem -text -noout | grep -A 2 'Validity'"
}

update_code() {
    echo "🔄 Updating TiltCheck Code..."
    run_remote "cd /home/$SERVER_USER/tiltcheck && git pull origin main"
    run_remote "cd /home/$SERVER_USER/tiltcheck && npm install"
    restart_services
}

create_backup() {
    echo "💾 Creating TiltCheck Backup..."
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    run_remote "cd /home/$SERVER_USER && tar -czf tiltcheck_backup_$BACKUP_DATE.tar.gz tiltcheck/"
    echo "✅ Backup created: tiltcheck_backup_$BACKUP_DATE.tar.gz"
}

connect_ssh() {
    echo "🔗 Connecting to TiltCheck Server..."
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST"
}

test_aim() {
    echo "🎮 Testing AIM Messenger..."
    run_remote "curl -s http://localhost:8080 | head -10"
    echo ""
    echo "🔊 Testing .wav file access:"
    run_remote "ls -la /home/$SERVER_USER/tiltcheck/dashboard/55817__sergenious__bloop2.wav"
    echo ""
    echo "🌐 Testing external access:"
    run_remote "curl -s https://server1.tiltcheck.it.com:8080 | head -5"
}

# Main script logic
case "$1" in
    "status")
        check_status
        ;;
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        show_logs
        ;;
    "ssl")
        check_ssl
        ;;
    "update")
        update_code
        ;;
    "backup")
        create_backup
        ;;
    "connect")
        connect_ssh
        ;;
    "aim-test")
        test_aim
        ;;
    *)
        show_help
        ;;
esac
