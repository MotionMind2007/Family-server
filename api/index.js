const admin = require('firebase-admin');

module.exports = async (req, res) => {
  // ১. মেথড চেক করা
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // ২. Lazy initialize (Environment Variables থেকে ডাটা নেওয়া)
    if (!admin.apps.length) {
      // ভারসেল থেকে পুরো JSON স্ট্রিংটি আনা
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // নিউ-লাইন ফিক্স (ভারসেলের জন্য মাস্ট)
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const { tokens, messageText, senderName } = req.body;

    // ৩. ভ্যালিডেশন
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'tokens array দিতে হবে' });
    }

    // ৪. মেসেজ অবজেক্ট তৈরি
    const message = {
      notification: {
        title: senderName || "নতুন মেসেজ",
        body: messageText || "ফ্যামিলি অ্যাপ থেকে মেসেজ এসেছে।",
      },
      android: {
        priority: 'high',
        notification: { 
          color: '#2E7D32', 
          sound: 'default' 
        }
      },
      tokens: tokens, // মাল্টিকাস্টের জন্য tokens (array) ব্যবহার করা হয়েছে
    };

    // ৫. মেসেজ পাঠানো
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
