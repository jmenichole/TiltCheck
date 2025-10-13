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

// QualifyFirst Integration API for TiltCheck
// Redirects tilted gamblers to earning surveys instead of losing money

const { supabase } = require('../database/supabase');

class QualifyFirstTiltCheckIntegration {
  constructor() {
    this.qualifyFirstAPI = 'https://qualifyfirst.vercel.app/api';
    this.interventionStrategies = new Map();
    this.loadInterventionStrategies();
  }

  loadInterventionStrategies() {
    // Map tilt levels to survey recommendation strategies
    this.interventionStrategies.set('low-tilt', {
      maxSurveys: 3,
      minPayout: 5,
      timeLimit: 30, // minutes
      message: "💡 Take a quick break and earn some money safely!"
    });

    this.interventionStrategies.set('medium-tilt', {
      maxSurveys: 5,
      minPayout: 10,
      timeLimit: 60,
      message: "🛑 Stop gambling losses! Earn $10+ with these surveys instead:"
    });

    this.interventionStrategies.set('high-tilt', {
      maxSurveys: 10,
      minPayout: 20,
      timeLimit: 120,
      message: "🚨 HIGH TILT DETECTED! Replace gambling with guaranteed earnings:",
      urgency: true
    });
  }

  // Main intervention endpoint - called when user is tilted
  async triggerTiltIntervention(userId, tiltData) {
    const { tiltLevel, currentLoss, sessionTime, platform } = tiltData;
    
    // Determine intervention strategy
    const strategy = this.selectStrategy(tiltLevel, currentLoss);
    
    // Get user profile for survey matching
    const userProfile = await this.getUserProfile(userId);
    
    // Find matching surveys
    const surveys = await this.findInterventionSurveys(userProfile, strategy);
    
    // Calculate potential earnings vs gambling losses
    const earningsAnalysis = this.calculateEarningsVsLosses(surveys, currentLoss);
    
    // Log intervention for analytics
    await this.logIntervention(userId, {
      tiltLevel,
      strategy: strategy.name,
      surveysOffered: surveys.length,
      potentialEarnings: earningsAnalysis.totalPotential,
      currentLoss,
      platform
    });

    return {
      success: true,
      intervention: {
        type: 'qualifyfirst-redirect',
        urgency: strategy.urgency || false,
        title: strategy.message,
        surveys: surveys.slice(0, strategy.maxSurveys),
        earningsAnalysis,
        redirectUrl: this.buildRedirectUrl(userId, surveys[0]?.id),
        timeline: `Earn $${earningsAnalysis.realistic} in ${strategy.timeLimit} minutes`
      }
    };
  }

  // Select appropriate intervention strategy
  selectStrategy(tiltLevel, currentLoss) {
    if (tiltLevel >= 8 || currentLoss >= 500) {
      return { ...this.interventionStrategies.get('high-tilt'), name: 'high-tilt' };
    } else if (tiltLevel >= 5 || currentLoss >= 200) {
      return { ...this.interventionStrategies.get('medium-tilt'), name: 'medium-tilt' };
    } else {
      return { ...this.interventionStrategies.get('low-tilt'), name: 'low-tilt' };
    }
  }

  // Get user profile from QualifyFirst
  async getUserProfile(userId) {
    try {
      // Check if user exists in QualifyFirst
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('external_user_id', userId)
        .single();

      if (profile) {
        return profile;
      } else {
        // Create quick profile for new user
        return await this.createQuickProfile(userId);
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      // Return default profile
      return this.getDefaultProfile();
    }
  }

  // Create a quick profile for immediate survey matching
  async createQuickProfile(userId) {
    const quickProfile = {
      external_user_id: userId,
      source: 'tiltcheck-intervention',
      age: 25, // Default demographics for quick matching
      gender: 'prefer-not-to-say',
      country: 'US',
      employment_status: 'employed',
      income_range: '50k-75k',
      interests: ['gaming', 'technology', 'finance'], // Gambling-adjacent interests
      created_at: new Date().toISOString()
    };

    try {
      const { data } = await supabase
        .from('user_profiles')
        .insert([quickProfile])
        .select()
        .single();

      return data;
    } catch (error) {
      console.error('Error creating quick profile:', error);
      return quickProfile;
    }
  }

  // Find surveys perfect for intervention
  async findInterventionSurveys(userProfile, strategy) {
    try {
      // Get high-engagement, quick-completion surveys
      const { data: surveys } = await supabase
        .from('surveys')
        .select('*')
        .gte('payout', strategy.minPayout)
        .lte('estimated_time', strategy.timeLimit)
        .eq('active', true)
        .order('payout', { ascending: false })
        .limit(strategy.maxSurveys * 2); // Get extra for filtering

      if (!surveys?.length) {
        return this.getFallbackSurveys(strategy);
      }

      // Filter surveys that match user profile
      const matchedSurveys = surveys.filter(survey => 
        this.matchesSurveyRequirements(userProfile, survey)
      );

      // Prioritize by engagement and payout
      return matchedSurveys
        .sort((a, b) => {
          const aScore = (a.payout / a.estimated_time) * a.completion_rate;
          const bScore = (b.payout / b.estimated_time) * b.completion_rate;
          return bScore - aScore;
        })
        .slice(0, strategy.maxSurveys);

    } catch (error) {
      console.error('Error finding surveys:', error);
      return this.getFallbackSurveys(strategy);
    }
  }

  // Calculate earning potential vs gambling losses
  calculateEarningsVsLosses(surveys, currentLoss) {
    const totalPotential = surveys.reduce((sum, survey) => sum + survey.payout, 0);
    const totalTime = surveys.reduce((sum, survey) => sum + survey.estimated_time, 0);
    const averageCompletion = surveys.reduce((sum, survey) => sum + survey.completion_rate, 0) / surveys.length;
    
    const realistic = totalPotential * (averageCompletion || 0.7); // 70% avg completion
    const hourlyRate = totalTime > 0 ? (realistic / totalTime) * 60 : 0;

    return {
      totalPotential: Math.round(totalPotential * 100) / 100,
      realistic: Math.round(realistic * 100) / 100,
      currentLoss: Math.round(currentLoss * 100) / 100,
      netBenefit: Math.round((realistic + currentLoss) * 100) / 100, // What they save + earn
      totalTime,
      hourlyRate: Math.round(hourlyRate * 100) / 100,
      message: this.generateEarningsMessage(realistic, currentLoss, totalTime)
    };
  }

  generateEarningsMessage(earnings, losses, timeMinutes) {
    const netGain = earnings + losses; // What they save by not losing + what they earn
    
    if (losses > 0) {
      return `💰 Earn $${earnings} + Save $${losses} = $${netGain} benefit in ${timeMinutes}min!`;
    } else {
      return `💰 Earn $${earnings} guaranteed in ${timeMinutes} minutes!`;
    }
  }

  // Build redirect URL to QualifyFirst with intervention tracking
  buildRedirectUrl(userId, surveyId) {
    const baseUrl = 'https://qualifyfirst.vercel.app';
    const params = new URLSearchParams({
      source: 'tiltcheck-intervention',
      user_id: userId,
      recommended_survey: surveyId || '',
      intervention_timestamp: Date.now().toString()
    });

    return `${baseUrl}/smart-dashboard?${params.toString()}`;
  }

  // Log intervention for business analytics
  async logIntervention(userId, interventionData) {
    try {
      const { data } = await supabase
        .from('tiltcheck_interventions')
        .insert([{
          user_id: userId,
          intervention_type: 'qualifyfirst-redirect',
          tilt_level: interventionData.tiltLevel,
          current_loss: interventionData.currentLoss,
          surveys_offered: interventionData.surveysOffered,
          potential_earnings: interventionData.potentialEarnings,
          platform: interventionData.platform,
          strategy_used: interventionData.strategy,
          timestamp: new Date().toISOString()
        }]);

      return data;
    } catch (error) {
      console.error('Error logging intervention:', error);
    }
  }

  // Check if user matches survey requirements  
  matchesSurveyRequirements(userProfile, survey) {
    // Age check
    if (survey.min_age && userProfile.age < survey.min_age) return false;
    if (survey.max_age && userProfile.age > survey.max_age) return false;

    // Gender check
    if (survey.required_gender?.length && 
        !survey.required_gender.includes(userProfile.gender)) return false;

    // Country check
    if (survey.required_countries?.length && 
        !survey.required_countries.includes(userProfile.country)) return false;

    // Employment check
    if (survey.required_employment?.length && 
        !survey.required_employment.includes(userProfile.employment_status)) return false;

    return true;
  }

  // Fallback surveys for when matching fails
  getFallbackSurveys(strategy) {
    return [
      {
        id: 'fallback-1',
        title: 'Quick Consumer Survey',
        description: 'Share your opinions on everyday products',
        payout: strategy.minPayout,
        estimated_time: 15,
        completion_rate: 0.8,
        provider: 'internal'
      },
      {
        id: 'fallback-2', 
        title: 'Technology Usage Survey',
        description: 'Tell us about your tech habits',
        payout: strategy.minPayout + 5,
        estimated_time: 20,
        completion_rate: 0.75,
        provider: 'internal'
      }
    ];
  }

  getDefaultProfile() {
    return {
      age: 25,
      gender: 'prefer-not-to-say',
      country: 'US',
      employment_status: 'employed',
      income_range: '50k-75k',
      interests: ['technology']
    };
  }

  // Track intervention success metrics
  async trackInterventionOutcome(userId, interventionId, outcome) {
    try {
      const { data } = await supabase
        .from('intervention_outcomes')
        .insert([{
          user_id: userId,
          intervention_id: interventionId,
          outcome_type: outcome.type, // 'clicked', 'completed', 'ignored'
          surveys_completed: outcome.surveysCompleted || 0,
          earnings_achieved: outcome.earningsAchieved || 0,
          time_spent: outcome.timeSpent || 0,
          gambling_resumed: outcome.gamblingResumed || false,
          timestamp: new Date().toISOString()
        }]);

      return data;
    } catch (error) {
      console.error('Error tracking intervention outcome:', error);
    }
  }
}

module.exports = QualifyFirstTiltCheckIntegration;