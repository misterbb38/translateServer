


// controllers/authController.js
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
//     }

//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
//     }

//     user = new User({
//       name,
//       email,
//       password,
//       subscriptionPlan: 'free', // Plan gratuit par défaut
//       monthlyUsage: {
//         characters: 0,
//         translations: 0
//       }
//     });

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);
//     await user.save();

//     // Créer une subscription gratuite
//     const subscription = new Subscription({
//       user: user.id,
//       plan: 'free',
//       status: 'active'
//     });
//     await subscription.save();

//     const payload = {
//       user: {
//         id: user.id,
//         plan: 'free'
//       }
//     };

//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' },
//       (err, token) => {
//         if (err) throw err;
//         res.status(201).json({ token });
//       }
//     );
//   } catch (error) {
//     console.error('Erreur lors de l\'inscription:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };


exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation des entrées
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Veuillez fournir toutes les informations requises.' 
      });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Format d\'email invalide.' 
      });
    }

    // Vérification si l'utilisateur existe
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ 
        message: 'Un utilisateur avec cet email existe déjà.' 
      });
    }

    // Création de l'utilisateur
    user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      subscriptionPlan: 'free',
      monthlyUsage: {
        characters: 0,
        translations: 0
      }
    });

    // Hashage du mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Définir la période initiale (30 jours)
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    // Créer une subscription gratuite
    const subscription = new Subscription({
      user: user.id,
      plan: 'free',
      status: 'active',
      currentPeriodEnd: currentPeriodEnd,
      usageThisMonth: { 
        characters: 0, 
        translations: 0 
      },
      isApproachingLimit: false,
      daysUntilRenewal: 30
    });
    await subscription.save();

    // Créer le token JWT
    const payload = {
      user: {
        id: user.id,
        plan: 'free'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }, // Augmenté à 24h pour plus de confort
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.subscriptionPlan
          }
        });
      }
    );

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    // Message d'erreur plus descriptif si possible
    const errorMessage = error.code === 11000 
      ? 'Cette adresse email est déjà utilisée.'
      : 'Erreur lors de l\'inscription. Veuillez réessayer.';
    
    res.status(500).json({ message: errorMessage });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const subscription = await Subscription.findOne({ 
      user: user.id, 
      status: 'active' 
    });

    const payload = {
      user: {
        id: user.id,
        plan: subscription ? subscription.plan : 'free'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ 
          token,
          subscription: {
            plan: subscription.plan,
            status: subscription.status,
            usageThisMonth: subscription.usageThisMonth
          }
        });
      }
    );
  } catch (error) {
    console.error('Erreur lors de la connexion:', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};