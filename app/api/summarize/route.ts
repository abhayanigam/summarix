import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

async function getBookCover(title: string, author: string) {
  try {
    const query = encodeURIComponent(`intitle:${title} inauthor:${author}`);
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
    const data = await response.json();
    return data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ||
      data.items?.[0]?.volumeInfo?.imageLinks?.smallThumbnail || null;
  } catch (error) {
    console.error('Error fetching book cover:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bookTitle } = await req.json();

    if (!bookTitle) {
      return NextResponse.json({ error: 'Book title is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_API_KEY is not configured on the server.' }, { status: 500 });
    }

    // Use Gemini Flash for speed
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
      Task: Act as a book summary expert. Generate a comprehensive summary for the book: "${bookTitle}".
      
      Instructions:
      - Provide a "Idea in Brief" (1-2 paragraphs).
      - Provide 3-5 "Key Takeaways".
      - Provide an estimated "Read Time" for this summary (e.g. "12 min read").
      - Provide a "Plot Summary" divided into 3-4 sections with titles.
      - Provide a list of "Characters" (name and short description).
      - Provide a list of "Plot Devices" used (name and short description).
      - Provide an "Analysis" covering Writing Style, Psychological Depth, and Emotional Impact.
      - Provide 3-4 "FAQ" (question and answer).
      
      Output Format: Return strictly a JSON object. No markdown formatting.
      JSON structure:
      {
        "title": "Full Book Title",
        "author": "Author Name",
        "year": "Publication Year",
        "readTime": "String (e.g. '15 min read')",
        "ideaInBrief": "String (Markdown supported)",
        "keyTakeaways": ["String (Markdown supported)", ...],
        "plotSummary": {
          "sections": [
            { "title": "Section Title", "content": "Section Content (Markdown supported)" },
            ...
          ]
        },
        "characters": [
          { "name": "Character Name", "description": "Description (Markdown supported)" },
          ...
        ],
        "plotDevices": [
          { "name": "Device Name", "description": "Description (Markdown supported)" },
          ...
        ],
        "analysis": {
          "writingStyle": "Analysis (Markdown supported)",
          "psychologicalDepth": "Analysis (Markdown supported)",
          "emotionalImpact": "Analysis (Markdown supported)"
        },
        "faq": [
          { "question": "Question", "answer": "Answer (Markdown supported)" },
          ...
        ]
      }
      
      IMPORTANT: Return ONLY valid JSON. No markdown formatting outside the JSON values.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    console.log("DEBUG: Raw Gemini Summarize Response:", text); // Debug log

    try {
      const summary = JSON.parse(text);

      // Fetch cover image
      const coverImage = await getBookCover(summary.title, summary.author);

      return NextResponse.json({ ...summary, coverImage });
    } catch (e) {
      console.error("Failed to parse Gemini summary results:", text);
      return NextResponse.json({ error: 'Failed to generate book summary.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Summarize API Error:', error);
    const message = error.message || 'Internal Server Error';
    const isQuota = message.includes('429') || message.includes('quota');
    return NextResponse.json({ error: message }, { status: isQuota ? 429 : 500 });
  }
}

