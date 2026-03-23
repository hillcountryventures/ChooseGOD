/**
 * Museum Art Service
 * 
 * Fetches public domain biblical art from museum APIs.
 * All art includes full attribution (artist, year, location, etc.)
 * 
 * Sources:
 * - The Metropolitan Museum of Art (met)
 * - Rijksmuseum (rijksmuseum)
 * - Art Institute of Chicago (chicago)
 */

import type { ArtPiece, ArtSource, ArtAttribution, TopicArtMapping } from '../types/verseImage';

// API endpoints
const MET_API = 'https://collectionapi.metmuseum.org/public/collection/v1';
const RIJKS_API = 'https://www.rijksmuseum.nl/api/en/collection';
const CHICAGO_API = 'https://api.artic.edu/api/v1/artworks';

// Rijksmuseum API key (free tier, 10k requests/day)
const RIJKS_API_KEY = 'dHJ5UnJU'; // Public demo key - replace with real one

// Topic to search keyword mapping for biblical art
export const TOPIC_ART_KEYWORDS: TopicArtMapping = {
  // Emotions & Struggles
  'anxiety': ['prayer', 'contemplation', 'meditation', 'peace'],
  'fear': ['angel', 'divine light', 'courage', 'faith'],
  'depression': ['hope', 'sunrise', 'resurrection', 'comfort'],
  'grief': ['pieta', 'mourning', 'comfort', 'mary magdalene'],
  'anger': ['forgiveness', 'reconciliation', 'peace'],
  'loneliness': ['shepherd', 'good shepherd', 'comfort'],
  
  // Virtues
  'love': ['charity', 'love', 'madonna', 'holy family'],
  'faith': ['faith', 'abraham', 'trust', 'belief'],
  'hope': ['hope', 'resurrection', 'ascension', 'angel'],
  'peace': ['peace', 'rest', 'tranquility', 'pastoral'],
  'joy': ['nativity', 'annunciation', 'celebration', 'praise'],
  'patience': ['job', 'waiting', 'prayer', 'contemplation'],
  'forgiveness': ['prodigal son', 'mercy', 'reconciliation'],
  
  // Biblical Themes
  'prayer': ['prayer', 'kneeling', 'devotion', 'monastery'],
  'salvation': ['cross', 'crucifixion', 'resurrection', 'christ'],
  'grace': ['annunciation', 'blessing', 'divine', 'light'],
  'wisdom': ['solomon', 'wisdom', 'sage', 'teaching'],
  'strength': ['david', 'samson', 'moses', 'strength'],
  'guidance': ['shepherd', 'moses', 'pillar', 'light'],
  
  // Default fallback
  'default': ['bible', 'christ', 'madonna', 'saint', 'angel'],
};

/**
 * Detect topic from verse text using keyword matching
 */
export function detectTopicFromVerse(verseText: string): string {
  const text = verseText.toLowerCase();
  
  const topicKeywords: Record<string, string[]> = {
    'anxiety': ['anxious', 'worry', 'fear not', 'peace', 'troubled', 'afraid'],
    'fear': ['fear', 'afraid', 'terror', 'dread', 'scared'],
    'love': ['love', 'loved', 'charity', 'beloved'],
    'faith': ['faith', 'believe', 'trust', 'faithful'],
    'hope': ['hope', 'wait', 'promise', 'future'],
    'peace': ['peace', 'rest', 'still', 'calm', 'quiet'],
    'forgiveness': ['forgive', 'forgiveness', 'mercy', 'pardon', 'sin'],
    'prayer': ['pray', 'prayer', 'ask', 'seek', 'knock'],
    'strength': ['strength', 'strong', 'power', 'mighty'],
    'joy': ['joy', 'rejoice', 'glad', 'happy', 'blessed'],
    'grief': ['mourn', 'weep', 'sorrow', 'grief', 'comfort'],
    'wisdom': ['wisdom', 'wise', 'understanding', 'knowledge'],
    'guidance': ['guide', 'lead', 'path', 'way', 'shepherd'],
    'salvation': ['save', 'salvation', 'redeem', 'rescue'],
    'grace': ['grace', 'gift', 'favor', 'blessing'],
  };
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return topic;
    }
  }
  
  return 'default';
}

/**
 * Format attribution string from art piece
 */
export function formatAttribution(art: ArtPiece): ArtAttribution {
  // Primary line: "Title" by Artist (Year)
  let primary = `"${art.title}"`;
  if (art.artistDisplayName && art.artistDisplayName !== 'Unknown') {
    primary += ` by ${art.artistDisplayName}`;
  }
  if (art.year) {
    primary += ` (${art.year})`;
  }
  
  // Location line
  const location = art.currentLocation;
  
  // Full multi-line attribution
  const lines = [primary];
  if (art.medium) {
    lines.push(art.medium);
  }
  if (art.locationPainted) {
    lines.push(`Painted in ${art.locationPainted}`);
  }
  lines.push(art.currentLocation);
  if (art.galleryNumber) {
    lines.push(art.galleryNumber);
  }
  if (art.creditLine) {
    lines.push(art.creditLine);
  }
  
  return {
    primary,
    location,
    full: lines.join('\n'),
  };
}

/**
 * Fetch art from The Metropolitan Museum of Art
 */
async function fetchFromMet(keywords: string[]): Promise<ArtPiece | null> {
  for (const keyword of keywords) {
    try {
      // Search for paintings with images
      const searchUrl = `${MET_API}/search?q=${encodeURIComponent(keyword)}&hasImages=true&medium=Paintings&isHighlight=true`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      if (!searchData.objectIDs?.length) continue;
      
      // Shuffle and try candidates
      const candidates = searchData.objectIDs
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      
      for (const objectId of candidates) {
        const objRes = await fetch(`${MET_API}/objects/${objectId}`);
        const obj = await objRes.json();
        
        // Must be public domain with image
        if (!obj.primaryImage || !obj.isPublicDomain) continue;
        
        return {
          id: `met-${obj.objectID}`,
          source: 'met',
          imageUrl: obj.primaryImage,
          
          title: obj.title || 'Untitled',
          artist: obj.artistDisplayName || 'Unknown Artist',
          artistDisplayName: obj.artistDisplayName || 'Unknown Artist',
          
          year: obj.objectDate || undefined,
          medium: obj.medium || undefined,
          dimensions: obj.dimensions || undefined,
          
          locationPainted: obj.city && obj.country 
            ? `${obj.city}, ${obj.country}`
            : obj.country || undefined,
          currentLocation: 'The Metropolitan Museum of Art, New York',
          galleryNumber: obj.GalleryNumber ? `Gallery ${obj.GalleryNumber}` : undefined,
          
          objectUrl: obj.objectURL,
          isPublicDomain: true,
          creditLine: obj.creditLine || undefined,
        };
      }
    } catch (err) {
      console.warn(`Met API error for "${keyword}":`, err);
    }
  }
  
  return null;
}

/**
 * Fetch art from Rijksmuseum (Dutch Masters)
 */
async function fetchFromRijksmuseum(keywords: string[]): Promise<ArtPiece | null> {
  for (const keyword of keywords) {
    try {
      const searchUrl = `${RIJKS_API}?key=${RIJKS_API_KEY}&q=${encodeURIComponent(keyword)}&type=painting&imgonly=true&ps=10`;
      const res = await fetch(searchUrl);
      const data = await res.json();
      
      if (!data.artObjects?.length) continue;
      
      // Filter for those with images and shuffle
      const candidates = data.artObjects
        .filter((obj: any) => obj.webImage?.url)
        .sort(() => Math.random() - 0.5);
      
      for (const obj of candidates.slice(0, 3)) {
        // Get full object details
        const detailRes = await fetch(`${RIJKS_API}/${obj.objectNumber}?key=${RIJKS_API_KEY}`);
        const detail = await detailRes.json();
        const artObj = detail.artObject;
        
        if (!artObj) continue;
        
        // Extract dating
        const dating = artObj.dating;
        const year = dating?.presentingDate || dating?.yearEarly?.toString() || undefined;
        
        // Extract production place
        const productionPlace = artObj.productionPlaces?.[0];
        
        return {
          id: `rijks-${obj.objectNumber}`,
          source: 'rijksmuseum',
          imageUrl: obj.webImage.url,
          
          title: artObj.title || obj.title || 'Untitled',
          artist: artObj.principalMaker || 'Unknown Artist',
          artistDisplayName: artObj.principalMaker || 'Unknown Artist',
          
          year,
          medium: artObj.physicalMedium || undefined,
          dimensions: artObj.subTitle || undefined, // Often contains dimensions
          
          locationPainted: productionPlace || undefined,
          currentLocation: 'Rijksmuseum, Amsterdam',
          
          objectUrl: artObj.links?.web,
          isPublicDomain: true,
          creditLine: artObj.acquisition?.creditLine || undefined,
        };
      }
    } catch (err) {
      console.warn(`Rijksmuseum API error for "${keyword}":`, err);
    }
  }
  
  return null;
}

/**
 * Fetch art from Art Institute of Chicago
 */
async function fetchFromChicago(keywords: string[]): Promise<ArtPiece | null> {
  for (const keyword of keywords) {
    try {
      const searchUrl = `${CHICAGO_API}/search?q=${encodeURIComponent(keyword)}&query[term][is_public_domain]=true&query[term][artwork_type_title]=Painting&limit=10&fields=id,title,artist_display,date_display,medium_display,dimensions,place_of_origin,gallery_title,credit_line,image_id,api_link`;
      const res = await fetch(searchUrl);
      const data = await res.json();
      
      if (!data.data?.length) continue;
      
      // Shuffle candidates
      const candidates = data.data
        .filter((obj: any) => obj.image_id)
        .sort(() => Math.random() - 0.5);
      
      for (const obj of candidates.slice(0, 3)) {
        // Construct image URL
        const imageUrl = `https://www.artic.edu/iiif/2/${obj.image_id}/full/843,/0/default.jpg`;
        
        // Parse artist from display string (e.g., "Rembrandt van Rijn\nDutch, 1606-1669")
        const artistParts = obj.artist_display?.split('\n') || ['Unknown Artist'];
        const artistName = artistParts[0] || 'Unknown Artist';
        
        return {
          id: `chicago-${obj.id}`,
          source: 'chicago',
          imageUrl,
          
          title: obj.title || 'Untitled',
          artist: artistName,
          artistDisplayName: artistName,
          
          year: obj.date_display || undefined,
          medium: obj.medium_display || undefined,
          dimensions: obj.dimensions || undefined,
          
          locationPainted: obj.place_of_origin || undefined,
          currentLocation: 'Art Institute of Chicago',
          galleryNumber: obj.gallery_title || undefined,
          
          objectUrl: `https://www.artic.edu/artworks/${obj.id}`,
          isPublicDomain: true,
          creditLine: obj.credit_line || undefined,
        };
      }
    } catch (err) {
      console.warn(`Chicago API error for "${keyword}":`, err);
    }
  }
  
  return null;
}

/**
 * Main function: Fetch biblical art for a verse
 * Tries multiple museum sources for best results
 */
export async function fetchArtForVerse(verseText: string, preferredSource?: ArtSource): Promise<ArtPiece> {
  const topic = detectTopicFromVerse(verseText);
  const keywords = TOPIC_ART_KEYWORDS[topic] || TOPIC_ART_KEYWORDS['default'];
  
  console.log(`Fetching art for topic "${topic}" with keywords:`, keywords);
  
  // Try sources in order of preference
  const sources: Array<() => Promise<ArtPiece | null>> = [];
  
  if (preferredSource === 'met' || !preferredSource) {
    sources.push(() => fetchFromMet(keywords));
  }
  if (preferredSource === 'rijksmuseum' || !preferredSource) {
    sources.push(() => fetchFromRijksmuseum(keywords));
  }
  if (preferredSource === 'chicago' || !preferredSource) {
    sources.push(() => fetchFromChicago(keywords));
  }
  
  // Try each source
  for (const fetchFn of sources) {
    const art = await fetchFn();
    if (art) return art;
  }
  
  // Fallback: search for generic biblical art
  const fallbackKeywords = ['christ', 'madonna', 'saint', 'angel', 'bible'];
  
  const fallbackArt = await fetchFromMet(fallbackKeywords) 
    || await fetchFromRijksmuseum(fallbackKeywords)
    || await fetchFromChicago(fallbackKeywords);
  
  if (fallbackArt) return fallbackArt;
  
  // Last resort: hardcoded well-known piece
  throw new Error('Unable to fetch art from any museum API');
}

/**
 * Fetch multiple art pieces for selection
 */
export async function fetchArtOptions(verseText: string, count: number = 3): Promise<ArtPiece[]> {
  const topic = detectTopicFromVerse(verseText);
  const keywords = TOPIC_ART_KEYWORDS[topic] || TOPIC_ART_KEYWORDS['default'];
  
  const results: ArtPiece[] = [];
  
  // Try to get one from each source
  const [metArt, rijksArt, chicagoArt] = await Promise.all([
    fetchFromMet(keywords).catch(() => null),
    fetchFromRijksmuseum(keywords).catch(() => null),
    fetchFromChicago(keywords).catch(() => null),
  ]);
  
  if (metArt) results.push(metArt);
  if (rijksArt) results.push(rijksArt);
  if (chicagoArt) results.push(chicagoArt);
  
  return results.slice(0, count);
}
