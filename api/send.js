export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messageText, senderName } = req.body;
  const ONESIGNAL_APP_ID = "3c4d94fa-1175-4a9b-8602-ff9cea5e5793";
  const REST_API_KEY = "os_v2_app_hrgzj6qrovfjxbqc76oouxsxsnfdndlxofuubav55vu3pxkaa34al7du6pjxwfl36gjnd3zqsd7dgq7moulyrl333m65t6csjjlnsiq";

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { "en": `📩 ${senderName}` },
        contents: { "en": messageText },
        android_accent_color: "FF2E7D32",
        priority: 10
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
