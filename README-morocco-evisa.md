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
- **Features**: Tourist & business visas, single & multiple entry

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

When users search for "Morocco visa" or "Morocco e-visa" on your site, this official URL will now appear in results, improving user experience and SEO ranking for Morocco-related travel queries.