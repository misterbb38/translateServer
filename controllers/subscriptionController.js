// // // controllers/subscriptionController.js
// // const Subscription = require('../models/Subscription');
// // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
// //         needsWarning: false
// //       });
// //     }

// //     const daysUntilRenewal = subscription.currentPeriodEnd 
// //       ? Math.ceil((new Date(subscription.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))
// //       : null;

// //     res.json({
// //       plan: subscription.plan,
// //       status: subscription.status,
// //       daysUntilRenewal,
// //       needsWarning: daysUntilRenewal <= 7,
// //       usage: subscription.usageThisMonth,
// //       limits: subscription.planLimits
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

// //     const limits = {
// //       free: {
// //         characters: 50000,
// //         translations: 50
// //       },
// //       starter: {
// //         characters: 300000,
// //         translations: 300
// //       },
// //       pro: {
// //         characters: 1000000,
// //         translations: 1000
// //       },
// //       enterprise: {
// //         characters: Infinity,
// //         translations: Infinity
// //       }
// //     };

// //     const plan = subscription?.plan || 'free';

// //     res.json({
// //       currentMonthUsage: subscription?.usageThisMonth || {
// //         characters: 0,
// //         translations: 0
// //       },
// //       limits: limits[plan]
// //     });
// //   } catch (error) {
// //     console.error('Erreur lors de la récupération des statistiques:', error);
// //     res.status(500).json({ message: 'Erreur serveur' });
// //   }
// // };

// // exports.createCheckoutSession = async (req, res) => {
// //   try {
// //     const { planId } = req.body;

// //     const prices = {
// //       starter: 'price_xxxxx', // Remplacez par vos IDs de prix Stripe
// //       pro: 'price_xxxxx',
// //       enterprise: 'price_xxxxx'
// //     };

// //     if (!prices[planId]) {
// //       return res.status(400).json({ message: 'Plan invalide' });
// //     }

// //     const session = await stripe.checkout.sessions.create({
// //       payment_method_types: ['card'],
// //       line_items: [{
// //         price: prices[planId],
// //         quantity: 1,
// //       }],
// //       mode: 'subscription',
// //       success_url: `${process.env.CLIENT_URL}/payment/success`,
// //       cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
// //       customer_email: req.user.email,
// //       metadata: {
// //         userId: req.user.id,
// //         plan: planId
// //       }
// //     });

// //     res.json({ url: session.url });
// //   } catch (error) {
// //     console.error('Erreur lors de la création de la session:', error);
// //     res.status(500).json({ message: 'Erreur serveur' });
// //   }
// // };

// // exports.handleWebhook = async (req, res) => {
// //   const sig = req.headers['stripe-signature'];
// //   let event;

// //   try {
// //     event = stripe.webhooks.constructEvent(
// //       req.body,
// //       sig,
// //       process.env.STRIPE_WEBHOOK_SECRET
// //     );
// //   } catch (error) {
// //     return res.status(400).json({ message: 'Webhook error' });
// //   }

// //   if (event.type === 'checkout.session.completed') {
// //     const session = event.data.object;
    
// //     await Subscription.findOneAndUpdate(
// //       { user: session.metadata.userId },
// //       {
// //         plan: session.metadata.plan,
// //         status: 'active',
// //         stripeCustomerId: session.customer,
// //         stripeSubscriptionId: session.subscription,
// //         currentPeriodEnd: new Date(session.expires_at * 1000),
// //         usageThisMonth: {
// //           characters: 0,
// //           translations: 0
// //         }
// //       },
// //       { upsert: true }
// //     );
// //   }

// //   res.json({ received: true });
// // };


// // controllers/subscriptionController.js
// const Subscription = require('../models/Subscription');

// exports.getSubscriptionStatus = async (req, res) => {
//   try {
//     const subscription = await Subscription.findOne({ 
//       user: req.user.id,
//       status: 'active'
//     });

//     if (!subscription) {
//       return res.json({
//         plan: 'free',
//         status: 'active',
//         daysUntilRenewal: null,
//         needsWarning: false,
//         limits: {
//           characters: 50000,
//           translations: 50
//         }
//       });
//     }

//     // Pour les tests, on simule une date de renouvellement
//     const daysUntilRenewal = 3;

//     res.json({
//       plan: subscription.plan,
//       status: subscription.status,
//       daysUntilRenewal,
//       needsWarning: daysUntilRenewal <= 7,
//       limits: getPlanLimits(subscription.plan)
//     });
//   } catch (error) {
//     console.error('Erreur lors de la récupération du statut:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// exports.getUsageStats = async (req, res) => {
//   try {
//     const subscription = await Subscription.findOne({ 
//       user: req.user.id,
//       status: 'active'
//     });

//     const plan = subscription?.plan || 'free';
//     const limits = getPlanLimits(plan);

//     res.json({
//       currentMonthUsage: subscription?.usageThisMonth || {
//         characters: 0,
//         translations: 0
//       },
//       limits
//     });
//   } catch (error) {
//     console.error('Erreur lors de la récupération des statistiques:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };

// // Helper function pour obtenir les limites selon le plan
// function getPlanLimits(plan) {
//   const limits = {
//     free: {
//       characters: 50000,
//       translations: 50
//     },
//     starter: {
//       characters: 300000,
//       translations: 300
//     },
//     pro: {
//       characters: 1000000,
//       translations: 1000
//     },
//     enterprise: {
//       characters: Infinity,
//       translations: Infinity
//     }
//   };

//   return limits[plan] || limits.free;
// }

// // Pour les tests, on simule la création d'un abonnement sans Stripe
// // controllers/subscriptionController.js
// exports.createCheckoutSession = async (req, res) => {
//     try {
//       const { planId } = req.body;
      
//       // Permettre la rétrogradation vers le plan gratuit
//       if (planId === 'free') {
//         const subscription = await Subscription.findOneAndUpdate(
//           { user: req.user.id },
//           {
//             plan: 'free',
//             status: 'active',
//             currentPeriodEnd: null,
//             usageThisMonth: {
//               characters: 0,
//               translations: 0
//             }
//           },
//           { upsert: true, new: true }
//         );
  
//         return res.json({ 
//           success: true,
//           subscription,
//           message: 'Plan mis à jour vers Free'
//         });
//       }
  
//       // Pour les autres plans
//       if (!['starter', 'pro', 'enterprise'].includes(planId)) {
//         return res.status(400).json({ message: 'Plan invalide' });
//       }
  
//       const subscription = await Subscription.findOneAndUpdate(
//         { user: req.user.id },
//         {
//           plan: planId,
//           status: 'active',
//           currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
//           usageThisMonth: {
//             characters: 0,
//             translations: 0
//           }
//         },
//         { upsert: true, new: true }
//       );
  
//       res.json({ 
//         success: true,
//         subscription 
//       });
//     } catch (error) {
//       console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
//       res.status(500).json({ message: 'Erreur serveur' });
//     }
//   };

// // Simuler la mise à jour de l'utilisation
// exports.updateUsage = async (req, res) => {
//   try {
//     const { characters = 0, translations = 0 } = req.body;
    
//     const subscription = await Subscription.findOne({ 
//       user: req.user.id,
//       status: 'active'
//     });

//     if (!subscription) {
//       return res.status(404).json({ message: 'Aucun abonnement actif trouvé' });
//     }

//     subscription.usageThisMonth = {
//       characters: (subscription.usageThisMonth?.characters || 0) + characters,
//       translations: (subscription.usageThisMonth?.translations || 0) + translations
//     };

//     await subscription.save();

//     res.json({
//       success: true,
//       usage: subscription.usageThisMonth
//     });
//   } catch (error) {
//     console.error('Erreur lors de la mise à jour de l\'utilisation:', error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// };


const Subscription = require('../models/Subscription');
const Translation = require('../models/Translation');
const User = require('../models/User');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
 }
};

// exports.getSubscriptionStatus = async (req, res) => {
//  try {
//    const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
//    if (!subscription) {
//      return res.json({
//        plan: 'free',
//        status: 'active',
//        limits: PLAN_LIMITS.free
//      });
//    }

//    res.json({
//      plan: subscription.plan,
//      status: subscription.status,
//      limits: PLAN_LIMITS[subscription.plan],
//      usage: subscription.usageThisMonth
//    });
//  } catch (error) {
//    res.status(500).json({ message: error.message });
//  }
// };


// controllers/subscriptionController.js

exports.getSubscriptionStatus = async (req, res) => {
    try {
      const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
  
      if (!subscription) {
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
  
      const plan = subscription.plan;
      const status = subscription.status;
      const currentMonthUsage = subscription.usageThisMonth;
      const limits = PLAN_LIMITS[plan];
      const isApproachingLimit = subscription.isApproachingLimit;
      const daysUntilRenewal = subscription.daysUntilRenewal;
  
      // Transformer usageHistory pour le frontend
      const monthlyHistory = subscription.usageHistory.map((entry) => ({
        month: entry.month,
        characters: entry.words,        // ou entry.characters selon votre logique
        translations: entry.requests
      }));
  
      res.json({
        plan,
        status,
        currentMonthUsage,
        limits,
        monthlyHistory,
        isApproachingLimit,
        daysUntilRenewal
      });
    } catch (error) {
      console.error('Erreur getSubscriptionStatus:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
exports.createCheckoutSession = async (req, res) => {
 try {
   const { planId } = req.body;
   const user = await User.findById(req.user.id);

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

// exports.getUsageStats = async (req, res) => {
//  try {
//    const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
//    res.json({
//      currentMonthUsage: subscription?.usageThisMonth || { characters: 0, translations: 0 },
//      limits: PLAN_LIMITS[subscription?.plan || 'free']
//    });
//  } catch (error) {
//    res.status(500).json({ message: error.message });
//  }
// };

// subscriptionController.js
exports.getUsageStats = async (req, res) => {
    try {
      const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
  
      // Si pas de subscription, on renvoie default
      if (!subscription) {
        return res.json({
          plan: 'free',
          status: 'active',
          limits: PLAN_LIMITS.free,
          currentMonthUsage: { characters: 0, translations: 0 },
          usageHistory: []
        });
      }
  
      const plan = subscription.plan;
      const status = subscription.status;
      const currentMonthUsage = subscription.usageThisMonth;
      const limits = PLAN_LIMITS[plan];
  
      // Transformons usageHistory pour un BarChart
      // (ex: renommer `words` => `characters`, `requests` => `translations`, selon votre usage)
      const monthlyHistory = subscription.usageHistory.map((entry) => {
        // entry.month = "YYYY-MM"
        return {
          month: entry.month,
          characters: entry.words,        // ou entry.words si vous gérez "words"
          translations: entry.requests   // ou "requests" = nb de requêtes
        };
      });
  
      res.json({
        plan,
        status,
        currentMonthUsage,
        limits,
        monthlyHistory
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

exports.updateUsage = async (req, res) => {
 try {
   const { characters = 0, translations = 0 } = req.body;
   const subscription = await Subscription.findOneAndUpdate(
     { user: req.user.id, status: 'active' },
     {
       $inc: {
         'usageThisMonth.characters': characters,
         'usageThisMonth.translations': translations  
       }
     },
     { new: true }
   );
   
   res.json({ success: true, usage: subscription.usageThisMonth });
 } catch (error) {
   res.status(500).json({ message: error.message });
 }
};


exports.handlePaymentSuccess = async (req, res) => {
    try {
      const { session_id } = req.query;
      // Récupérer la session Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);
  
      if (session.payment_status === 'paid') {
        // Utiliser userId et plan depuis la metadata
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
  
        await Subscription.findOneAndUpdate(
          { user: userId },
          {
            plan: plan,
            status: 'active',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            // Réinitialiser l'usage du mois si besoin
            usageThisMonth: { characters: 0, translations: 0 },
          },
          { upsert: true, new: true }
        );
  
        // Mettre à jour aussi l'utilisateur
        await User.findByIdAndUpdate(userId, {
          subscriptionPlan: plan,
          stripeCustomerId: session.customer,
        });
  
        // Rediriger l’utilisateur (vers le frontend par ex.)
        // s’il est déjà loggé, tu peux le rediriger vers /translate
        return res.redirect(`${process.env.CLIENT_URL}/payment/success`);
      }
  
      return res.status(400).json({ message: 'Payment not completed' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

  // subscriptionController.js
// exports.verifyCheckout = async (req, res) => {
//     const { sessionId, planId } = req.body;
//     try {
//       const session = await stripe.checkout.sessions.retrieve(sessionId);
//       if (session.payment_status !== 'paid') {
//         return res.status(400).json({ message: "Le paiement n'est pas validé." });
//       }
  
//       const userId = session.metadata.userId; // si vous l'avez mis dans metadata
//       await Subscription.findOneAndUpdate(
//         { user: userId },
//         {
//           plan: planId,
//           status: 'active',
//           stripeCustomerId: session.customer,
//           stripeSubscriptionId: session.subscription,
//           usageThisMonth: { characters: 0, translations: 0 },
//         },
//         { upsert: true, new: true }
//       );
  
//       await User.findByIdAndUpdate(userId, {
//         subscriptionPlan: planId,
//         stripeCustomerId: session.customer,
//       });
  
//       return res.json({ message: 'Abonnement mis à jour avec succès !' });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'Erreur lors de la vérification' });
//     }
//   };
  
// controllers/subscriptionController.js

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
//         const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
//         const diffTime = currentPeriodEnd - now;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         subscription.daysUntilRenewal = diffDays;
  
//         // Mettre à jour l'abonnement
//         subscription.plan = planId;
//         subscription.status = 'active';
//         subscription.stripeCustomerId = session.customer;
//         subscription.stripeSubscriptionId = session.subscription;
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
  

// controllers/subscriptionController.js

exports.verifyCheckout = async (req, res) => {
    const { sessionId, planId } = req.body;
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: "Le paiement n'est pas validé." });
      }
  
      const userId = session.metadata.userId; // si vous l'avez mis dans metadata
      const subscription = await Subscription.findOne({ user: userId, status: 'active' });
  
      if (subscription) {
        // Calculer les jours jusqu'au renouvellement
        const now = new Date();
        const currentPeriodEnd = new Date(session.current_period_end * 1000); // session.current_period_end est un timestamp UNIX
        const diffTime = currentPeriodEnd - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        subscription.daysUntilRenewal = diffDays;
  
        // Mettre à jour l'abonnement
        subscription.plan = planId;
        subscription.status = 'active';
        subscription.stripeCustomerId = session.customer;
        subscription.stripeSubscriptionId = session.subscription;
        subscription.currentPeriodEnd = currentPeriodEnd;
        subscription.usageThisMonth = { characters: 0, translations: 0 };
        subscription.isApproachingLimit = false; // Reset au nouveau abonnement
  
        await subscription.save();
  
        // Mettre à jour l'utilisateur
        await User.findByIdAndUpdate(userId, {
          subscriptionPlan: planId,
          stripeCustomerId: session.customer,
        });
      }
  
      return res.json({ message: 'Abonnement mis à jour avec succès !' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la vérification' });
    }
  };
  