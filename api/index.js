const admin = require('firebase-admin');
const serviceAccount = require('../service.json');

// ফায়ারবেস ইনিশিয়ালাইজেশন
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = async (req, res) => {
  // শুধুমাত্র POST রিকোয়েস্ট এক্সেপ্ট করব
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { tokens, messageText, senderName } = req.body;

  // ডাটা চেক করা
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ error: 'No tokens provided' });
  }

  try {
    // এক সাথে অনেক টোকেনে মেসেজ পাঠানোর আধুনিক সিস্টেম (Multicast)
    const message = {
      notification: {
        title: senderName || "নতুন মেসেজ",
        body: messageText,
      },
      android: {
        priority: 'high',
        notification: {
          color: '#2E7D32',
          sound: 'default',
        },
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`✅ ${response.successCount} টি নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!`);
    
    res.status(200).json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('❌ FCM Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
