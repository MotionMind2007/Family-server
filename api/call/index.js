const admin = require('firebase-admin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const { tokens, senderName, type, channelId } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'tokens array দিতে হবে' });
    }

    // ৫. মেসেজ অবজেক্ট (index.js এর স্টাইলে সাজানো)
    const message = {
      // এই notification ব্লকটা থাকলেই sentCount পজিটিভ আসবে
      notification: {
        title: `📞 Incoming Call`,
        body: `${senderName || "কেউ একজন"} আপনাকে কল দিচ্ছে...`,
      },
      // ডেটা পার্ট (আপনার অ্যাপের লজিক ট্রিগার করার জন্য)
      data: {
        type: type || 'incoming_call',
        senderName: senderName || "Family Member",
        channelId: channelId || "family_call_room",
        isCall: "true" 
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
          priority: 'max',
          category: 'call',
          visibility: 'public',
        }
      },
      tokens: tokens,
    };

    // ৫. মেসেজ পাঠানো (Multicast)
    const response = await admin.messaging().sendEachForMulticast(message);

    return res.status(200).json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('❌ Call FCM Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
