const admin = require('firebase-admin');

module.exports = async (req, res) => {
  // ১. ভেরিয়েবল চেক করা
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    return res.status(500).json({ 
      error: "Configuration Error", 
      message: "FIREBASE_SERVICE_ACCOUNT variable is missing in Vercel settings!" 
    });
  }

  try {
    // ২. ফায়ারবেস ইনিশিয়ালাইজেশন
    if (!admin.apps.length) {
      // JSON কন্টেন্টটি রিড করা এবং প্রাইভেট কি-র ফরম্যাট ঠিক করা
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n')
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    // ৩. শুধুমাত্র POST রিকোয়েস্ট চেক
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { tokens, messageText, senderName } = req.body;

    // ৪. ডাটা ভ্যালিডেশন
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'No tokens provided' });
    }

    // ৫. নোটিফিকেশন পাঠানো (Multicast)
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
    
    console.log(`✅ Success: ${response.successCount} messages sent.`);
    
    return res.status(200).json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('❌ Server Error:', error.message);
    
    // ভেরিয়েবল জেসন ফরম্যাটে না থাকলে বা অন্য কোনো এরর হলে সেটা রেসপন্সে পাঠানো
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      tip: "Make sure your FIREBASE_SERVICE_ACCOUNT contains the full JSON string."
    });
  }
};