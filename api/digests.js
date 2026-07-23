import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_INTEGRATION_TOKEN });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DIGEST_DATABASE_ID,
      filter: {
        and: [
          { property: "Status", select: { equals: "Published" } },
          { property: "Publish Date", date: { on_or_before: today } }
        ]
      },
      sorts: [{ property: "Publish Date", direction: "descending" }]
    });

    const digests = response.results.map(page => {
      const p = page.properties;
      return {
        id: page.id,
        issueNum: p["Issue Number"]?.number || 1,
        weekNum: p["Week Number"]?.number || 1,
        year: p["Year Code"]?.number || 26,
        fullCode: `Issue ${p["Issue Number"]?.number}, Week ${p["Week Number"]?.number}, ${p["Year Code"]?.number}`,
        dateStr: p["Publish Date"]?.date ? new Date(p["Publish Date"].date.start).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "",
        title: p["Issue Title"]?.title[0]?.plain_text || "",
        summary: p["Issue Summary"]?.rich_text[0]?.plain_text || "",
        articles: JSON.parse(p["Articles Data Payload"]?.rich_text[0]?.plain_text || "[]")
      };
    });

    return res.status(200).json(digests);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
