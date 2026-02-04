// Add Morocco E-Visa URL - Simple Version (No embedding generation)
const { Client } = require('pg');
const crypto = require('crypto');

// Simple ID generator (similar to what your system might use)
function generateId() {
  return 'cre_' + crypto.randomBytes(16).toString('hex').substring(0, 20);
}

const connectionString = "postgresql://neondb_owner:npg_2tsCIddr5N1VYNDZD8kuMg@ep-holy-rice-a8zgw8ng.eastus2.azure.neon.tech/neondb?sslmode=require";

async function addMoroccoEvisaSimple() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if e-visa URL already exists
    const existingEvisa = await client.query(`
      SELECT id, title, "sourceUrl"
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' 
      AND category = 'VISA_POLICY'
      AND "sourceUrl" = 'https://www.acces-maroc.ma/#/'
    `);
    
    if (existingEvisa.rows.length > 0) {
      console.log('✅ Morocco e-visa URL already exists in database!');
      console.log(`   Entry ID: ${existingEvisa.rows[0].id}`);
      console.log(`   Title: ${existingEvisa.rows[0].title}`);
      console.log(`   URL: ${existingEvisa.rows[0].sourceUrl}`);
      return;
    }
    
    console.log('📝 Morocco e-visa URL not found. Adding new entries...\n');
    
    // Get a sample existing entry for structure reference
    const sampleEntry = await client.query(`
      SELECT * FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' AND category = 'VISA_POLICY'
      LIMIT 1
    `);
    
    if (sampleEntry.rows.length === 0) {
      console.log('❌ No existing Morocco entries found to use as template');
      return;
    }
    
    // Create optimized entries for different purposes
    const evisaEntries = [
      {
        purpose: 'tourism',
        title: 'Morocco Official E-Visa for Tourism',
        description: 'Official electronic visa application portal for Morocco tourism purposes. Apply for tourist e-visas to Morocco online through the official government portal. This digital platform processes single and multiple entry electronic visas for travelers visiting Morocco for tourism, vacation, leisure, and sightseeing.',
        keywords: 'tourism tourist vacation holiday leisure sightseeing travel',
      },
      {
        purpose: 'business',
        title: 'Morocco Official E-Visa for Business',
        description: 'Official electronic visa application portal for Morocco business purposes. Apply for business e-visas to Morocco online through the official government portal. This digital platform processes single and multiple entry electronic visas for travelers visiting Morocco for business, work, meetings, and commercial activities.',
        keywords: 'business work commercial meetings conferences trade',
      }
    ];
    
    for (const entry of evisaEntries) {
      // Prepare the e-visa data
      const evisaData = {
        isoCode: 'MA',
        region: 'africa', // Morocco is in Africa
        subregion: 'northern_africa',
        category: 'VISA_POLICY',
        timelinePhase: 'BEFORE_TRAVEL',
        title: entry.title,
        description: entry.description,
        searchableText: `${entry.title} ${entry.description} Morocco ${entry.keywords} TRAVELLING TO Morocco CITIZENSHIP all PURPOSE OF TRAVEL ${entry.purpose}`,
        sourceUrl: 'https://www.acces-maroc.ma/#/',
        sourceAuthority: 'Government of Morocco',
        confidence: 0.95,
        isActive: true,
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
      
      // Generate ID and content hash
      const entryId = generateId();
      const contentHash = crypto.createHash('sha256')
        .update(evisaData.searchableText)
        .digest('hex')
        .substring(0, 16);
      
      // Insert without embedding for now
      const insertQuery = `
        INSERT INTO "CountryRequirementEmbedding" 
        (id, "isoCode", region, subregion, category, "timelinePhase", title, description, 
         "searchableText", "sourceUrl", "sourceAuthority", confidence, "isActive", 
         "structuredData", "contentHash", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        RETURNING id, title
      `;
      
      const result = await client.query(insertQuery, [
        entryId,
        evisaData.isoCode,
        evisaData.region,
        evisaData.subregion,
        evisaData.category,
        evisaData.timelinePhase,
        evisaData.title,
        evisaData.description,
        evisaData.searchableText,
        evisaData.sourceUrl,
        evisaData.sourceAuthority,
        evisaData.confidence,
        evisaData.isActive,
        JSON.stringify(evisaData.structuredData),
        contentHash
      ]);
      
      console.log(`✅ Successfully added Morocco e-visa for ${entry.purpose}!`);
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Purpose: ${entry.purpose}`);
      console.log(`   URL: ${evisaData.sourceUrl}\n`);
    }
    
    // Verify the insertions
    const verification = await client.query(`
      SELECT id, title, "sourceUrl", "structuredData"
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'MA' AND category = 'VISA_POLICY' AND "sourceUrl" = 'https://www.acces-maroc.ma/#/'
      ORDER BY id DESC
    `);
    
    console.log('✅ Morocco e-visa entries successfully added:');
    verification.rows.forEach((row, i) => {
      try {
        const structuredData = typeof row.structuredData === 'string' ? 
          JSON.parse(row.structuredData) : row.structuredData;
        console.log(`  ${i + 1}. [${row.id}] ${row.title}`);
        console.log(`     Purpose: ${structuredData.purposeOfTravel || 'N/A'}`);
        console.log(`     URL: ${row.sourceUrl}`);
        console.log();
      } catch (e) {
        console.log(`  ${i + 1}. [${row.id}] ${row.title}`);
        console.log(`     URL: ${row.sourceUrl}`);
        console.log();
      }
    });
    
    console.log('🎯 Next step: Enable Google Generative Language API and run embedding generation script to add semantic search capabilities.');
    
  } catch (error) {
    console.error('❌ Error adding Morocco e-visa:', error.message);
  } finally {
    await client.end();
  }
}

addMoroccoEvisaSimple();