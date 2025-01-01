// scripts/initSubscriptions.js

const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
require('dotenv').config(); // Charger les variables d'environnement depuis .env

async function initSubscriptions() {
  try {
    // Vérifiez si MONGODB_URI est défini
    if (!process.env.MONGO_URI) {
      throw new Error('MONGODB_URI is not defined in the environment variables.');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
     
    });

    // Initialiser usageThisMonth si manquant
    const usageResult = await Subscription.updateMany(
      { usageThisMonth: { $exists: false } },
      { $set: { usageThisMonth: { characters: 0, translations: 0 } } }
    );
    console.log(`${usageResult.nModified} subscriptions updated for usageThisMonth.`);

    // Initialiser currentPeriodEnd si manquant
    // Définissez une valeur par défaut, par exemple, un mois à partir de maintenant
    const now = new Date();
    const defaultCurrentPeriodEnd = new Date(now.setMonth(now.getMonth() + 1));

    const periodResult = await Subscription.updateMany(
      { currentPeriodEnd: { $exists: false } },
      { $set: { currentPeriodEnd: defaultCurrentPeriodEnd } }
    );
    console.log(`${periodResult.nModified} subscriptions updated for currentPeriodEnd.`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des abonnements:', error);
    mongoose.connection.close();
  }
}

initSubscriptions();
