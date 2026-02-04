// Add India E-Visa URL - Official Government Portal
const { Client } = require('pg');
const crypto = require('crypto');

const connectionString = "postgresql://neondb_owner:npg_2tsCIddr5N1VYNDZD8kuMg@ep-holy-rice-a8zgw8ng.eastus2.azure.neon.tech/neondb?sslmode=require";

// Simple ID generator (similar to what your system might use)
function generateId() {
  return 'cre_' + crypto.randomBytes(16).toString('hex').substring(0, 20);
}

async function addIndiaEvisa() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if India e-visa URL already exists
    const existingEvisa = await client.query(`
      SELECT id, title, "sourceUrl"
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'IN' 
      AND category = 'VISA_POLICY'
      AND "sourceUrl" = 'https://indianvisaonline.gov.in/evisa/Registration'
    `);
    
    if (existingEvisa.rows.length > 0) {
      console.log('✅ India e-visa URL already exists in database!');
      console.log(`   Entry ID: ${existingEvisa.rows[0].id}`);
      console.log(`   Title: ${existingEvisa.rows[0].title}`);
      console.log(`   URL: ${existingEvisa.rows[0].sourceUrl}`);
      return;
    }
    
    console.log('📝 India e-visa URL not found. Adding new entries...\n');
    
    // Check existing India entries
    const existingIndia = await client.query(`
      SELECT COUNT(*) as count
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'IN' AND category = 'VISA_POLICY'
    `);
    
    console.log(`Found ${existingIndia.rows[0].count} existing VISA_POLICY entries for India\n`);
    
    // Create optimized entries for different purposes
    const evisaEntries = [
      {
        purpose: 'tourism',
        title: 'India Official E-Visa for Tourism',
        description: 'Official electronic visa application portal for India tourism purposes. Apply for tourist e-visas to India online through the official government portal. This digital platform processes electronic visas for travelers visiting India for tourism, vacation, leisure, and sightseeing purposes.',
        keywords: 'tourism tourist vacation holiday leisure sightseeing travel pilgrimage',
      },
      {
        purpose: 'business',
        title: 'India Official E-Visa for Business',
        description: 'Official electronic visa application portal for India business purposes. Apply for business e-visas to India online through the official government portal. This digital platform processes electronic visas for travelers visiting India for business, work, meetings, and commercial activities.',
        keywords: 'business work commercial meetings conferences trade investment',
      },
      {
        purpose: 'medical',
        title: 'India Official E-Visa for Medical Treatment',
        description: 'Official electronic visa application portal for India medical purposes. Apply for medical e-visas to India online through the official government portal. This digital platform processes electronic visas for travelers visiting India for medical treatment, healthcare, and wellness purposes.',
        keywords: 'medical treatment healthcare wellness surgery therapy hospital',
      }
    ];
    
    for (const entry of evisaEntries) {
      // Prepare the e-visa data
      const evisaData = {
        isoCode: 'IN',
        region: 'asia', // India is in Asia
        subregion: 'southern_asia',
        category: 'VISA_POLICY',
        timelinePhase: 'BEFORE_TRAVEL',
        title: entry.title,
        description: entry.description,
        searchableText: `${entry.title} ${entry.description} India ${entry.keywords} TRAVELLING TO India CITIZENSHIP all PURPOSE OF TRAVEL ${entry.purpose}`,
        sourceUrl: 'https://indianvisaonline.gov.in/evisa/Registration',
        sourceAuthority: 'Government of India - Ministry of Home Affairs',
        confidence: 0.95,
        isActive: true,
        structuredData: {
          destination: 'India',
          destinationCode: 'IN',
          applicableCitizenship: 'All nationalities (eligibility varies by country)',
          purposeOfTravel: entry.purpose,
          visaType: ['e-visa', 'electronic visa', 'online visa', 'e-tourist visa', 'e-business visa', 'e-medical visa'],
          processingTime: '3-5 business days',
          validity: entry.purpose === 'tourism' ? 'Up to 90 days' : entry.purpose === 'business' ? 'Up to 180 days' : 'Up to 60 days',
          entryType: entry.purpose === 'tourism' ? ['double entry'] : ['multiple entry'],
          fees: 'Varies by nationality (USD 10-100+)',
          requirements: [
            'Valid passport (minimum 6 months validity with 2 blank pages)',
            'Digital passport photo (JPEG format)',
            'Scanned passport bio page',
            entry.purpose === 'business' ? 'Business card or company letter' : 
            entry.purpose === 'medical' ? 'Medical documents from Indian hospital' :
            'Return flight ticket',
            'Proof of financial means',
            entry.purpose === 'tourism' ? 'Hotel booking or invitation letter' : 'Supporting documents'
          ],
          searchKeywords: [
            `India ${entry.purpose} visa`,
            'India e-visa',
            'India electronic visa',
            `India e-${entry.purpose} visa`,
            'India travel requirements',
            'India visa application',
            'India online visa',
            'Indian visa online'
          ],
          eligibleCountries: 'Most countries (check official list)',
          arrivalPorts: 'Designated airports and seaports only',
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
      
      console.log(`✅ Successfully added India e-visa for ${entry.purpose}!`);
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Purpose: ${entry.purpose}`);
      console.log(`   URL: ${evisaData.sourceUrl}\n`);
    }
    
    // Verify the insertions
    const verification = await client.query(`
      SELECT id, title, "sourceUrl", "structuredData"
      FROM "CountryRequirementEmbedding" 
      WHERE "isoCode" = 'IN' AND category = 'VISA_POLICY' AND "sourceUrl" = 'https://indianvisaonline.gov.in/evisa/Registration'
      ORDER BY id DESC
    `);
    
    console.log('✅ India e-visa entries successfully added:');
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
    
    console.log('🎯 India e-visa portal now available in search results for Tourism, Business, and Medical travel purposes!');
    
  } catch (error) {
    console.error('❌ Error adding India e-visa:', error.message);
  } finally {
    await client.end();
  }
}

addIndiaEvisa();