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

/**
 * Shared Error Handling Utilities
 * Provides consistent error handling across the application
 */

/**
 * Log an error with consistent formatting
 * @param {string} context - Context or location of the error
 * @param {Error|string} error - Error object or message
 * @param {Object} additionalData - Additional data to log
 */
function logError(context, error, additionalData = {}) {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : '';

    console.error(`❌ [${timestamp}] ${context}:`, errorMessage);
    
    if (Object.keys(additionalData).length > 0) {
        console.error('   Additional data:', JSON.stringify(additionalData, null, 2));
    }
    
    if (errorStack && process.env.NODE_ENV === 'development') {
        console.error('   Stack trace:', errorStack);
    }
}

/**
 * Create a standardized error response object
 * @param {string} message - Error message
 * @param {number} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error object
 */
function createErrorResponse(message, code = 500, details = {}) {
    return {
        error: true,
        message,
        code,
        timestamp: new Date().toISOString(),
        ...details
    };
}

/**
 * Async error wrapper for Express route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Safe async execution with error logging
 * @param {Function} fn - Async function to execute
 * @param {string} context - Context for error logging
 * @param {*} defaultReturn - Default return value on error
 * @returns {Promise<*>} Result of function or default value
 */
async function safeAsync(fn, context, defaultReturn = null) {
    try {
        return await fn();
    } catch (error) {
        logError(context, error);
        return defaultReturn;
    }
}

/**
 * Retry an async operation with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise<*>} Result of function
 */
async function retryAsync(fn, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

/**
 * Express error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function errorMiddleware(err, req, res, next) {
    logError('Express Error Handler', err, {
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json(createErrorResponse(message, statusCode, {
        path: req.path
    }));
}

module.exports = {
    logError,
    createErrorResponse,
    asyncHandler,
    safeAsync,
    retryAsync,
    errorMiddleware
};
