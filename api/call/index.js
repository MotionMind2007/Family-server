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

    if (!tokens || !Array.isArray(tokens)) {
      return res.status(400).json({ error: 'tokens array দিতে হবে' });
    }

    // Full-Screen Intent সহ কলিং মেসেজ অবজেক্ট
    const message = {
      data: {
        type: type || 'incoming_call',
        senderName: senderName || "Family Member",
        channelId: channelId || "family_call_room",
        isCall: "true" 
      },
      android: {
        priority: 'high',
        ttl: 0, 
        notification: {
          title: `📞 Incoming Call from ${senderName || "Family"}`,
          body: "কল রিসিভ করতে এখানে ট্যাপ করুন",
          channelId: 'default',
          sound: 'default',
          priority: 'max',
          category: 'call', 
          visibility: 'public',
          // এই অংশটি অ্যাপ কিলড অবস্থায় কল ট্রিগার করার শেষ অস্ত্র
          fullScreenIntent: true, 
        }
      },
      tokens: tokens,
    };

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
