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

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: 'GOOGLE_API_KEY is not configured on the server.' }, { status: 500 });
        }

        // Use Gemini Flash for speed
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
      Task: Act as a book search engine. Return a list of 5-8 books that match the search query: "${query}".
      
      Instructions:
      - If the query looks like an author's name (e.g. "Akshat Gupta"), return their most popular books.
      - If it looks like a book title, return matching books.
      - If it looks like a genre or topic, return trending books in that category.
      
      Output Format: Return strictly a JSON array of objects. Each object must have:
      - title: Full title of the book.
      - author: Author's name.
      - year: Publication year (string).
      - pages: Estimated page count (string, e.g. "300 pages").
      - rating: A rating between 3.5 and 5.0 (string, e.g. "4.5").
      - ratingCount: Estimated rating count (string, e.g. "2k+ ratings").
      - tags: Array of 2-3 short genre tags (e.g. ["History", "Self-help"]).
      
      IMPORTANT: Return ONLY valid JSON. No markdown formatting.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("DEBUG: Raw Gemini Search Response:", text); // Debug log

        try {
            const books = JSON.parse(text);

            // Fetch cover images for each book
            const booksWithCovers = await Promise.all(books.map(async (book: any) => {
                const coverImage = await getBookCover(book.title, book.author);
                return { ...book, coverImage };
            }));

            return NextResponse.json({ books: booksWithCovers });
        } catch (e) {
            console.error("Failed to parse Gemini search results:", text);
            return NextResponse.json({ error: 'Failed to generate search results.' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Search API Error:', error);
        const message = error.message || 'Internal Server Error';
        const isQuota = message.includes('429') || message.includes('quota');
        return NextResponse.json({ error: message }, { status: isQuota ? 429 : 500 });
    }
}


