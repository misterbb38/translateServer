// // // // controllers/subscriptionController.js
// // // const Subscription = require('../models/Subscription');
// // // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// // // exports.getSubscriptionStatus = async (req, res) => {
// // //   try {
// // //     const subscription = await Subscription.findOne({ 
// // //       user: req.user.id,
// // //       status: 'active'
// // //     });

// // //     if (!subscription) {
// // //       return res.json({
// // //         plan: 'free',
// // //         status: 'active',
// // //         daysUntilRenewal: null,
// // //         needsWarning: false
// // //       });
// // //     }

// // //     const daysUntilRenewal = subscription.currentPeriodEnd 
// // //       ? Math.ceil((new Date(subscription.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))
// // //       : null;

// // //     res.json({
// // //       plan: subscription.plan,
// // //       status: subscription.status,
// // //       daysUntilRenewal,
// // //       needsWarning: daysUntilRenewal <= 7,
// // //       usage: subscription.usageThisMonth,
// // //       limits: subscription.planLimits
// // //     });
// // //   } catch (error) {
// // //     console.error('Erreur lors de la récupération du statut:', error);
// // //     res.status(500).json({ message: 'Erreur serveur' });
// // //   }
// // // };

// // // exports.getUsageStats = async (req, res) => {
// // //   try {
// // //     const subscription = await Subscription.findOne({ 
// // //       user: req.user.id,
// // //       status: 'active'
// // //     });

// // //     const limits = {
// // //       free: {
// // //         characters: 50000,
// // //         translations: 50
// // //       },
// // //       starter: {
// // //         characters: 300000,
// // //         translations: 300
// // //       },
// // //       pro: {
// // //         characters: 1000000,
// // //         translations: 1000
// // //       },
// // //       enterprise: {
// // //         characters: Infinity,
// // //         translations: Infinity
// // //       }
// // //     };

// // //     const plan = subscription?.plan || 'free';

// // //     res.json({
// // //       currentMonthUsage: subscription?.usageThisMonth || {
// // //         characters: 0,
// // //         translations: 0
// // //       },
// // //       limits: limits[plan]
// // //     });
// // //   } catch (error) {
// // //     console.error('Erreur lors de la récupération des statistiques:', error);
// // //     res.status(500).json({ message: 'Erreur serveur' });
// // //   }
// // // };

// // // exports.createCheckoutSession = async (req, res) => {
// // //   try {
// // //     const { planId } = req.body;

// // //     const prices = {
// // //       starter: 'price_xxxxx', // Remplacez par vos IDs de prix Stripe
// // //       pro: 'price_xxxxx',
// // //       enterprise: 'price_xxxxx'
// // //     };

// // //     if (!prices[planId]) {
// // //       return res.status(400).json({ message: 'Plan invalide' });
// // //     }

// // //     const session = await stripe.checkout.sessions.create({
// // //       payment_method_types: ['card'],
// // //       line_items: [{
// // //         price: prices[planId],
// // //         quantity: 1,
// // //       }],
// // //       mode: 'subscription',
// // //       success_url: `${process.env.CLIENT_URL}/payment/success`,
// // //       cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
// // //       customer_email: req.user.email,
// // //       metadata: {
// // //         userId: req.user.id,
// // //         plan: planId
// // //       }
// // //     });

// // //     res.json({ url: session.url });
// // //   } catch (error) {
// // //     console.error('Erreur lors de la création de la session:', error);
// // //     res.status(500).json({ message: 'Erreur serveur' });
// // //   }
// // // };

// // // exports.handleWebhook = async (req, res) => {
// // //   const sig = req.headers['stripe-signature'];
// // //   let event;

// // //   try {
// // //     event = stripe.webhooks.constructEvent(
// // //       req.body,
// // //       sig,
// // //       process.env.STRIPE_WEBHOOK_SECRET
// // //     );
// // //   } catch (error) {
// // //     return res.status(400).json({ message: 'Webhook error' });
// // //   }

// // //   if (event.type === 'checkout.session.completed') {
// // //     const session = event.data.object;
    
// // //     await Subscription.findOneAndUpdate(
// // //       { user: session.metadata.userId },
// // //       {
// // //         plan: session.metadata.plan,
// // //         status: 'active',
// // //         stripeCustomerId: session.customer,
// // //         stripeSubscriptionId: session.subscription,
// // //         currentPeriodEnd: new Date(session.expires_at * 1000),
// // //         usageThisMonth: {
// // //           characters: 0,
// // //           translations: 0
// // //         }
// // //       },
// // //       { upsert: true }
// // //     );
// // //   }

// // //   res.json({ received: true });
// // // };


// // // controllers/subscriptionController.js
// // const Subscription = require('../models/Subscription');

// // exports.getSubscriptionStatus = async (req, res) => {
// //   try {
// //     const subscription = await Subscription.findOne({ 
// //       user: req.user.id,
// //       status: 'active'
// //     });

// //     if (!subscription) {
// //       return res.json({
// //         plan: 'free',
// //         status: 'active',
// //         daysUntilRenewal: null,
// //         needsWarning: false,
// //         limits: {
// //           characters: 50000,
// //           translations: 50
// //         }
// //       });
// //     }

// //     // Pour les tests, on simule une date de renouvellement
// //     const daysUntilRenewal = 3;

// //     res.json({
// //       plan: subscription.plan,
// //       status: subscription.status,
// //       daysUntilRenewal,
// //       needsWarning: daysUntilRenewal <= 7,
// //       limits: getPlanLimits(subscription.plan)
// //     });
// //   } catch (error) {
// //     console.error('Erreur lors de la récupération du statut:', error);
// //     res.status(500).json({ message: 'Erreur serveur' });
// //   }
// // };

// // exports.getUsageStats = async (req, res) => {
// //   try {
// //     const subscription = await Subscription.findOne({ 
// //       user: req.user.id,
// //       status: 'active'
// //     });

// //     const plan = subscription?.plan || 'free';
// //     const limits = getPlanLimits(plan);

// //     res.json({
// //       currentMonthUsage: subscription?.usageThisMonth || {
// //         characters: 0,
// //         translations: 0
// //       },
// //       limits
// //     });
// //   } catch (error) {
// //     console.error('Erreur lors de la récupération des statistiques:', error);
// //     res.status(500).json({ message: 'Erreur serveur' });
// //   }
// // };

// // // Helper function pour obtenir les limites selon le plan
// // function getPlanLimits(plan) {
// //   const limits = {
// //     free: {
// //       characters: 50000,
// //       translations: 50
// //     },
// //     starter: {
// //       characters: 300000,
// //       translations: 300
// //     },
// //     pro: {
// //       characters: 1000000,
// //       translations: 1000
// //     },
// //     enterprise: {
// //       characters: Infinity,
// //       translations: Infinity
// //     }
// //   };

// //   return limits[plan] || limits.free;
// // }

// // // Pour les tests, on simule la création d'un abonnement sans Stripe
// // // controllers/subscriptionController.js
// // exports.createCheckoutSession = async (req, res) => {
// //     try {
// //       const { planId } = req.body;
      
// //       // Permettre la rétrogradation vers le plan gratuit
// //       if (planId === 'free') {
// //         const subscription = await Subscription.findOneAndUpdate(
// //           { user: req.user.id },
// //           {
// //             plan: 'free',
// //             status: 'active',
// //             currentPeriodEnd: null,
// //             usageThisMonth: {
// //               characters: 0,
// //               translations: 0
// //             }
// //           },
// //           { upsert: true, new: true }
// //         );
  
// //         return res.json({ 
// //           success: true,
// //           subscription,
// //           message: 'Plan mis à jour vers Free'
// //         });
// //       }
  
// //       // Pour les autres plans
// //       if (!['starter', 'pro', 'enterprise'].includes(planId)) {
// //         return res.status(400).json({ message: 'Plan invalide' });
// //       }
  
// //       const subscription = await Subscription.findOneAndUpdate(
// //         { user: req.user.id },
// //         {
// //           plan: planId,
// //           status: 'active',
// //           currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
// //           usageThisMonth: {
// //             characters: 0,
// //             translations: 0
// //           }
// //         },
// //         { upsert: true, new: true }
// //       );
  
// //       res.json({ 
// //         success: true,
// //         subscription 
// //       });
// //     } catch (error) {
// //       console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
// //       res.status(500).json({ message: 'Erreur serveur' });
// //     }
// //   };

// // // Simuler la mise à jour de l'utilisation
// // exports.updateUsage = async (req, res) => {
// //   try {
// //     const { characters = 0, translations = 0 } = req.body;
    
// //     const subscription = await Subscription.findOne({ 
// //       user: req.user.id,
// //       status: 'active'
// //     });

// //     if (!subscription) {
// //       return res.status(404).json({ message: 'Aucun abonnement actif trouvé' });
// //     }

// //     subscription.usageThisMonth = {
// //       characters: (subscription.usageThisMonth?.characters || 0) + characters,
// //       translations: (subscription.usageThisMonth?.translations || 0) + translations
// //     };

// //     await subscription.save();

// //     res.json({
// //       success: true,
// //       usage: subscription.usageThisMonth
// //     });
// //   } catch (error) {
// //     console.error('Erreur lors de la mise à jour de l\'utilisation:', error);
// //     res.status(500).json({ message: 'Erreur serveur' });
// //   }
// // };


// const Subscription = require('../models/Subscription');
// const Translation = require('../models/Translation');
// const User = require('../models/User');
// require('dotenv').config();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const PLAN_LIMITS = {
// free: {
//    characters: 50000,
//    translations: 50
//  },
// starter: {
//    characters: 300000, 
//    translations: 300,
//    price_id: process.env.STRIPE_STARTER_PRICE_ID
//  },
// pro: {
//    characters: 1000000,
//    translations: 1000,
//    price_id: process.env.STRIPE_PRO_PRICE_ID
//  }
// };


// //  try {
// //    const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
// //    if (!subscription) {
// //      return res.json({
// //        plan: 'free',
// //        status: 'active',
// //        limits: PLAN_LIMITS.free
// //      });
// //    }

// //    res.json({
// //      plan: subscription.plan,
// //      status: subscription.status,
// //      limits: PLAN_LIMITS[subscription.plan],
// //      usage: subscription.usageThisMonth
// //    });
// //  } catch (error) {
// //    res.status(500).json({ message: error.message });
// //  }
// // };


// // controllers/subscriptionController.js

// exports.getSubscriptionStatus = async (req, res) => {
//     try {
//       const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
  
//       if (!subscription) {
//         return res.json({
//           plan: 'free',
//           status: 'active',
//           limits: PLAN_LIMITS.free,
//           currentMonthUsage: { characters: 0, translations: 0 },
//           usageHistory: [],
//           isApproachingLimit: false,
//           daysUntilRenewal: null
//         });
//       }
  
//       const plan = subscription.plan;
//       const status = subscription.status;
//       const currentMonthUsage = subscription.usageThisMonth;
//       const limits = PLAN_LIMITS[plan];
//       const isApproachingLimit = subscription.isApproachingLimit;
//       const daysUntilRenewal = subscription.daysUntilRenewal;
  
//       // Transformer usageHistory pour le frontend
//       const monthlyHistory = subscription.usageHistory.map((entry) => ({
//         month: entry.month,
//         characters: entry.words,        // ou entry.characters selon votre logique
//         translations: entry.requests
//       }));
  
//       res.json({
//         plan,
//         status,
//         currentMonthUsage,
//         limits,
//         monthlyHistory,
//         isApproachingLimit,
//         daysUntilRenewal
//       });
//     } catch (error) {
//       console.error('Erreur getSubscriptionStatus:', error);
//       res.status(500).json({ message: error.message });
//     }
//   };
  
// exports.createCheckoutSession = async (req, res) => {
//  try {
//    const { planId } = req.body;
//    const user = await User.findById(req.user.id);

//    const session = await stripe.checkout.sessions.create({
//      payment_method_types: ['card'],
//      line_items: [{
//        price: PLAN_LIMITS[planId].price_id,
//        quantity: 1
//      }],
//      mode: 'subscription',
//      success_url: `${process.env.BACKEND_URL}/api/subscriptions/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//      cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
//      customer_email: user.email,
//      metadata: {
//        userId: user.id,
//        plan: planId
//      }
//    });

//    res.json({ url: session.url });
//  } catch (error) {
//    res.status(500).json({ message: error.message }); 
//  }
// };



// exports.getUsageStats = async (req, res) => {
//     try {
//       const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
  
//       // Si pas de subscription, on renvoie default
//       if (!subscription) {
//         return res.json({
//           plan: 'free',
//           status: 'active',
//           limits: PLAN_LIMITS.free,
//           currentMonthUsage: { characters: 0, translations: 0 },
//           usageHistory: []
//         });
//       }
  
//       const plan = subscription.plan;
//       const status = subscription.status;
//       const currentMonthUsage = subscription.usageThisMonth;
//       const limits = PLAN_LIMITS[plan];
  
//       // Transformons usageHistory pour un BarChart
//       // (ex: renommer `words` => `characters`, `requests` => `translations`, selon votre usage)
//       const monthlyHistory = subscription.usageHistory.map((entry) => {
//         // entry.month = "YYYY-MM"
//         return {
//           month: entry.month,
//           characters: entry.words,        // ou entry.words si vous gérez "words"
//           translations: entry.requests   // ou "requests" = nb de requêtes
//         };
//       });
  
//       res.json({
//         plan,
//         status,
//         currentMonthUsage,
//         limits,
//         monthlyHistory
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };
  

// exports.updateUsage = async (req, res) => {
//  try {
//    const { characters = 0, translations = 0 } = req.body;
//    const subscription = await Subscription.findOneAndUpdate(
//      { user: req.user.id, status: 'active' },
//      {
//        $inc: {
//          'usageThisMonth.characters': characters,
//          'usageThisMonth.translations': translations  
//        }
//      },
//      { new: true }
//    );
   
//    res.json({ success: true, usage: subscription.usageThisMonth });
//  } catch (error) {
//    res.status(500).json({ message: error.message });
//  }
// };


// exports.handlePaymentSuccess = async (req, res) => {
//     try {
//       const { session_id } = req.query;
//       // Récupérer la session Stripe
//       const session = await stripe.checkout.sessions.retrieve(session_id);
  
//       if (session.payment_status === 'paid') {
//         // Utiliser userId et plan depuis la metadata
//         const userId = session.metadata.userId;
//         const plan = session.metadata.plan;
  
//         await Subscription.findOneAndUpdate(
//           { user: userId },
//           {
//             plan: plan,
//             status: 'active',
//             stripeCustomerId: session.customer,
//             stripeSubscriptionId: session.subscription,
//             // Réinitialiser l'usage du mois si besoin
//             usageThisMonth: { characters: 0, translations: 0 },
//           },
//           { upsert: true, new: true }
//         );
  
//         // Mettre à jour aussi l'utilisateur
//         await User.findByIdAndUpdate(userId, {
//           subscriptionPlan: plan,
//           stripeCustomerId: session.customer,
//         });
  
//         // Rediriger l’utilisateur (vers le frontend par ex.)
//         // s’il est déjà loggé, tu peux le rediriger vers /translate
//         return res.redirect(`${process.env.CLIENT_URL}/payment/success`);
//       }
  
//       return res.status(400).json({ message: 'Payment not completed' });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: error.message });
//     }
//   };



// exports.verifyCheckout = async (req, res) => {
//     const { sessionId, planId } = req.body;
//     try {
//       const session = await stripe.checkout.sessions.retrieve(sessionId);
//       if (session.payment_status !== 'paid') {
//         return res.status(400).json({ message: "Le paiement n'est pas validé." });
//       }
  
//       const userId = session.metadata.userId; // si vous l'avez mis dans metadata
//       const subscription = await Subscription.findOne({ user: userId, status: 'active' });
  
//       if (subscription) {
//         // Calculer les jours jusqu'au renouvellement
//         const now = new Date();
//         const currentPeriodEnd = new Date(session.current_period_end * 1000); // session.current_period_end est un timestamp UNIX
//         const diffTime = currentPeriodEnd - now;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         subscription.daysUntilRenewal = diffDays;
  
//         // Mettre à jour l'abonnement
//         subscription.plan = planId;
//         subscription.status = 'active';
//         subscription.stripeCustomerId = session.customer;
//         subscription.stripeSubscriptionId = session.subscription;
//         subscription.currentPeriodEnd = currentPeriodEnd;
//         subscription.usageThisMonth = { characters: 0, translations: 0 };
//         subscription.isApproachingLimit = false; // Reset au nouveau abonnement
  
//         await subscription.save();
  
//         // Mettre à jour l'utilisateur
//         await User.findByIdAndUpdate(userId, {
//           subscriptionPlan: planId,
//           stripeCustomerId: session.customer,
//         });
//       }
  
//       return res.json({ message: 'Abonnement mis à jour avec succès !' });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'Erreur lors de la vérification' });
//     }
//   };
  


const Subscription = require('../models/Subscription');
const Translation = require('../models/Translation');
const User = require('../models/User');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Définition des limites par plan
const PLAN_LIMITS = {
  free: {
    characters: 50000,
    translations: 50
  },
  starter: {
    characters: 300000,
    translations: 300,
    price_id: process.env.STRIPE_STARTER_PRICE_ID
  },
  pro: {
    characters: 1000000,
    translations: 1000,
    price_id: process.env.STRIPE_PRO_PRICE_ID
  },
  enterprise: {
    characters: 5000000,
    translations: 5000,
    price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID
  }
};

// Utilitaire pour vérifier l'expiration d'un abonnement
const checkSubscriptionExpiration = async (subscription) => {
  if (!subscription || !subscription.currentPeriodEnd) return true;
  
  const now = new Date();
  const endDate = new Date(subscription.currentPeriodEnd);
  
  if (now > endDate) {
    subscription.status = 'inactive';
    subscription.plan = 'free';
    await subscription.save();
    return true;
  }
  
  return false;
};

// Utilitaire pour calculer les jours jusqu'au renouvellement
const calculateDaysUntilRenewal = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Obtenir le statut de l'abonnement
exports.getSubscriptionStatus = async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
    const isExpired = await checkSubscriptionExpiration(subscription);

    // Si pas d'abonnement ou expiré, retourner le plan gratuit
    if (!subscription || isExpired) {
      return res.json({
        plan: 'free',
        status: 'active',
        limits: PLAN_LIMITS.free,
        currentMonthUsage: { characters: 0, translations: 0 },
        usageHistory: [],
        isApproachingLimit: false,
        daysUntilRenewal: null
      });
    }

    // Calculer days until renewal
    if (subscription.currentPeriodEnd) {
      subscription.daysUntilRenewal = calculateDaysUntilRenewal(subscription.currentPeriodEnd);
      await subscription.save();
    }

    // Transformer l'historique d'utilisation
    const monthlyHistory = subscription.usageHistory.map(entry => ({
      month: entry.month,
      characters: entry.words,
      translations: entry.requests
    }));

    res.json({
      plan: subscription.plan,
      status: subscription.status,
      currentMonthUsage: subscription.usageThisMonth,
      limits: PLAN_LIMITS[subscription.plan],
      monthlyHistory,
      isApproachingLimit: subscription.isApproachingLimit,
      daysUntilRenewal: subscription.daysUntilRenewal
    });
  } catch (error) {
    console.error('Erreur getSubscriptionStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// Créer une session de paiement Stripe
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;
    const user = await User.findById(req.user.id);

    // Vérifier si le plan existes
    if (!PLAN_LIMITS[planId] || !PLAN_LIMITS[planId].price_id) {
      return res.status(400).json({ message: 'Plan invalide' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: PLAN_LIMITS[planId].price_id,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.BACKEND_URL}/api/subscriptions/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan: planId
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gérer le succès du paiement
exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Paiement non complété' });
    }

    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    // Calculer la date de fin de période (30 jours)
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    // Mettre à jour ou créer l'abonnement
    await Subscription.findOneAndUpdate(
      { user: userId },
      {
        plan: plan,
        status: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd: currentPeriodEnd,
        usageThisMonth: { characters: 0, translations: 0 },
        isApproachingLimit: false,
        daysUntilRenewal: 30
      },
      { upsert: true, new: true }
    );

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(userId, {
      subscriptionPlan: plan,
      stripeCustomerId: session.customer
    });

    return res.redirect(`${process.env.CLIENT_URL}/payment/success`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Vérifier le checkout
exports.verifyCheckout = async (req, res) => {
  const { sessionId, planId } = req.body;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: "Le paiement n'est pas validé." });
    }

    const userId = session.metadata.userId;
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    // Mettre à jour ou créer l'abonnement
    let subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      subscription = new Subscription({
        user: userId,
        plan: planId,
        status: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd: currentPeriodEnd,
        usageThisMonth: { characters: 0, translations: 0 },
        isApproachingLimit: false
      });
    } else {
      subscription.plan = planId;
      subscription.status = 'active';
      subscription.stripeCustomerId = session.customer;
      subscription.stripeSubscriptionId = session.subscription;
      subscription.currentPeriodEnd = currentPeriodEnd;
      subscription.usageThisMonth = { characters: 0, translations: 0 };
      subscription.isApproachingLimit = false;
    }

    subscription.daysUntilRenewal = calculateDaysUntilRenewal(currentPeriodEnd);
    await subscription.save();

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(userId, {
      subscriptionPlan: planId,
      stripeCustomerId: session.customer
    });

    return res.json({ 
      message: 'Abonnement mis à jour avec succès !',
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        daysUntilRenewal: subscription.daysUntilRenewal,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la vérification' });
  }
};

// Mettre à jour l'utilisation
exports.updateUsage = async (req, res) => {
  try {
    const { characters = 0, translations = 0 } = req.body;
    
    // Vérifier d'abord si l'abonnement est actif et non expiré
    const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
    if (!subscription || await checkSubscriptionExpiration(subscription)) {
      return res.status(403).json({ 
        message: "Votre abonnement a expiré ou n'est plus actif",
        plan: 'free'
      });
    }

    // Vérifier si les limites seront dépassées
    const newCharacters = subscription.usageThisMonth.characters + characters;
    const newTranslations = subscription.usageThisMonth.translations + translations;
    const limits = PLAN_LIMITS[subscription.plan];

    if (newCharacters > limits.characters || newTranslations > limits.translations) {
      return res.status(403).json({ 
        message: "Cette action dépasserait vos limites d'utilisation",
        currentUsage: subscription.usageThisMonth,
        limits
      });
    }

    // Mettre à jour l'utilisation
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { user: req.user.id, status: 'active' },
      {
        $inc: {
          'usageThisMonth.characters': characters,
          'usageThisMonth.translations': translations
        }
      },
      { new: true }
    );

    // Vérifier si on approche des limites (80%)
    const characterUsageRatio = newCharacters / limits.characters;
    const translationUsageRatio = newTranslations / limits.translations;
    
    if (characterUsageRatio >= 0.8 || translationUsageRatio >= 0.8) {
      updatedSubscription.isApproachingLimit = true;
      await updatedSubscription.save();
    }

    res.json({ 
      success: true, 
      usage: updatedSubscription.usageThisMonth,
      isApproachingLimit: updatedSubscription.isApproachingLimit 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les statistiques d'utilisation
exports.getUsageStats = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
    const isExpired = await checkSubscriptionExpiration(subscription);

    // Si pas de subscription ou expirée, retourner les stats par défaut
    if (!subscription || isExpired) {
      return res.json({
        plan: 'free',
        status: 'active',
        limits: PLAN_LIMITS.free,
        currentMonthUsage: { characters: 0, translations: 0 },
        usageHistory: []
      });
    }

    // Transformer l'historique pour le graphique
    const monthlyHistory = subscription.usageHistory.map(entry => ({
      month: entry.month,
      characters: entry.words,
      translations: entry.requests
    }));

    res.json({
      plan: subscription.plan,
      status: subscription.status,
      currentMonthUsage: subscription.usageThisMonth,
      limits: PLAN_LIMITS[subscription.plan],
      monthlyHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};