import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

export async function getNotionPosts() {
  const database = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      property: "Published",
      checkbox: { equals: true }
    },
    sorts: [{ property: "Date", direction: "descending" }]
  });
  
  return database.results.map(page => {
    const properties = page.properties;
    return {
      id: page.id,
      title: properties.Title?.title[0]?.plain_text || '',
      date: properties.Date?.date?.start || '',
      post_type: properties.Type?.select?.name || 'writing',
      visible: 'true'
    };
  });
}

export async function getNotionPostContent(pageId) {
  const mdblocks = await n2m.pageToMarkdown(pageId);
  const mdString = n2m.toMarkdownString(mdblocks);
  
  return {
    id: pageId,
    contentHtml: mdString.parent
  };
}

export async function getAllNotionPostIds() {
  const posts = await getNotionPosts();
  return posts.map(post => ({
    params: { id: post.id }
  }));
}
