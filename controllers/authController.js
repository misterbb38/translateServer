// // controllers/authController.js

// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // Inscription d'un nouvel utilisateur
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Validation des entrées
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
//     }

//     // Vérifier si l'utilisateur existe déjà
//     let user = await User.findOne({ email });

//     if (user) {
//       return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
//     }

//     // Créer un nouvel utilisateur
//     user = new User({
//       name,
//       email,
//       password,
//     });

//     // Hacher le mot de passe
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     // Enregistrer l'utilisateur dans la base de données
//     await user.save();

//     // Créer un payload pour le JWT
//     const payload = {
//       user: {
//         id: user.id,
//       },
//     };

//     // Signer le token
//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }, // Le token expire dans 1 heure
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

// // Connexion d'un utilisateur existant
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validation des entrées
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
//     }

//     // Vérifier si l'utilisateur existe
//     let user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: 'Identifiants invalides.' });
//     }

//     // Comparer le mot de passe
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: 'Identifiants invalides.' });
//     }

//     // Créer un payload pour le JWT
//     const payload = {
//       user: {
//         id: user.id,
//       },
//     };

//     // Signer le token
//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }, // Le token expire dans 1 heure
//       (err, token) => {
//         if (err) throw err;
//         res.status(200).json({ token });
//       }
//     );
//   } catch (error) {
//     console.error('Erreur lors de la connexion:', error.message);
//     res.status(500).json({ message: 'Erreur du serveur.' });
//   }
// };



// controllers/authController.js
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    user = new User({
      name,
      email,
      password,
      subscriptionPlan: 'free', // Plan gratuit par défaut
      monthlyUsage: {
        characters: 0,
        translations: 0
      }
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Créer une subscription gratuite
    const subscription = new Subscription({
      user: user.id,
      plan: 'free',
      status: 'active'
    });
    await subscription.save();

    const payload = {
      user: {
        id: user.id,
        plan: 'free'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error.message);
    res.status(500).json({ message: 'Erreur du serveur.' });
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