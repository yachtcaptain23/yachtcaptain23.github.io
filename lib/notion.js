import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

export async function getNotionPosts() {
  console.log('=== NOTION DEBUG ===');
  console.log('NOTION_TOKEN exists:', !!process.env.NOTION_TOKEN);
  console.log('NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID);
  
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.error('Missing Notion credentials');
    return [];
  }

  try {
    // Initialize client inside the function
    const notion = new Client({ 
      auth: process.env.NOTION_TOKEN 
    });
    
    const database = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: "checkbox",
        checkbox: { equals: true }
      },
      sorts: [{ 
        property: "date", 
        direction: "descending" 
      }]
    });
    
    console.log('Number of results:', database.results.length);
    
    return database.results.map(page => {
      const properties = page.properties;
      return {
        id: page.id,
        title: properties.Name?.title[0]?.plain_text || '',
        date: properties.date?.date?.start || '',
        post_type: properties.post_type?.select?.name || 'writing',
        visible: 'true'
      };
    });
  } catch (error) {
    console.error('Notion API error:', error);
    return [];
  }
}

export async function getNotionPostContent(pageId) {
  try {
    const notion = new Client({ 
      auth: process.env.NOTION_TOKEN 
    });
    const n2m = new NotionToMarkdown({ notionClient: notion });
    
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    
    return {
      id: pageId,
      contentHtml: mdString.parent
    };
  } catch (error) {
    console.error('Error fetching post content:', error);
    return {
      id: pageId,
      contentHtml: ''
    };
  }
}

export async function getAllNotionPostIds() {
  const posts = await getNotionPosts();
  return posts.map(post => ({
    params: { id: post.id }
  }));
}
