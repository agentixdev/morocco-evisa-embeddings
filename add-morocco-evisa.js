// Add Morocco E-Visa Official Link to Embeddings
const { Client } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');

// Use your existing connection string
const connectionString = "postgresql://neondb_owner:npg_2tsCIddr5N1VYNDZD8kuMg@ep-holy-rice-a8zgw8ng.eastus2.azure.neon.tech/neondb?sslmode=require";

// Initialize Google Gemini for embeddings (matching your system)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function addMoroccoEvisa() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if Morocco data already exists for VISA_POLICY category
    const existingVisa = await client.query(`
      SELECT * FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' AND category = 'VISA_POLICY'
    `);
    
    console.log(`Found ${existingVisa.rows.length} existing VISA_POLICY entries for Morocco\n`);
    
    // Create entries optimized for different purposes
    const evisaEntries = [
      {
        purpose: 'tourism',
        title: 'Morocco Official E-Visa for Tourism',
        purposeText: 'tourism vacation holiday leisure sightseeing travel tourist',
      },
      {
        purpose: 'business', 
        title: 'Morocco Official E-Visa for Business',
        purposeText: 'business work commercial meetings conferences trade',
      }
    ];
    
    for (const entry of evisaEntries) {
    
      // Prepare the e-visa data optimized for your search fields
      const evisaData = {
        isoCode: 'MA',
        category: 'VISA_POLICY',
        timelinePhase: 'BEFORE_TRAVEL',
        title: entry.title,
        description: `Official electronic visa application portal for Morocco ${entry.purpose} purposes. Apply for ${entry.purpose} e-visas to Morocco online through the official government portal. This digital platform processes single and multiple entry electronic visas for travelers visiting Morocco for ${entry.purpose}.`,
        url: 'https://www.acces-maroc.ma/#/',
        isOfficial: true,
        structuredData: {
          destination: 'Morocco',
          destinationCode: 'MA',
          applicableCitizenship: 'All nationalities (eligibility varies)',
          purposeOfTravel: entry.purpose,
          visaType: ['e-visa', 'electronic visa', 'online visa'],
          processingTime: '3-7 business days',
          validity: 'Up to 90 days',
          entryType: ['single entry', 'multiple entry'],
          fees: 'Varies by nationality and visa type',
          requirements: [
            'Valid passport (minimum 6 months validity)',
            'Digital passport photo',
            'Travel itinerary',
            entry.purpose === 'business' ? 'Business invitation letter' : 'Hotel reservation',
            'Proof of financial means',
            'Return flight ticket'
          ],
          searchKeywords: [
            `Morocco ${entry.purpose} visa`,
            'Morocco e-visa',
            'Morocco electronic visa',
            `Morocco ${entry.purpose}`,
            'Morocco travel requirements',
            'Morocco visa application',
            'Morocco online visa'
          ],
          officialSource: true,
          digitalApplication: true,
          governmentPortal: true
        }
      };
    
      // Generate embedding optimized for your search fields
      const textToEmbed = `
        ${evisaData.title} ${evisaData.description}
        
        TRAVELLING TO: Morocco Kingdom of Morocco MA
        CITIZENSHIP: All nationalities worldwide global citizens  
        TRAVELLING FROM: Any country worldwide international
        PURPOSE OF TRAVEL: ${entry.purposeText}
        
        Morocco visa e-visa electronic online digital visa application official government portal
        ${entry.purpose} visa Morocco travel requirements entry requirements
        Morocco Kingdom visa requirements official source government website
        Electronic visa application Morocco online visa portal digital visa system
      `.trim();
      
      console.log(`Generating embedding for ${entry.purpose} with gemini-embedding-001...`);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-embedding-001',
        taskType: 'RETRIEVAL_DOCUMENT' // For ingestion, matches your system
      });
      
      const embedding = await model.embedContent(textToEmbed);
      const embeddingVector = embedding.embedding.values;
      console.log(`✅ Generated embedding (${embeddingVector.length} dimensions) for ${entry.purpose}\n`);
    
      // Insert the data (matching your schema)
      const insertQuery = `
        INSERT INTO "CountryRequirementEmbedding" 
        ("isoCode", category, "timelinePhase", title, description, url, "isOfficial", "structuredData", embedding, "embeddingModel", "contentHash")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, title
      `;
      
      // Generate content hash (like your system)
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
      
      console.log(`✅ Successfully added Morocco e-visa data for ${entry.purpose}!`);
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Purpose: ${entry.purpose}`);
      console.log(`   URL: ${evisaData.url}\n`);
    }
    
    // Verify the insertions
    const verification = await client.query(`
      SELECT id, title, url, category, "timelinePhase", "structuredData"
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' AND category = 'VISA_POLICY'
      ORDER BY id DESC
    `);
    
    console.log('✅ All Morocco VISA_POLICY entries after update:');
    verification.rows.forEach((row, i) => {
      const structuredData = JSON.parse(row.structuredData || '{}');
      console.log(`  ${i + 1}. [${row.id}] ${row.title}`);
      console.log(`     Purpose: ${structuredData.purposeOfTravel || 'N/A'}`);
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