const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_2tsCIddr5N1VYNDZD8kuMg@ep-holy-rice-a8zgw8ng.eastus2.azure.neon.tech/neondb?sslmode=require";

async function checkMoroccoEntries() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    const result = await client.query(`
      SELECT id, title, description, url, "structuredData"
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' AND category = 'VISA_POLICY'
      ORDER BY id DESC
    `);
    
    console.log(`Found ${result.rows.length} existing Morocco VISA_POLICY entries:\n`);
    
    result.rows.forEach((row, i) => {
      console.log(`[${i + 1}] ID: ${row.id}`);
      console.log(`    Title: ${row.title}`);
      console.log(`    URL: ${row.url || 'NONE'}`);
      console.log(`    Description: ${row.description?.substring(0, 100)}...`);
      
      if (row.structuredData) {
        const data = JSON.parse(row.structuredData);
        if (data.visaType || data.purposeOfTravel) {
          console.log(`    Purpose/Type: ${data.visaType || data.purposeOfTravel || 'N/A'}`);
        }
      }
      console.log();
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkMoroccoEntries();