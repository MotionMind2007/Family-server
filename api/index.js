const admin = require('firebase-admin');

// 🔥 তোমার এই serviceAccount (একদম যেমন আছে)
const serviceAccount = { /* তোমার পুরো JSON এখানে paste করো */ };

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // ✅ Lazy initialize (শুধু request এলে init হয়)
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const { tokens, messageText, senderName } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'tokens array দিতে হবে' });
    }

    const message = {
      notification: {
        title: senderName || "নতুন মেসেজ",
        body: messageText || "ফ্যামিলি অ্যাপ থেকে মেসেজ এসেছে।",
      },
      android: {
        priority: 'high',
        notification: { color: '#2E7D32', sound: 'default' }
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(`✅ ${response.successCount} টা notification পাঠানো হয়েছে`);

    return res.status(200).json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('❌ FCM Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};