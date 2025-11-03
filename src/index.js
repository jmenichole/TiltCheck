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

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { TiltAlertProvider } from './context/TiltAlertContext';
import { TiltPersonaProvider } from './context/TiltPersonaContext';
import TiltAlertToasts from './components/TiltAlertToasts';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TiltPersonaProvider>
      <TiltAlertProvider>
        <App />
        <TiltAlertToasts />
      </TiltAlertProvider>
    </TiltPersonaProvider>
  </React.StrictMode>
);