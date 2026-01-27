/**
 * Bible Brain API Service
 * 
 * Provides audio Bible content via Faith Comes By Hearing's Bible Brain API.
 * API Docs: https://www.faithcomesbyhearing.com/bible-brain/developer-documentation
 * 
 * @see https://4.dbt.io/api_key/request - Request API key
 */

import Constants from 'expo-constants';

// =============================================================================
// Types
// =============================================================================

export interface BibleBrainConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface AudioFile {
  bookId: string;
  bookName: string;
  chapter: number;
  duration: number;
  path: string; // Signed CDN URL
}

export interface AudioTimestamp {
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  timestamp: number; // Seconds from start of audio
}

export interface BibleFileset {
  id: string;
  type: 'audio' | 'audio_drama' | 'text_plain' | 'text_format' | 'video_stream';
  size: 'C' | 'NT' | 'OT' | 'NTP' | 'OTP'; // Complete, New/Old Testament, Partial
}

export interface BibleVersion {
  id: string;
  name: string;
  languageCode: string;
  filesets: BibleFileset[];
}

// =============================================================================
// Translation Mapping
// =============================================================================

/**
 * Maps ChooseGOD translation codes to Bible Brain fileset IDs.
 * 
 * Bible Brain FilesetId format: LLLVVV[CDMM]
 * - LLL = Language ISO code (e.g., ENG)
 * - VVV = Version abbreviation (e.g., KJV)
 * - C = Collection (C=Complete, N=NT, O=OT, P=Partial)
 * - D = Drama type (1=non-drama, 2=drama)
 * - MM = Media type (DA=digital audio)
 * 
 * Example: ENGKJVC1DA = English KJV Complete Non-Drama Digital Audio
 */
export const TRANSLATION_FILESET_MAP: Record<string, {
  textFileset: string;
  audioFileset?: string; // Non-drama
  audioDramaFileset?: string; // Drama version
  languageCode: string;
}> = {
  // ===== ENGLISH =====
  KJV: {
    textFileset: 'ENGKJV',
    audioFileset: 'ENGKJVC1DA',
    audioDramaFileset: 'ENGKJVC2DA',
    languageCode: 'eng',
  },
  ASV: {
    textFileset: 'ENGASV',
    audioFileset: 'ENGASVC1DA',
    languageCode: 'eng',
  },
  WEB: {
    textFileset: 'ENGWEB',
    audioFileset: 'ENGWEBN2DA', // NT Drama available
    languageCode: 'eng',
  },
  // Note: NIV, ESV, NLT, NASB are licensed - may require special API key
  // Check Bible Brain available content for your key
  
  // ===== SPANISH =====
  RVR: {
    textFileset: 'SPARVR',
    audioFileset: 'SPARVRC1DA',
    audioDramaFileset: 'SPARVRC2DA',
    languageCode: 'spa',
  },
  RVR1960: {
    textFileset: 'SPARVR',
    audioFileset: 'SPARVRC1DA',
    languageCode: 'spa',
  },
  
  // ===== CHINESE =====
  CUV: {
    textFileset: 'CHNUNV',
    audioFileset: 'CHNUNVC1DA',
    languageCode: 'cmn',
  },
  
  // ===== PORTUGUESE =====
  PAA: {
    textFileset: 'PORAAA',
    audioFileset: 'PORAAAC1DA',
    languageCode: 'por',
  },
  
  // ===== RUSSIAN =====
  SYNODAL: {
    textFileset: 'RUSSYN',
    audioFileset: 'RUSSYNC1DA',
    languageCode: 'rus',
  },
};

// =============================================================================
// Service Class
// =============================================================================

const DEFAULT_BASE_URL = 'https://4.dbt.io/api';

class BibleBrainService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config?: BibleBrainConfig) {
    // Try to get API key from config, then env, then Expo constants
    this.apiKey = config?.apiKey 
      || process.env.BIBLE_BRAIN_API_KEY 
      || Constants.expoConfig?.extra?.bibleBrainApiKey 
      || '';
    this.baseUrl = config?.baseUrl || DEFAULT_BASE_URL;
  }

  /**
   * Check if service is configured with an API key
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Set API key (for runtime configuration)
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Bible Brain API key not configured. Request one at https://4.dbt.io/api_key/request');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('v', '4');
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bible Brain API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // ===========================================================================
  // Bible & Fileset Discovery
  // ===========================================================================

  /**
   * List available Bibles for a language
   */
  async listBibles(languageCode?: string): Promise<BibleVersion[]> {
    const params: Record<string, string> = {};
    if (languageCode) {
      params.language_code = languageCode;
    }
    return this.request('/bibles', params);
  }

  /**
   * Get filesets for a specific Bible
   */
  async getBibleFilesets(bibleId: string): Promise<BibleFileset[]> {
    const bible = await this.request<{ filesets: BibleFileset[] }>(`/bibles/${bibleId}`);
    return bible.filesets || [];
  }

  /**
   * Get audio fileset ID for a ChooseGOD translation
   */
  getAudioFilesetId(translation: string, preferDrama: boolean = false): string | null {
    const mapping = TRANSLATION_FILESET_MAP[translation];
    if (!mapping) return null;
    
    if (preferDrama && mapping.audioDramaFileset) {
      return mapping.audioDramaFileset;
    }
    return mapping.audioFileset || null;
  }

  // ===========================================================================
  // Audio Content
  // ===========================================================================

  /**
   * Get audio file URL for a specific chapter
   * 
   * @param filesetId - Bible Brain fileset ID (e.g., ENGKJVC1DA)
   * @param bookId - USFM book ID (e.g., GEN, MAT, REV)
   * @param chapter - Chapter number
   */
  async getChapterAudio(
    filesetId: string,
    bookId: string,
    chapter: number
  ): Promise<AudioFile | null> {
    try {
      const data = await this.request<AudioFile[]>(
        `/bibles/filesets/${filesetId}/${bookId}/${chapter}`
      );
      return data?.[0] || null;
    } catch (error) {
      console.error(`Failed to get audio for ${bookId} ${chapter}:`, error);
      return null;
    }
  }

  /**
   * Get audio URL using ChooseGOD translation code
   */
  async getChapterAudioByTranslation(
    translation: string,
    bookId: string,
    chapter: number,
    preferDrama: boolean = false
  ): Promise<AudioFile | null> {
    const filesetId = this.getAudioFilesetId(translation, preferDrama);
    if (!filesetId) {
      console.warn(`No audio fileset mapped for translation: ${translation}`);
      return null;
    }
    return this.getChapterAudio(filesetId, bookId, chapter);
  }

  // ===========================================================================
  // Audio Timestamps (for karaoke/verse sync)
  // ===========================================================================

  /**
   * Check which filesets have timestamp data available
   */
  async getTimestampFilesets(): Promise<string[]> {
    const data = await this.request<{ fileset_id: string }[]>('/timestamps');
    return data.map(item => item.fileset_id);
  }

  /**
   * Get verse-level timestamps for a chapter
   * Useful for highlighting current verse during playback
   */
  async getChapterTimestamps(
    filesetId: string,
    bookId: string,
    chapter: number
  ): Promise<AudioTimestamp[]> {
    try {
      const data = await this.request<{
        verse_start: number;
        verse_end: number;
        timestamp: number;
      }[]>(`/timestamps/${filesetId}/${bookId}/${chapter}`);

      return data.map(item => ({
        bookId,
        chapter,
        verseStart: item.verse_start,
        verseEnd: item.verse_end,
        timestamp: item.timestamp,
      }));
    } catch (error) {
      console.error(`Failed to get timestamps for ${bookId} ${chapter}:`, error);
      return [];
    }
  }

  /**
   * Get timestamps using ChooseGOD translation code
   */
  async getChapterTimestampsByTranslation(
    translation: string,
    bookId: string,
    chapter: number,
    preferDrama: boolean = false
  ): Promise<AudioTimestamp[]> {
    const filesetId = this.getAudioFilesetId(translation, preferDrama);
    if (!filesetId) return [];
    return this.getChapterTimestamps(filesetId, bookId, chapter);
  }

  // ===========================================================================
  // Downloadable Content
  // ===========================================================================

  /**
   * List filesets available for download with current API key
   */
  async getDownloadableFilesets(): Promise<BibleFileset[]> {
    return this.request('/download/list');
  }

  /**
   * Get download URL for offline caching
   */
  async getDownloadUrl(
    filesetId: string,
    bookId?: string,
    chapter?: number
  ): Promise<string | null> {
    try {
      const path = bookId && chapter 
        ? `/download/${filesetId}/${bookId}/${chapter}`
        : `/download/${filesetId}`;
      const data = await this.request<{ path: string }[]>(path);
      return data?.[0]?.path || null;
    } catch (error) {
      console.error('Failed to get download URL:', error);
      return null;
    }
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const bibleBrain = new BibleBrainService();

// Also export class for custom instances
export { BibleBrainService };

// =============================================================================
// USFM Book ID Mapping
// =============================================================================

/**
 * Maps ChooseGOD book names to USFM book IDs used by Bible Brain
 */
export const BOOK_TO_USFM: Record<string, string> = {
  // Old Testament
  Genesis: 'GEN',
  Exodus: 'EXO',
  Leviticus: 'LEV',
  Numbers: 'NUM',
  Deuteronomy: 'DEU',
  Joshua: 'JOS',
  Judges: 'JDG',
  Ruth: 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  Ezra: 'EZR',
  Nehemiah: 'NEH',
  Esther: 'EST',
  Job: 'JOB',
  Psalms: 'PSA',
  Proverbs: 'PRO',
  Ecclesiastes: 'ECC',
  'Song of Solomon': 'SNG',
  Isaiah: 'ISA',
  Jeremiah: 'JER',
  Lamentations: 'LAM',
  Ezekiel: 'EZK',
  Daniel: 'DAN',
  Hosea: 'HOS',
  Joel: 'JOL',
  Amos: 'AMO',
  Obadiah: 'OBA',
  Jonah: 'JON',
  Micah: 'MIC',
  Nahum: 'NAM',
  Habakkuk: 'HAB',
  Zephaniah: 'ZEP',
  Haggai: 'HAG',
  Zechariah: 'ZEC',
  Malachi: 'MAL',
  // New Testament
  Matthew: 'MAT',
  Mark: 'MRK',
  Luke: 'LUK',
  John: 'JHN',
  Acts: 'ACT',
  Romans: 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  Galatians: 'GAL',
  Ephesians: 'EPH',
  Philippians: 'PHP',
  Colossians: 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  Titus: 'TIT',
  Philemon: 'PHM',
  Hebrews: 'HEB',
  James: 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  Jude: 'JUD',
  Revelation: 'REV',
};

/**
 * Convert ChooseGOD book name to USFM ID
 */
export function bookToUsfm(bookName: string): string {
  return BOOK_TO_USFM[bookName] || bookName.substring(0, 3).toUpperCase();
}
