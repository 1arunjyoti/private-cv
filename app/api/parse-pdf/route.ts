import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';

/**
 * Normalize extracted PDF text to handle common issues:
 * - Remove excessive whitespace
 * - Fix broken words (hy-phen-ation)
 * - Merge lines that are part of the same paragraph
 * - Handle unicode issues
 */
function normalizeText(text: string): string {
  if (!text) return '';
  
  const normalized = text
    // Normalize unicode characters
    .normalize('NFKC')
    // Replace various dash types with standard hyphen
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    // Replace various quote types with standard quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Replace bullet points and other list markers with standard bullet
    .replace(/[\u2022\u2023\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u25E6\u2981\u29BE\u29BF]/g, '•')
    // Remove null characters and other control characters (except newline and tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Fix hyphenation at end of lines (word- \nrest -> wordrest)
    .replace(/(\w)-\s*\n\s*(\w)/g, '$1$2')
    // Normalize multiple spaces to single space
    .replace(/[ \t]+/g, ' ')
    // Normalize multiple newlines to max 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Final trim
    .trim();
  
  return normalized;
}

/**
 * Try to detect if PDF might be image-based (scanned)
 */
function isLikelyScannedPDF(text: string, numPages: number): boolean {
  if (!text || !text.trim()) return true;
  
  // Very little text for number of pages suggests scanned PDF
  const avgCharsPerPage = text.length / numPages;
  if (avgCharsPerPage < 100) return true;
  
  // Too much garbage characters might indicate OCR issues
  const garbageRatio = (text.match(/[^\w\s.,!?;:'"()-]/g)?.length || 0) / text.length;
  if (garbageRatio > 0.3) return true;
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Validate PDF header
    const uint8Array = new Uint8Array(arrayBuffer);
    const header = new TextDecoder().decode(uint8Array.slice(0, 8));
    if (!header.startsWith('%PDF')) {
      return NextResponse.json(
        { error: 'Invalid PDF file. The file does not appear to be a valid PDF.' },
        { status: 400 }
      );
    }

    let result;
    try {
      // Use unpdf to extract text
      result = await extractText(arrayBuffer, { mergePages: true });
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to read PDF content',
          details: parseError instanceof Error ? parseError.message : 'The PDF may be corrupted, encrypted, or use unsupported features.',
          suggestion: 'Try opening the PDF in a viewer and saving it as a new PDF, or convert it to DOCX format.'
        },
        { status: 422 }
      );
    }
    
    // Get raw and normalized text
    const rawText = result.text || '';
    const normalizedText = normalizeText(rawText);
    const numPages = result.totalPages || 1;
    
    // Check if PDF might be scanned/image-based
    if (isLikelyScannedPDF(normalizedText, numPages)) {
      return NextResponse.json({
        success: true,
        text: normalizedText,
        numPages,
        warning: 'This PDF appears to be image-based or scanned. Text extraction may be incomplete. For better results, please use a text-based PDF or convert to DOCX format.'
      });
    }
    
    return NextResponse.json({
      success: true,
      text: normalizedText,
      numPages
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Try converting your PDF to DOCX format for better results.'
      },
      { status: 500 }
    );
  }
}
