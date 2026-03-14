export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messageText, senderName } = req.body;

  // তোমার App ID (ঠিক আছে)
  const ONESIGNAL_APP_ID = "3c4d94fa-1175-4a9b-8602-ff9cea5e5793";

  // REST API Key (os_v2_app_... দিয়ে শুরু হওয়া — ঠিক আছে)
  const REST_API_KEY = "os_v2_app_hrgzj6qrovfjxbqc76oouxsxsnxnidsvzkoemi5fqhrsduvbnhfftjjvb2znhqaqw6blnlxfsthsr6pqymoxfid23xtltzupf22fvaa";

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {  // Note: onesignal.com/api/v1/notifications → api.onesignal.com/notifications (latest endpoint)
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Key ${REST_API_KEY.trim()}`  // ← এখানে "Key " + key (no Basic)
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"],  // সব subscribed users-এ পাঠাবে
        headings: { en: senderName || "New Message" },  // fallback দিলাম যদি senderName না থাকে
        contents: { en: messageText },
        android_accent_color: "FF2E7D32",  // optional, ঠিক আছে
        priority: 10  // high priority (optional)
      })
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
      console.error("OneSignal error:", data);
      return res.status(response.status || 400).json({ success: false, error: data.errors || data });
    }

    return res.status(200).json({ success: true, id: data.id, data });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}