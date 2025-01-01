// // // routes/subscriptionRoutes.js
// // const express = require('express');
// // const router = express.Router();
// // const subscriptionController = require('../controllers/subscriptionController');
// // const authMiddleware = require('../middleware/authMiddleware');

// // router.get('/status', authMiddleware, subscriptionController.getSubscriptionStatus);
// // router.get('/usage', authMiddleware, subscriptionController.getUsageStats);
// // router.post('/create-checkout-session', authMiddleware, subscriptionController.createCheckoutSession);
// // router.post('/webhook', subscriptionController.handleWebhook);

// // module.exports = router;


// // routes/subscriptionRoutes.js
// const express = require('express');
// const router = express.Router();
// const subscriptionController = require('../controllers/subscriptionController');
// const authMiddleware = require('../middleware/authMiddleware');

// router.get('/status', authMiddleware, subscriptionController.getSubscriptionStatus);
// router.get('/usage', authMiddleware, subscriptionController.getUsageStats);
// router.post('/update-usage', authMiddleware, subscriptionController.updateUsage);
// router.post('/subscribe', authMiddleware, subscriptionController.createCheckoutSession);

// module.exports = router;


// routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/status', authMiddleware, subscriptionController.getSubscriptionStatus);
router.get('/usage', authMiddleware, subscriptionController.getUsageStats);
router.post('/create-checkout-session', authMiddleware, subscriptionController.createCheckoutSession);
router.get('/payment/success',  subscriptionController.handlePaymentSuccess);
router.post('/verify-checkout', subscriptionController.verifyCheckout);
router.post('/update-usage', authMiddleware, subscriptionController.updateUsage);

module.exports = router;