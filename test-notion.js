const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");

async function testNotion() {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  // Use the Intro page ID - get this from the URL when you click "Intro" in Notion
  const INTRO_PAGE_ID = "2a66c377-946e-80a2-be44-fae2f8488b30"; // From your earlier link
  
  const notion = new Client({ auth: NOTION_TOKEN });
  
  try {
    console.log('Fetching content for Intro page:', INTRO_PAGE_ID);
    
    // Get the content
    const n2m = new NotionToMarkdown({ notionClient: notion });
    const mdblocks = await n2m.pageToMarkdown(INTRO_PAGE_ID);
    
    console.log('\n=== MDBLOCKS LENGTH ===');
    console.log(mdblocks.length);
    
    const mdString = n2m.toMarkdownString(mdblocks);
    
    console.log('\n=== MDSTRING ===');
    console.log(mdString);
    
    // Dynamic import for remark
    const { remark } = await import('remark');
    const html = (await import('remark-html')).default;
    
    // Try using the mdString directly if it's a string
    const markdownContent = typeof mdString === 'string' ? mdString : mdString.parent;
    
    console.log('\n=== MARKDOWN CONTENT ===');
    console.log(markdownContent.substring(0, 500)); // First 500 chars
    
    // Convert to HTML
    const processedContent = await remark()
      .use(html)
      .process(markdownContent);
    const contentHtml = processedContent.toString();
    
    console.log('\n=== HTML (first 500 chars) ===');
    console.log(contentHtml.substring(0, 500));
    
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error.stack);
  }
}

testNotion();
