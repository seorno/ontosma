import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_INTEGRATION_TOKEN });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await notion.databases.query({
      database_id: process.env.NOTION_COLUMNS_DATABASE_ID,
      filter: {
        and: [
          { property: "Status", select: { equals: "Published" } },
          { property: "Publish Date", date: { on_or_before: today } }
        ]
      },
      sorts: [{ property: "Publish Date", direction: "descending" }]
    });

    const columns = await Promise.all(response.results.map(async (page) => {
      const p = page.properties;
      const blocks = await notion.blocks.children.list({ block_id: page.id });
      const paragraphs = blocks.results
        .filter(b => b.type === 'paragraph')
        .map(b => b.paragraph.rich_text[0]?.plain_text || "")
        .filter(text => text !== "");

      return {
        id: page.id,
        code: p["Column Code"]?.rich_text[0]?.plain_text || "",
        dateStr: p["Publish Date"]?.date ? new Date(p["Publish Date"].date.start).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "",
        title: p["Essay Title"]?.title[0]?.plain_text || "",
        topic: p["Topic"]?.select?.name || "",
        topicIcon: p["Topic Icon"]?.rich_text[0]?.plain_text || "🧬",
        readTime: p["Read Time"]?.rich_text[0]?.plain_text || "",
        author: p["Author"]?.rich_text[0]?.plain_text || "",
        summary: p["Summary Abstract"]?.rich_text[0]?.plain_text || "",
        paragraphs: paragraphs,
        citation: p["Citation"]?.rich_text[0]?.plain_text || "",
        doi: p["DOI String"]?.rich_text[0]?.plain_text || ""
      };
    }));

    return res.status(200).json(columns);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
