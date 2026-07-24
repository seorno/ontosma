import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_INTEGRATION_TOKEN });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source } = req.body;
  if (!email) return res.status(400).json({ error: "Email missing." });

  try {
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_SUBSCRIBERS_DATABASE_ID },
      properties: {
        "Email": { title: [{ text: { content: email } }] },
        "Entry Source": { select: { name: source || "Homepage Form" } },
        "Subscription Tier": { select: { name: "Free Tier" } }
      }
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
