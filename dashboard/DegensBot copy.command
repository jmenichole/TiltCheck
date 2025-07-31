#!/bin/bash
cd ~/Desktop/DegensAgainstDecency
pm2 restart degens-bot || pm2 start index.js --name degens-bot
pm2 logs degens-bot
