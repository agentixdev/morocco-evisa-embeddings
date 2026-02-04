const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_2tsCIddr5N1VYNDZD8kuMg@ep-holy-rice-a8zgw8ng.eastus2.azure.neon.tech/neondb?sslmode=require";

async function checkSchema() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check table structure
    const schema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'CountryRequirementEmbedding'
      ORDER BY ordinal_position
    `);
    
    console.log('CountryRequirementEmbedding table schema:');
    console.log('Column Name                 | Data Type        | Nullable');
    console.log('---------------------------|------------------|----------');
    schema.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(27)} | ${row.data_type.padEnd(16)} | ${row.is_nullable}`);
    });
    
    console.log('\n---\n');
    
    // Get sample Morocco data
    const sample = await client.query(`
      SELECT id, title, description, "structuredData"
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' AND category = 'VISA_POLICY'
      LIMIT 3
    `);
    
    console.log('Sample Morocco entries:');
    sample.rows.forEach((row, i) => {
      console.log(`\n[${i + 1}] ID: ${row.id}`);
      console.log(`    Title: ${row.title}`);
      console.log(`    Description: ${row.description?.substring(0, 150)}...`);
      
      if (row.structuredData) {
        const data = JSON.parse(row.structuredData);
        console.log(`    Structured keys: ${Object.keys(data).join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();