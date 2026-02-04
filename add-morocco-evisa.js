// Add Morocco E-Visa Official Link to Embeddings
const { Client } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use your existing connection string
const connectionString = "postgresql://neondb_owner:npg_2tsCIddr5N1VYNDZD8kuMg@ep-holy-rice-a8zgw8ng.eastus2.azure.neon.tech/neondb?sslmode=require";

// Initialize Google Gemini for embeddings (matching your system)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function addMoroccoEvisa() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if Morocco data already exists for VISA category
    const existingVisa = await client.query(`
      SELECT * FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' AND category = 'VISA'
    `);
    
    console.log(`Found ${existingVisa.rows.length} existing VISA entries for Morocco\n`);
    
    // Prepare the e-visa data
    const evisaData = {
      isoCode: 'MA',
      category: 'VISA',
      timelinePhase: 'BEFORE_TRAVEL',
      title: 'Morocco Official E-Visa Application',
      description: 'Official electronic visa application portal for Morocco. This is the direct government website for applying for tourist and business e-visas to Morocco. The portal allows travelers to apply for single or multiple entry electronic visas online.',
      url: 'https://www.acces-maroc.ma/#/',
      isOfficial: true,
      structuredData: {
        visaType: ['tourist', 'business'],
        processingTime: '3-7 business days',
        validity: 'Up to 90 days',
        entryType: ['single', 'multiple'],
        fee: 'Varies by nationality',
        requirements: [
          'Valid passport',
          'Digital passport photo', 
          'Travel itinerary',
          'Accommodation details',
          'Financial proof'
        ],
        officialSource: true,
        digitalApplication: true
      }
    };
    
    // Generate embedding for the content using Gemini (matching your system)
    const textToEmbed = `${evisaData.title} ${evisaData.description} Morocco visa electronic application official government portal tourist business travel`;
    
    console.log('Generating embedding with gemini-embedding-001...');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-embedding-001',
      taskType: 'RETRIEVAL_DOCUMENT' // For ingestion, matches your system
    });
    
    const embedding = await model.embedContent(textToEmbed);
    const embeddingVector = embedding.embedding.values;
    console.log(`✅ Generated embedding (${embeddingVector.length} dimensions)\n`);
    
    // Insert the data (matching your schema)
    const insertQuery = `
      INSERT INTO "CountryRequirementEmbedding" 
      ("isoCode", category, "timelinePhase", title, description, url, "isOfficial", "structuredData", embedding, "embeddingModel", "contentHash")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, title
    `;
    
    // Generate content hash (like your system)
    const crypto = require('crypto');
    const contentHash = crypto.createHash('sha256').update(textToEmbed).digest('hex').substring(0, 16);
    
    const result = await client.query(insertQuery, [
      evisaData.isoCode,
      evisaData.category,
      evisaData.timelinePhase,
      evisaData.title,
      evisaData.description,
      evisaData.url,
      evisaData.isOfficial,
      JSON.stringify(evisaData.structuredData),
      JSON.stringify(embeddingVector),
      'gemini-embedding-001', // matches your system
      contentHash
    ]);
    
    console.log(`✅ Successfully added Morocco e-visa data!`);
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Title: ${result.rows[0].title}`);
    console.log(`   URL: ${evisaData.url}\n`);
    
    // Verify the insertion
    const verification = await client.query(`
      SELECT id, title, url, category, "timelinePhase" 
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' AND category = 'VISA'
      ORDER BY id DESC
    `);
    
    console.log('Current Morocco VISA entries:');
    verification.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. [${row.id}] ${row.title}`);
      console.log(`     URL: ${row.url || 'N/A'}`);
      console.log(`     Phase: ${row.timelinePhase}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error adding Morocco e-visa:', error);
  } finally {
    await client.end();
  }
}

// Run the script
addMoroccoEvisa();