/**
 * Add Embeddings to NIV Bible Verses
 *
 * This script fetches NIV verses that don't have embeddings yet,
 * generates embeddings using OpenAI, and updates the database.
 *
 * Strategy:
 * 1. Fetch verses without embeddings in batches
 * 2. Generate embeddings (100 verses per API call)
 * 3. Update verses with embeddings (use PATCH for updates)
 * 4. Resume capability: Only processes verses with null embeddings
 *
 * Estimated cost: ~$0.02 for 31,103 verses
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=... node add-niv-embeddings.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

// Configuration
const FETCH_BATCH_SIZE = 500;       // Verses to fetch at once
const EMBEDDING_BATCH_SIZE = 100;   // Verses per embedding API call
const UPDATE_BATCH_SIZE = 10;       // Verses per update (small due to large vectors)
const EMBEDDING_MODEL = 'text-embedding-3-small';
const RATE_LIMIT_DELAY = 100;       // ms between API calls

async function getVersesWithoutEmbeddings(offset = 0, limit = FETCH_BATCH_SIZE) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?select=id,book,chapter,verse,text&translation=eq.niv&embedding=is.null&order=id&limit=${limit}&offset=${offset}`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch verses: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function getVersesWithoutEmbeddingsCount() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?select=count&translation=eq.niv&embedding=is.null`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'count=exact'
      }
    }
  );

  const countHeader = response.headers.get('content-range');
  if (countHeader) {
    const match = countHeader.match(/\/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

async function generateEmbeddings(texts) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data.map(d => d.embedding);
}

async function updateVerseEmbedding(id, embedding) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bible_verses?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        embedding: JSON.stringify(embedding)
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update verse ${id}: ${response.status} - ${error}`);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addEmbeddings() {
  console.log('=== Add Embeddings to NIV Bible Verses ===\n');

  // Check how many verses need embeddings
  const totalWithoutEmbeddings = await getVersesWithoutEmbeddingsCount();
  console.log(`NIV verses without embeddings: ${totalWithoutEmbeddings}`);

  if (totalWithoutEmbeddings === 0) {
    console.log('All NIV verses already have embeddings. Exiting.');
    return;
  }

  // Calculate cost estimate
  const estimatedTokens = totalWithoutEmbeddings * 30; // ~30 tokens per verse average
  const estimatedCost = (estimatedTokens / 1000) * 0.00002;
  console.log(`Estimated embedding cost: $${estimatedCost.toFixed(4)}`);
  console.log(`Embedding batches: ${Math.ceil(totalWithoutEmbeddings / EMBEDDING_BATCH_SIZE)}\n`);

  let processedCount = 0;
  let offset = 0;

  while (processedCount < totalWithoutEmbeddings) {
    // Fetch a batch of verses without embeddings
    const verses = await getVersesWithoutEmbeddings(offset, FETCH_BATCH_SIZE);

    if (verses.length === 0) {
      break; // No more verses to process
    }

    console.log(`Fetched ${verses.length} verses starting at offset ${offset}`);

    // Process in embedding batches
    for (let i = 0; i < verses.length; i += EMBEDDING_BATCH_SIZE) {
      const batch = verses.slice(i, i + EMBEDDING_BATCH_SIZE);
      const texts = batch.map(v => `${v.book} ${v.chapter}:${v.verse} - ${v.text}`);

      try {
        // Generate embeddings for batch
        const embeddings = await generateEmbeddings(texts);

        // Update verses in small chunks to avoid timeouts
        for (let j = 0; j < batch.length; j += UPDATE_BATCH_SIZE) {
          const updateChunk = batch.slice(j, j + UPDATE_BATCH_SIZE);

          // Update each verse with its embedding
          await Promise.all(updateChunk.map((verse, idx) =>
            updateVerseEmbedding(verse.id, embeddings[j + idx])
          ));

          await sleep(50); // Small delay between update chunks
        }

        processedCount += batch.length;
        const progress = ((processedCount / totalWithoutEmbeddings) * 100).toFixed(1);
        process.stdout.write(`\rProgress: ${processedCount}/${totalWithoutEmbeddings} verses (${progress}%)`);

        // Rate limiting
        await sleep(RATE_LIMIT_DELAY);

      } catch (error) {
        console.error(`\nError processing batch at offset ${offset + i}: ${error.message}`);
        console.log(`Processed ${processedCount} verses before error`);
        throw error;
      }
    }

    offset += verses.length;
  }

  console.log(`\n\n✓ Embedding generation complete! Total verses processed: ${processedCount}`);

  // Verify
  const remainingWithoutEmbeddings = await getVersesWithoutEmbeddingsCount();
  console.log(`Verses still without embeddings: ${remainingWithoutEmbeddings}`);

  if (remainingWithoutEmbeddings === 0) {
    console.log('✓ All NIV verses now have embeddings!');
  }
}

// Run the script
addEmbeddings().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
