# Morocco E-Visa Embedding Setup

This script adds the official Morocco e-visa URL to your Neon pgvector embeddings for better search results.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your Google API key (uses your existing key):**
   ```bash
   cp .env.example .env
   # The Google API key should already be set from your system
   ```

3. **Run the script:**
   ```bash
   npm run add-morocco
   ```

## What this adds:

- **URL**: https://www.acces-maroc.ma/#/
- **Category**: VISA
- **Phase**: BEFORE_TRAVEL  
- **Type**: Official government e-visa portal
- **Entries**: 2 optimized entries (Tourism + Business)
- **Search optimization**: Matches your 4 search fields:
  - TRAVELLING TO: Morocco
  - CITIZENSHIP: All nationalities 
  - TRAVELLING FROM: Any country
  - PURPOSE OF TRAVEL: Tourism OR Business

## Data Structure:

The script adds this data to your `CountryRequirementEmbedding` table:

- **Country**: MA (Morocco)
- **Title**: "Morocco Official E-Visa Application"
- **Description**: Detailed description of the service
- **Structured Data**: Visa types, processing time, requirements, etc.
- **Embedding**: Gemini-generated vector (1536 dims) for semantic search
- **Model**: `gemini-embedding-001` (matches your existing system)
- **Hash**: Content hash for deduplication

## Verification:

After running, the script will show you all Morocco VISA entries to confirm the addition.

## SEO Impact:

When users search on your site with these combinations, the Morocco e-visa will appear:

**Search Examples:**
- TRAVELLING TO: "Morocco" + PURPOSE: "Tourism" → Tourism e-visa entry
- TRAVELLING TO: "Morocco" + PURPOSE: "Business" → Business e-visa entry  
- Any citizenship + Morocco destination → Both entries ranked by purpose

**Keywords optimized for:**
- Morocco visa, Morocco e-visa, Morocco electronic visa
- Morocco tourism/business visa, Morocco travel requirements
- Morocco visa application, Morocco online visa

This improves user experience and SEO ranking for Morocco-related travel queries with your specific search field structure.