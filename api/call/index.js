const admin = require('firebase-admin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }

    const { tokens, senderName } = req.body;

    // আপনার index.js এর মতো একদম সিম্পল স্ট্রাকচার
    const message = {
      notification: {
        title: "📞 ইনকামিং কল",
        body: `${senderName || "পরিবারের সদস্য"} কল দিচ্ছেন...`,
      },
      data: {
        type: "incoming_call", // এটি আপনার App.js এর লজিক ট্রিগার করবে
        senderName: senderName || "Unknown",
        isCall: "true"
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'TOP_LEVEL_SCENE', // অ্যাপ ওপেন করার জন্য
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
    return res.status(500).json({ success: false, error: error.message });
  }
};
