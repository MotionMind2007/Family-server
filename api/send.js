export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messageText, senderName } = req.body;
  const ONESIGNAL_APP_ID = "3c4d94fa-1175-4a9b-8602-ff9cea5e5793";
  
  // কি-টা একদম ফ্রেশ করে এখানে বসান, কোনো স্পেস যেন না থাকে
  const REST_API_KEY = "os_v2_app_hrgzj6qrovfjxbqc76oouxsxsoifqjk7ua5eqke23eihqvhueweilsq2s2pp5rcqdmrzsjwp2uftfprij74jd6wmx5lyalwhtqbv5iq";

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + REST_API_KEY.trim() // এখানে trim() দেওয়া হয়েছে যাতে ভুল কোনো স্পেস থাকলেও কেটে যায়
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { "en": senderName },
        contents: { "en": messageText },
        android_accent_color: "FF2E7D32",
        priority: 10
      })
    });

    const data = await response.json();
    
    // যদি ওয়ান সিগন্যাল কোনো এরর দেয়
    if (data.errors) {
      return res.status(401).json({ success: false, error: data.errors });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
