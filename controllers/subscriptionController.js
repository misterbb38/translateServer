


// const Subscription = require('../models/Subscription');
// const Translation = require('../models/Translation');
// const User = require('../models/User');
// require('dotenv').config();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// // Définition des limites par plan
// const PLAN_LIMITS = {
//   free: {
//     characters: 50000,
//     translations: 50
//   },
//   starter: {
//     characters: 300000,
//     translations: 300,
//     price_id: process.env.STRIPE_STARTER_PRICE_ID
//   },
//   pro: {
//     characters: 1000000,
//     translations: 1000,
//     price_id: process.env.STRIPE_PRO_PRICE_ID
//   },
//   enterprise: {
//     characters: 5000000,
//     translations: 5000,
//     price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID
//   }
// };

// // Utilitaire pour vérifier l'expiration d'un abonnement
// const checkSubscriptionExpiration = async (subscription) => {
//   if (!subscription || !subscription.currentPeriodEnd) return true;
  
//   const now = new Date();
//   const endDate = new Date(subscription.currentPeriodEnd);
  
//   if (now > endDate) {
//     subscription.status = 'inactive';
//     subscription.plan = 'free';
//     await subscription.save();
//     return true;
//   }
  
//   return false;
// };

// // Utilitaire pour calculer les jours jusqu'au renouvellement
// const calculateDaysUntilRenewal = (endDate) => {
//   const now = new Date();
//   const end = new Date(endDate);
//   const diffTime = end - now;
//   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
// };

// // Obtenir le statut de l'abonnement
// exports.getSubscriptionStatus = async (req, res) => {
//   try {
//     let subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
//     const isExpired = await checkSubscriptionExpiration(subscription);

//     // Si pas d'abonnement ou expiré, retourner le plan gratuit
//     if (!subscription || isExpired) {
//       return res.json({
//         plan: 'free',
//         status: 'active',
//         limits: PLAN_LIMITS.free,
//         currentMonthUsage: { characters: 0, translations: 0 },
//         usageHistory: [],
//         isApproachingLimit: false,
//         daysUntilRenewal: null
//       });
//     }

//     // Calculer days until renewal
//     if (subscription.currentPeriodEnd) {
//       subscription.daysUntilRenewal = calculateDaysUntilRenewal(subscription.currentPeriodEnd);
//       await subscription.save();
//     }

//     // Transformer l'historique d'utilisation
//     const monthlyHistory = subscription.usageHistory.map(entry => ({
//       month: entry.month,
//       characters: entry.words,
//       translations: entry.requests
//     }));

//     res.json({
//       plan: subscription.plan,
//       status: subscription.status,
//       currentMonthUsage: subscription.usageThisMonth,
//       limits: PLAN_LIMITS[subscription.plan],
//       monthlyHistory,
//       isApproachingLimit: subscription.isApproachingLimit,
//       daysUntilRenewal: subscription.daysUntilRenewal
//     });
//   } catch (error) {
//     console.error('Erreur getSubscriptionStatus:', error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Créer une session de paiement Stripe
// exports.createCheckoutSession = async (req, res) => {
//   try {
//     const { planId } = req.body;
//     const user = await User.findById(req.user.id);

//     // Vérifier si le plan existes
//     if (!PLAN_LIMITS[planId] || !PLAN_LIMITS[planId].price_id) {
//       return res.status(400).json({ message: 'Plan invalide' });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price: PLAN_LIMITS[planId].price_id,
//         quantity: 1
//       }],
//       mode: 'subscription',
//       success_url: `${process.env.BACKEND_URL}/api/subscriptions/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
//       customer_email: user.email,
//       metadata: {
//         userId: user.id,
//         plan: planId
//       }
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Gérer le succès du paiement
// exports.handlePaymentSuccess = async (req, res) => {
//   try {
//     const { session_id } = req.query;
//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     if (session.payment_status !== 'paid') {
//       return res.status(400).json({ message: 'Paiement non complété' });
//     }

//     const userId = session.metadata.userId;
//     const plan = session.metadata.plan;

//     // Calculer la date de fin de période (30 jours)
//     const currentPeriodEnd = new Date();
//     currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

//     // Mettre à jour ou créer l'abonnement
//     await Subscription.findOneAndUpdate(
//       { user: userId },
//       {
//         plan: plan,
//         status: 'active',
//         stripeCustomerId: session.customer,
//         stripeSubscriptionId: session.subscription,
//         currentPeriodEnd: currentPeriodEnd,
//         usageThisMonth: { characters: 0, translations: 0 },
//         isApproachingLimit: false,
//         daysUntilRenewal: 30
//       },
//       { upsert: true, new: true }
//     );

//     // Mettre à jour l'utilisateur
//     await User.findByIdAndUpdate(userId, {
//       subscriptionPlan: plan,
//       stripeCustomerId: session.customer
//     });

//     return res.redirect(`${process.env.CLIENT_URL}/payment/success`);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// // Vérifier le checkout
// exports.verifyCheckout = async (req, res) => {
//   const { sessionId, planId } = req.body;
//   try {
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
    
//     if (session.payment_status !== 'paid') {
//       return res.status(400).json({ message: "Le paiement n'est pas validé." });
//     }

//     const userId = session.metadata.userId;
//     const currentPeriodEnd = new Date();
//     currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

//     // Mettre à jour ou créer l'abonnement
//     let subscription = await Subscription.findOne({ user: userId });
//     if (!subscription) {
//       subscription = new Subscription({
//         user: userId,
//         plan: planId,
//         status: 'active',
//         stripeCustomerId: session.customer,
//         stripeSubscriptionId: session.subscription,
//         currentPeriodEnd: currentPeriodEnd,
//         usageThisMonth: { characters: 0, translations: 0 },
//         isApproachingLimit: false
//       });
//     } else {
//       subscription.plan = planId;
//       subscription.status = 'active';
//       subscription.stripeCustomerId = session.customer;
//       subscription.stripeSubscriptionId = session.subscription;
//       subscription.currentPeriodEnd = currentPeriodEnd;
//       subscription.usageThisMonth = { characters: 0, translations: 0 };
//       subscription.isApproachingLimit = false;
//     }

//     subscription.daysUntilRenewal = calculateDaysUntilRenewal(currentPeriodEnd);
//     await subscription.save();

//     // Mettre à jour l'utilisateur
//     await User.findByIdAndUpdate(userId, {
//       subscriptionPlan: planId,
//       stripeCustomerId: session.customer
//     });

//     return res.json({ 
//       message: 'Abonnement mis à jour avec succès !',
//       subscription: {
//         plan: subscription.plan,
//         status: subscription.status,
//         daysUntilRenewal: subscription.daysUntilRenewal,
//         currentPeriodEnd: subscription.currentPeriodEnd
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Erreur lors de la vérification' });
//   }
// };

// // Mettre à jour l'utilisation
// exports.updateUsage = async (req, res) => {
//   try {
//     const { characters = 0, translations = 0 } = req.body;
    
//     // Vérifier d'abord si l'abonnement est actif et non expiré
//     const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
//     if (!subscription || await checkSubscriptionExpiration(subscription)) {
//       return res.status(403).json({ 
//         message: "Votre abonnement a expiré ou n'est plus actif",
//         plan: 'free'
//       });
//     }

//     // Vérifier si les limites seront dépassées
//     const newCharacters = subscription.usageThisMonth.characters + characters;
//     const newTranslations = subscription.usageThisMonth.translations + translations;
//     const limits = PLAN_LIMITS[subscription.plan];

//     if (newCharacters > limits.characters || newTranslations > limits.translations) {
//       return res.status(403).json({ 
//         message: "Cette action dépasserait vos limites d'utilisation",
//         currentUsage: subscription.usageThisMonth,
//         limits
//       });
//     }

//     // Mettre à jour l'utilisation
//     const updatedSubscription = await Subscription.findOneAndUpdate(
//       { user: req.user.id, status: 'active' },
//       {
//         $inc: {
//           'usageThisMonth.characters': characters,
//           'usageThisMonth.translations': translations
//         }
//       },
//       { new: true }
//     );

//     // Vérifier si on approche des limites (80%)
//     const characterUsageRatio = newCharacters / limits.characters;
//     const translationUsageRatio = newTranslations / limits.translations;
    
//     if (characterUsageRatio >= 0.8 || translationUsageRatio >= 0.8) {
//       updatedSubscription.isApproachingLimit = true;
//       await updatedSubscription.save();
//     }

//     res.json({ 
//       success: true, 
//       usage: updatedSubscription.usageThisMonth,
//       isApproachingLimit: updatedSubscription.isApproachingLimit 
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Obtenir les statistiques d'utilisation
// exports.getUsageStats = async (req, res) => {
//   try {
//     const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
//     const isExpired = await checkSubscriptionExpiration(subscription);

//     // Si pas de subscription ou expirée, retourner les stats par défaut
//     if (!subscription || isExpired) {
//       return res.json({
//         plan: 'free',
//         status: 'active',
//         limits: PLAN_LIMITS.free,
//         currentMonthUsage: { characters: 0, translations: 0 },
//         usageHistory: []
//       });
//     }

//     // Transformer l'historique pour le graphique
//     const monthlyHistory = subscription.usageHistory.map(entry => ({
//       month: entry.month,
//       characters: entry.words,
//       translations: entry.requests
//     }));

//     res.json({
//       plan: subscription.plan,
//       status: subscription.status,
//       currentMonthUsage: subscription.usageThisMonth,
//       limits: PLAN_LIMITS[subscription.plan],
//       monthlyHistory
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// controllers/subscriptionController.js
const Subscription = require('../models/Subscription');
const Translation  = require('../models/Translation');
const User         = require('../models/User');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────
const PLAN_LIMITS = {
  free:       { characters: 50000,   translations: 50   },
  starter:    { characters: 300000,  translations: 300,  price_id: process.env.STRIPE_STARTER_PRICE_ID  },
  pro:        { characters: 1000000, translations: 1000, price_id: process.env.STRIPE_PRO_PRICE_ID      },
  enterprise: { characters: 5000000, translations: 5000, price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID }
};

const FREE_PLAN_RESPONSE = {
  plan: 'free',
  status: 'active',
  limits: PLAN_LIMITS.free,
  currentMonthUsage: { characters: 0, translations: 0 },
  monthlyHistory: [],
  isApproachingLimit: false,
  daysUntilRenewal: null
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const checkSubscriptionExpiration = async (subscription) => {
  if (!subscription?.currentPeriodEnd) return true;

  const isExpired = new Date() > new Date(subscription.currentPeriodEnd);
  if (isExpired) {
    subscription.status = 'inactive';
    subscription.plan   = 'free';
    await subscription.save();
  }
  return isExpired;
};

const calculateDaysUntilRenewal = (endDate) => {
  const diffTime = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// ✅ Fix : convertit usageHistory en tableau lisible, sans planter si absent
const formatMonthlyHistory = (usageHistory = []) => {
  return (usageHistory || []).map(entry => ({
    month:        entry.month,
    characters:   entry.words     || 0,
    translations: entry.requests  || 0
  }));
};

// ─────────────────────────────────────────
// STATUT ABONNEMENT
// ─────────────────────────────────────────
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    const isExpired = await checkSubscriptionExpiration(subscription);

    if (!subscription || isExpired) {
      return res.json(FREE_PLAN_RESPONSE);
    }

    // Mettre à jour daysUntilRenewal
    subscription.daysUntilRenewal = calculateDaysUntilRenewal(subscription.currentPeriodEnd);
    await subscription.save();

    return res.json({
      plan:             subscription.plan,
      status:           subscription.status,
      limits:           PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free,
      currentMonthUsage: subscription.usageThisMonth   || { characters: 0, translations: 0 },
      monthlyHistory:   formatMonthlyHistory(subscription.usageHistory),
      isApproachingLimit: subscription.isApproachingLimit || false,
      daysUntilRenewal: subscription.daysUntilRenewal
    });
  } catch (error) {
    console.error('Erreur getSubscriptionStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// CRÉER SESSION STRIPE
// ─────────────────────────────────────────
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!PLAN_LIMITS[planId]?.price_id) {
      return res.status(400).json({ message: 'Plan invalide.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: PLAN_LIMITS[planId].price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.BACKEND_URL}/api/subscriptions/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/subscriptions`,
      customer_email: user.email,
      metadata: { userId: user.id, plan: planId }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur createCheckoutSession:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// SUCCÈS DU PAIEMENT
// ─────────────────────────────────────────
exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Paiement non complété.' });
    }

    const { userId, plan } = session.metadata;

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    await Subscription.findOneAndUpdate(
      { user: userId },
      {
        plan,
        status:               'active',
        stripeCustomerId:     session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd,
        usageThisMonth:       { characters: 0, translations: 0 },
        usageHistory:         [], // ✅ Fix : réinitialiser pour éviter les données orphelines
        isApproachingLimit:   false,
        daysUntilRenewal:     30
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, {
      subscriptionPlan:  plan,
      stripeCustomerId:  session.customer
    });

    return res.redirect(`${process.env.CLIENT_URL}/payment/success`);
  } catch (error) {
    console.error('Erreur handlePaymentSuccess:', error);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// VÉRIFIER CHECKOUT
// ─────────────────────────────────────────
exports.verifyCheckout = async (req, res) => {
  try {
    const { sessionId, planId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: "Le paiement n'est pas validé." });
    }

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    const subscriptionData = {
      plan:                 planId,
      status:               'active',
      stripeCustomerId:     session.customer,
      stripeSubscriptionId: session.subscription,
      currentPeriodEnd,
      usageThisMonth:       { characters: 0, translations: 0 },
      isApproachingLimit:   false,
      daysUntilRenewal:     calculateDaysUntilRenewal(currentPeriodEnd)
    };

    const subscription = await Subscription.findOneAndUpdate(
      { user: session.metadata.userId },
      subscriptionData,
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(session.metadata.userId, {
      subscriptionPlan: planId,
      stripeCustomerId: session.customer
    });

    return res.json({
      message: 'Abonnement mis à jour avec succès !',
      subscription: {
        plan:             subscription.plan,
        status:           subscription.status,
        daysUntilRenewal: subscription.daysUntilRenewal,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('Erreur verifyCheckout:', error);
    return res.status(500).json({ message: 'Erreur lors de la vérification.' });
  }
};

// ─────────────────────────────────────────
// METTRE À JOUR L'UTILISATION
// ─────────────────────────────────────────
exports.updateUsage = async (req, res) => {
  try {
    const { characters = 0, translations = 0 } = req.body;

    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (!subscription || await checkSubscriptionExpiration(subscription)) {
      return res.status(403).json({
        message: "Votre abonnement a expiré ou n'est plus actif.",
        plan: 'free'
      });
    }

    const limits      = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;
    const usage       = subscription.usageThisMonth    || { characters: 0, translations: 0 };
    const newChars    = usage.characters   + characters;
    const newTrans    = usage.translations + translations;

    if (newChars > limits.characters || newTrans > limits.translations) {
      return res.status(403).json({
        message: "Cette action dépasserait vos limites d'utilisation.",
        currentUsage: usage,
        limits
      });
    }

    const updated = await Subscription.findOneAndUpdate(
      { user: req.user.id, status: 'active' },
      { $inc: {
          'usageThisMonth.characters':   characters,
          'usageThisMonth.translations': translations
      }},
      { new: true }
    );

    updated.isApproachingLimit =
      (newChars / limits.characters)   >= 0.8 ||
      (newTrans / limits.translations) >= 0.8;

    await updated.save();

    res.json({
      success:            true,
      usage:              updated.usageThisMonth,
      isApproachingLimit: updated.isApproachingLimit
    });
  } catch (error) {
    console.error('Erreur updateUsage:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// STATISTIQUES D'UTILISATION
// ─────────────────────────────────────────
exports.getUsageStats = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    const isExpired = await checkSubscriptionExpiration(subscription);

    if (!subscription || isExpired) {
      return res.json(FREE_PLAN_RESPONSE);
    }

    return res.json({
      plan:             subscription.plan,
      status:           subscription.status,
      limits:           PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free,
      currentMonthUsage: subscription.usageThisMonth   || { characters: 0, translations: 0 },
      monthlyHistory:   formatMonthlyHistory(subscription.usageHistory)
    });
  } catch (error) {
    console.error('Erreur getUsageStats:', error);
    res.status(500).json({ message: error.message });
  }
};