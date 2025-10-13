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

// Verified node confirmations added to every response
headers: {
  'X-TiltCheck-Verified': 'true',
  'X-TiltCheck-Node-ID': nodeId,
  'X-TiltCheck-Connection-ID': connectionId,
  'X-TiltCheck-Timestamp': timestamp
}