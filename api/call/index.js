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

    // কলিং মেসেজ অবজেক্ট (Data-only Payload)
    const message = {
      data: {
        type: type || 'incoming_call', // 'incoming_call' বা 'audio_call'
        senderName: senderName || "Family Member",
        channelId: channelId || "family_call_room",
        isCall: "true" // স্ট্রিং হিসেবে পাঠাতে হয়
      },
      android: {
        priority: 'high', // অ্যাপকে জাগানোর জন্য মাস্ট
        ttl: 0, // সাথে সাথে ডেলিভারি করার জন্য
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return res.status(200).json({
      success: true,
      sentCount: response.successCount
    });

  } catch (error) {
    console.error('❌ Call FCM Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
