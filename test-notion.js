const { Client } = require("@notionhq/client");

async function testNotion() {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DATABASE_ID = "2a66c377946e8016ba7af9859f5fd1a8";
  
  console.log('Token exists:', !!NOTION_TOKEN);
  console.log('Database ID:', NOTION_DATABASE_ID);
  
  const notion = new Client({ auth: NOTION_TOKEN });
  
  console.log('Client created');
  console.log('databases object:', typeof notion.databases);
  console.log('databases.query:', typeof notion.databases.query);
  
  try {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
    });
    
    console.log('SUCCESS! Got', response.results.length, 'results');
    
    // Log the first result's properties
    if (response.results.length > 0) {
      const firstPage = response.results[0];
      console.log('\n=== PROPERTY NAMES ===');
      console.log(Object.keys(firstPage.properties));
      
      console.log('\n=== FULL PROPERTIES ===');
      console.log(JSON.stringify(firstPage.properties, null, 2));
    }
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

testNotion();
