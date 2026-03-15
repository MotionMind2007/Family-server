const admin = require('firebase-admin');

// সরাসরি আপনার দেওয়া service.json এর ডাটা
const serviceAccount = {
  "type": "service_account",
  "project_id": "myfamily-b5ab5",
  "private_key_id": "b097e535c2306ba024d64bba8126cf63554ef373",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQChVHkhqGONGl0V\nso7oxqcmgQX3080kuNMeUqSMEcc2czNoppJBXNcbu0/WCmc5MFaErOA4TbI5i1Y4\nGDfZnRYesJJhqanOVqSsgUn9X/JvAnOVY4voBrWtr58w78udCMVXqndFek+rylIM\nTC05xEuT2EewOpfdjhiIeP+Q8YUs5r/Yxg6bo4IvR4zgOEJVfTOrZvBrE30+PgVQ\nb9y6qRIbcYn65S2hCnTzOGUyGsQ0QSlFhn1/GV3aI5/ZShu98jHk/sh15czLh0Hh\nVosGGEGAVAEu3cR4GZIowV2jRY77Xd2kdf3xBCuKS+r2WFBOUYnmQxjhdXp0FRd0\nvB0mTDiPAgMBAAECggEAPJDFbtzUDsd8daZUn0/gtYRPlMP3aldWrrYQ3yLXenoS\nLTIHizFK8jbGWJEMQnyCpoluHcURaSgFpMZ2xSQDh177fV2gCX4ekUJyYARSs9kk\nQkueXOuT7hIV/d2wP5Jo36n33+X0ngY0+jfo7JxkUSsrcp30oHD1hdqC+0uolvur\nA94lTo1MBPvVJQ5YMovsWF07AippHXde8jM/+jWav4ts1ofSfBM89EdyIKvQ0Avl\rsM679upNeSEV+JFshqAmd83+dtGbwFi42xWe3+uf6UfFTBmhgzPY8Absuot2kaM\n1kg4sZcX6tBDC2HGg3cfAkw3Iu0iC4ZPb91DQy0JFQKBgQDUMsHuOLkpQwcZQBTB\nf2raRk1tC5sSO2eNyOy//puzqN28PcRrxP2t/zmpIt026XtGZCfhM1GP11fJ9ovj\n2CgL9Xu8sg69FGsUb4dUwAiS0bSXiPTcBaXQiZ0tFzvEs1uUhYb9vQkqkSjBR4qX\n6n9+1mri0JUMMBsEGJEpSu7XfQKBgQDCoaub8akuERz0Hktku77m68q6SASvajzi\nbLOaXtaE8HybXQKHz55pKCa6L3cjgXGqZR/EbrbereDjOdpKT4NVrNagOnG/9op8\ny5Y5hDwZ9wUFRIDbBRjb0iRAqgbbvct4hc1gkOD1v0SYfANqnsogELYICFoneSs5\nYiS1TseF+wKBgQCcxDbzqKJasnMvG2F6JokpYuDWm8lfqdVyMSt/GDmtfCb8Z+GS\nAMGtZy4RH3mwlMOHGH1B6ajrDJuF0Ig+trW3SA+3MxCibdBCE7c2THzJAvZZMUw8\ntEtxCgm9gzmbsyoISrGVCbAY647hY9onK44vhXcHxDMpAu0ilIfBquNS/QKBgD+4\nTkavx4Oddq01fdls3gMcDzMNgPss/OHkVKilg/XiBemXecyc3G/xBTzPbWHibyQq\nF0xoMtaUdpvtxNmvToAuJdYvTC5cuNpCjNwnvsWBadNfqhAKiyjsk5HYGIa4jHTY\n2XRT+lJ6XCrP7w5pDiORVQcsNNfXg5810m7Ja+khAoGBALTHrJhPz/mowpyb/+5C\n3W/ABsPVjFRM+DddwCl5pC7jzpH5YeRJXGGvGQ7+U5MXR24XuFc4SctYkmlq/QGR\n32+VzpPc+P2LU2NCMRdWgTaM++bjfbJ41fm6+jbimXmNZbaXJFutsda333Wgi+TR\nzWhtuskjuDg5WOCwmiGjm2O5\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@myfamily-b5ab5.iam.gserviceaccount.com",
  "client_id": "114011645362038272709",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40myfamily-b5ab5.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// ফায়ারবেস ইনিশিয়ালাইজেশন
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = async (req, res) => {
  // ১. শুধুমাত্র POST রিকোয়েস্ট এক্সেপ্ট করব
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { tokens, messageText, senderName } = req.body;

    // ২. ডাটা চেক করা
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'No tokens provided' });
    }

    // ৩. নোটিফিকেশন মেসেজ অবজেক্ট
    const message = {
      notification: {
        title: senderName || "নতুন মেসেজ",
        body: messageText || "ফ্যামিলি অ্যাপ থেকে আপনাকে একটি মেসেজ পাঠানো হয়েছে।",
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

    // ৪. নোটিফিকেশন পাঠানো (Multicast)
    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`✅ Success: ${response.successCount} messages sent.`);
    
    return res.status(200).json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('❌ FCM Server Error:', error.message);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
};