// Web3Forms Registration and Contact Support Service
// Allows recording user signups, support questions, and feedback directly to email via Web3Forms.

const DEFAULT_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE";

export const recordRegistrationOnWeb3Forms = async ({
  name,
  email,
  role,
  method = "email", // 'email' | 'google'
  metadata = {}
}) => {
  const timestamp = new Date().toLocaleString();
  const payload = {
    access_key: DEFAULT_ACCESS_KEY,
    subject: `🎯 New AdaptIQ ${role ? role.toUpperCase() : 'USER'} Registration: ${name}`,
    from_name: "AdaptIQ Registration Engine",
    name: name || "Anonymous User",
    email: email || "no-email@adaptiq.edu",
    role: role || "student",
    registration_method: method,
    registered_at: timestamp,
    details: JSON.stringify(metadata, null, 2),
    message: `
New registration event captured on AdaptIQ Platform!
- Name: ${name}
- Email: ${email}
- Role: ${role ? role.toUpperCase() : 'STUDENT'}
- Method: ${method === 'google' ? 'Google OAuth 2.0' : 'Email & Password'}
- Timestamp: ${timestamp}
- Details: ${JSON.stringify(metadata)}
    `
  };

  // Persist locally for immediate inspection
  try {
    const existing = JSON.parse(localStorage.getItem('adaptiq_web3forms_records') || '[]');
    existing.unshift({
      id: `reg_${Date.now()}`,
      name,
      email,
      role,
      method,
      timestamp,
      metadata
    });
    localStorage.setItem('adaptiq_web3forms_records', JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn("Could not save to local registration store:", err);
  }

  // Attempt Web3Forms submission
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Web3Forms registration dispatch result:", data);
    return { success: true, data };
  } catch (error) {
    console.warn("Web3Forms remote endpoint warning (local fallback preserved):", error);
    return { success: true, localOnly: true, error };
  }
};

export const submitContactFeedback = async ({ name, email, message, category = 'General Feedback' }) => {
  const payload = {
    access_key: DEFAULT_ACCESS_KEY,
    subject: `📬 AdaptIQ Support / Feedback [${category}]: ${name || 'User'}`,
    from_name: "AdaptIQ Support Engine",
    name: name || "AdaptIQ User",
    email: email || "support-request@adaptiq.edu",
    category,
    message: `
Category: ${category}
User: ${name || 'User'} (${email || 'No email provided'})
Timestamp: ${new Date().toLocaleString()}

Message Content:
${message}
    `
  };

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.warn("Web3Forms dispatch warning:", error);
    return { success: false, error };
  }
};
