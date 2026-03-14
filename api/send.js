const axios = require('axios');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messageText, senderName } = req.body;

  try {
    const response = await axios.post("https://onesignal.com/api/v1/notifications", {
      app_id: "3c4d94fa-1175-4a9b-8602-ff9cea5e5793",
      included_segments: ["All"],
      headings: { "en": `📩 ${senderName}` },
      contents: { "en": messageText },
      android_accent_color: "FF2E7D32",
      priority: 10
    }, {
      headers: { 
        "Authorization": "Basic os_v2_app_hrgzj6qrovfjxbqc76oouxsxsnfdndlxofuubav55vu3pxkaa34al7du6pjxwfl36gjnd3zqsd7dgq7moulyrl333m65t6csjjlnsiq",
        "Content-Type": "application/json"
      }
    });

    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    return res.status(500).json({ 
      error: error.response ? error.response.data : error.message 
    });
  }
}
