const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_2tsCIddr5N1VYNDZD8kuMg@ep-holy-rice-a8zgw8ng.eastus2.azure.neon.tech/neondb?sslmode=require";

async function verifyMoroccoEntries() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    const result = await client.query(`
      SELECT id, title, "sourceUrl", "structuredData", "createdAt"
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' 
      AND category = 'VISA_POLICY'
      AND "sourceUrl" = 'https://www.acces-maroc.ma/#/'
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`🇲🇦 Morocco e-visa entries added (${result.rows.length} entries):\n`);
    
    result.rows.forEach((row, i) => {
      try {
        const structuredData = typeof row.structuredData === 'string' ? 
          JSON.parse(row.structuredData) : row.structuredData;
        
        console.log(`${i + 1}. ${row.title}`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Purpose: ${structuredData.purposeOfTravel}`);
        console.log(`   URL: ${row.sourceUrl}`);
        console.log(`   Added: ${new Date(row.createdAt).toLocaleString()}`);
        console.log(`   Keywords: ${structuredData.searchKeywords?.slice(0, 3).join(', ')}...`);
        console.log();
      } catch (e) {
        console.log(`${i + 1}. ${row.title}`);
        console.log(`   ID: ${row.id}`);
        console.log(`   URL: ${row.sourceUrl}\n`);
      }
    });
    
    // Show total Morocco entries
    const totalMorocco = await client.query(`
      SELECT COUNT(*) as count
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' AND category = 'VISA_POLICY'
    `);
    
    console.log(`📊 Total Morocco VISA_POLICY entries: ${totalMorocco.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyMoroccoEntries();