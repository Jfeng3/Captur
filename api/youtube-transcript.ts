import { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (
  req: VercelRequest,
  res: VercelResponse
) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Missing videoId parameter' });
  }

  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) {
    console.error('SUPADATA_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'API configuration error: Missing API key' });
  }

  try {
    console.log(`Fetching transcript for video: ${videoId}`);

    const response = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?url=https://www.youtube.com/watch?v=${videoId}&lang=en`,
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = await response.text();
    let parsedBody: Record<string, unknown> | null = null;

    if (responseText) {
      try {
        parsedBody = JSON.parse(responseText);
      } catch {
        parsedBody = null;
      }
    }

    const combinedErrorFields = [
      typeof parsedBody?.error === 'string' ? parsedBody.error : null,
      typeof parsedBody?.message === 'string' ? parsedBody.message : null,
      typeof parsedBody?.details === 'string' ? parsedBody.details : null,
      responseText || null
    ].filter(Boolean) as string[];

    const combinedErrorMessage = combinedErrorFields.join(' ').toLowerCase();
    const hasSupadataError =
      typeof parsedBody?.error === 'string' &&
      parsedBody.error.trim().length > 0;

    const supadataStatusMessage =
      typeof parsedBody?.message === 'string' && parsedBody.message.trim().length > 0
        ? parsedBody.message.trim()
        : 'Transcript Unavailable';

    const supadataDetails =
      typeof parsedBody?.details === 'string' && parsedBody.details.trim().length > 0
        ? parsedBody.details.trim()
        : 'No transcript is available for this video.';

    const unsupportedLanguage =
      combinedErrorMessage.includes('user aborted request') ||
      combinedErrorMessage.includes('language') ||
      combinedErrorMessage.includes('unsupported transcript language');

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          error: 'No transcript/captions available for this video. The video may not have subtitles enabled.'
        });
      }

      if (unsupportedLanguage) {
        return res.status(400).json({
          error: 'Unsupported transcript language',
          details: 'We currently support only YouTube videos with English transcripts. Please choose a video that has English captions enabled.'
        });
      }

      throw new Error(
        `Supadata transcript request failed (${response.status})${combinedErrorFields.length > 0 ? `: ${combinedErrorFields.join(' ')}` : ''}`
      );
    }

    if (response.status === 206 || hasSupadataError) {
      const status = unsupportedLanguage ? 400 : 404;
      const errorPayload = unsupportedLanguage
        ? {
            error: 'Unsupported transcript language',
            details: 'We currently support only YouTube videos with English transcripts. Please choose a video that has English captions enabled.'
          }
        : {
            error: supadataStatusMessage,
            details: supadataDetails
          };

      return res.status(status).json(errorPayload);
    }

    const candidateContent = Array.isArray(parsedBody?.content)
      ? parsedBody?.content
      : Array.isArray(parsedBody?.transcript)
        ? parsedBody?.transcript
        : Array.isArray(parsedBody)
          ? parsedBody
          : null;

    if (!candidateContent || candidateContent.length === 0) {
      return res.status(404).json({
        error: supadataStatusMessage,
        details: supadataDetails
      });
    }

    let transcriptSegments = candidateContent;

    // Language validation
    const reportedLanguages = transcriptSegments
      .map(item => {
        if (item && typeof item === 'object') {
          if (typeof (item as any).lang === 'string') return (item as any).lang;
          if (typeof (item as any).language === 'string') return (item as any).language;
        }
        return null;
      })
      .filter((lang): lang is string => typeof lang === 'string' && lang.trim().length > 0)
      .map(lang => lang.trim().toLowerCase());

    const hasReportedEnglish = reportedLanguages.some(lang => lang === 'en' || lang.startsWith('en-'));
    const hasReportedLanguages = reportedLanguages.length > 0;

    const sampleText = transcriptSegments
      .slice(0, 120)
      .map(item => {
        if (!item || typeof item !== 'object') return '';
        if (typeof (item as any).text === 'string') return (item as any).text;
        if (typeof (item as any).content === 'string') return (item as any).content;
        return '';
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const nonSpaceLength = sampleText.replace(/\s/g, '').length;
    const englishLetterCount = (sampleText.match(/[A-Za-z]/g) ?? []).length;
    const cjkCharacterPresent = /[\u3400-\u9FFF]/.test(sampleText);
    const englishRatio = nonSpaceLength > 0 ? englishLetterCount / nonSpaceLength : 0;

    const appearsNonEnglish =
      (hasReportedLanguages && !hasReportedEnglish) ||
      (cjkCharacterPresent && englishRatio < 0.2) ||
      (!hasReportedLanguages && englishRatio < 0.1 && nonSpaceLength > 0);

    if (appearsNonEnglish) {
      return res.status(400).json({
        error: 'Unsupported transcript language',
        details: 'We currently support only YouTube videos with English transcripts. Please choose a video that has English captions enabled.'
      });
    }

    // Transform transcript segments
    const transformedTranscript = transcriptSegments.map((item: any) => ({
      text: item.text || item.content || '',
      // Convert milliseconds to seconds for offset/start
      start: (item.offset !== undefined ? item.offset / 1000 : item.start) || 0,
      // Convert milliseconds to seconds for duration
      duration: (item.duration !== undefined ? item.duration / 1000 : 0) || 0
    }));

    // Generate full text
    const fullText = transformedTranscript
      .map((segment: any) => segment.text)
      .join(' ');

    return res.status(200).json({
      videoId,
      transcript: transformedTranscript,
      fullText,
      segmentCount: transformedTranscript.length
    });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to fetch transcript',
      details: errorMessage
    });
  }
};

export default handler;
