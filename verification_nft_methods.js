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

// ========== VERIFICATION NFT SYSTEM ==========

async mintVerificationNFT(discordUserId, username, verificationLevel = 'basic') {
    try {
        let userAccount = this.userAccounts.get(discordUserId);
        if (!userAccount) {
            const initResult = await this.initializeUserAccount(discordUserId, username);
            if (!initResult.success) {
                return { success: false, error: 'Failed to initialize user account' };
            }
            userAccount = initResult.account;
        }

        if (userAccount.verificationNFT) {
            return { success: false, error: 'User already has verification NFT', existingNFT: userAccount.verificationNFT };
        }

        const nftResult = await this._executeVerificationNFTMint(discordUserId, verificationLevel);
        
        if (nftResult.success) {
            userAccount.verificationNFT = {
                mint: nftResult.mintAddress,
                level: verificationLevel,
                mintedAt: new Date(),
                transactionSignature: nftResult.signature
            };
            userAccount.tiltCheckVerified = true;

            this.recordTransaction({
                type: 'verification_nft_mint',
                from: 'system',
                to: discordUserId,
                amount: 1,
                token: 'VERIFICATION_NFT',
                signature: nftResult.signature,
                level: verificationLevel,
                timestamp: new Date()
            });

            return {
                success: true,
                nft: userAccount.verificationNFT,
                message: `✅ Verification NFT minted! Level: ${verificationLevel.toUpperCase()}`
            };
        } else {
            return { success: false, error: nftResult.error };
        }
    } catch (error) {
        console.error('Error minting verification NFT:', error);
        return { success: false, error: error.message };
    }
}

async checkVerificationStatus(discordUserId) {
    try {
        const userAccount = this.userAccounts.get(discordUserId);
        
        if (!userAccount) {
            return { verified: false, reason: 'No account found' };
        }

        if (!userAccount.verificationNFT) {
            return { verified: false, reason: 'No verification NFT' };
        }

        const isValid = await this._verifyNFTOwnership(userAccount.verificationNFT.mint, discordUserId);
        
        return {
            verified: isValid,
            level: userAccount.verificationNFT.level,
            mintedAt: userAccount.verificationNFT.mintedAt,
            mintAddress: userAccount.verificationNFT.mint
        };
    } catch (error) {
        console.error('Error checking verification status:', error);
        return { verified: false, reason: 'Verification check failed: ' + error.message };
    }
}

async upgradeVerificationNFT(discordUserId, newLevel) {
    try {
        const userAccount = this.userAccounts.get(discordUserId);
        
        if (!userAccount || !userAccount.verificationNFT) {
            return { success: false, error: 'No verification NFT found' };
        }

        const currentLevel = userAccount.verificationNFT.level;
        const levelHierarchy = { 'basic': 1, 'premium': 2, 'enterprise': 3 };
        
        if (levelHierarchy[newLevel] <= levelHierarchy[currentLevel]) {
            return { success: false, error: 'Cannot downgrade verification level' };
        }

        userAccount.verificationNFT.level = newLevel;
        userAccount.verificationNFT.upgradedAt = new Date();

        return {
            success: true,
            previousLevel: currentLevel,
            newLevel: newLevel,
            message: `✅ Verification NFT upgraded to ${newLevel.toUpperCase()}!`
        };
    } catch (error) {
        console.error('Error upgrading verification NFT:', error);
        return { success: false, error: error.message };
    }
}

async _executeVerificationNFTMint(discordUserId, level) {
    return {
        success: true,
        mintAddress: `nft_${discordUserId}_${Date.now()}`,
        signature: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
}

async _verifyNFTOwnership(mintAddress, discordUserId) {
    const userAccount = this.userAccounts.get(discordUserId);
    return userAccount && userAccount.verificationNFT && userAccount.verificationNFT.mint === mintAddress;
}
