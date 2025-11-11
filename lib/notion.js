const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");

export async function getNotionPosts() {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.error('Missing Notion credentials');
    return [];
  }

  try {
    const notion = new Client({ 
      auth: process.env.NOTION_TOKEN 
    });
    
    const response = await notion.databases.query({
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
    
    console.log('Number of results:', response.results.length);
    
    return response.results.map(page => {
      const properties = page.properties;
      
      return {
        id: page.id,
        title: properties.Title?.title[0]?.plain_text || 'Untitled',
        date: properties.date?.date?.start || '',
        post_type: properties.post_type?.rich_text[0]?.plain_text || 'writing',
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
    
    // Dynamic import for remark (ES module)
    const { remark } = await import('remark');
    const html = (await import('remark-html')).default;
    
    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(mdString.parent);
    const contentHtml = processedContent.toString();
    
    return {
      id: pageId,
      contentHtml: contentHtml
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
