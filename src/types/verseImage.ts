/**
 * Verse Image Sharing Types
 * 
 * Types for generating shareable verse images with classical biblical art.
 * Art sourced from public domain museum APIs (Met, Rijksmuseum, etc.)
 */

// Image format options for different platforms
export type ImageFormat = 'story' | 'square' | 'twitter';

export const IMAGE_DIMENSIONS: Record<ImageFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 },   // 9:16 Instagram/TikTok Stories
  square: { width: 1080, height: 1080 },  // 1:1 Instagram Feed
  twitter: { width: 1200, height: 675 },  // 16:9 Twitter/X
};

// Art source museums
export type ArtSource = 'met' | 'rijksmuseum' | 'chicago' | 'wikimedia';

// Full art piece with attribution
export interface ArtPiece {
  id: string;
  source: ArtSource;
  imageUrl: string;
  
  // Required attribution
  title: string;
  artist: string;
  artistDisplayName: string; // "Rembrandt van Rijn"
  
  // Optional but preferred
  year?: string;              // "1642" or "c. 1635-1640"
  medium?: string;            // "Oil on canvas"
  dimensions?: string;        // "363 cm × 437 cm"
  
  // Location info
  locationPainted?: string;   // "Amsterdam, Netherlands"
  currentLocation: string;    // "The Metropolitan Museum of Art, New York"
  galleryNumber?: string;     // "Gallery 634"
  
  // Links
  objectUrl?: string;         // Link to museum page
  
  // Rights
  isPublicDomain: boolean;
  creditLine?: string;        // "Gift of John D. Rockefeller Jr., 1937"
}

// Formatted attribution string
export interface ArtAttribution {
  primary: string;    // "The Return of the Prodigal Son" by Rembrandt van Rijn (1668)
  location: string;   // The Hermitage Museum, Saint Petersburg
  full: string;       // Complete multi-line attribution
}

// Verse to render on image
export interface VerseForImage {
  text: string;
  book: string;
  chapter: number;
  verse: number;
  verseEnd?: number;
  translation: string;
  reference: string;  // "John 3:16" or "Psalm 23:1-3"
}

// Configuration for generating a verse image
export interface VerseImageConfig {
  verse: VerseForImage;
  art: ArtPiece;
  format: ImageFormat;
  showAttribution: boolean;  // Show art credit on image
}

// Generated image result
export interface GeneratedVerseImage {
  uri: string;
  format: ImageFormat;
  width: number;
  height: number;
  verse: VerseForImage;
  art: ArtPiece;
  attribution: ArtAttribution;
}

// Topic to art keyword mapping
export interface TopicArtMapping {
  [topic: string]: string[];
}

// Cache entry for art pieces
export interface CachedArtPiece extends ArtPiece {
  cachedAt: Date;
  topic: string;
}
