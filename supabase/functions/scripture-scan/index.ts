/**
 * scripture-scan Edge Function
 *
 * OCR-powered text extraction from images using OpenAI GPT-4 Vision API.
 * Enables users to scan real-world text and find biblical insights.
 *
 * Inspired by 2 Timothy 3:16 - Scripture is "useful for teaching, rebuking,
 * correcting and training in righteousness."
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ScriptureScanRequest {
  imageUri?: string;
  imageBase64?: string;
}

interface ScriptureScanResponse {
  success: boolean;
  text?: string;
  error?: string;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Validate OpenAI API key
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }

    // Parse request body
    const { imageUri, imageBase64 }: ScriptureScanRequest = await req.json();

    if (!imageUri && !imageBase64) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Either imageUri or imageBase64 must be provided',
        } as ScriptureScanResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare image URL for OpenAI Vision API
    let imageUrl: string;
    if (imageBase64) {
      // Base64-encoded image
      imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    } else {
      // Direct image URI
      imageUrl = imageUri!;
    }

    // Call OpenAI GPT-4 Vision API for OCR
    console.log('Calling OpenAI Vision API for text extraction...');
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all readable text from this image. Return ONLY the extracted text, nothing else. If no text is visible, respond with "NO_TEXT_FOUND".',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high', // Higher resolution for better OCR
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1, // Low temperature for accuracy
      }),
    });

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      console.error('OpenAI Vision API error:', errorData);
      throw new Error(`OpenAI Vision API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const visionData = await visionResponse.json();
    const extractedText = visionData.choices?.[0]?.message?.content?.trim();

    if (!extractedText || extractedText === 'NO_TEXT_FOUND') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No readable text found in the image',
        } as ScriptureScanResponse),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Successfully extracted text: ${extractedText.substring(0, 100)}...`);

    // Return extracted text
    return new Response(
      JSON.stringify({
        success: true,
        text: extractedText,
      } as ScriptureScanResponse),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('scripture-scan error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      } as ScriptureScanResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
