'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { searchBooks } from '@/store/features/summarySlice';
import { Star, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { BookLoader } from '@/components/ui/BookLoader';

import { Suspense } from 'react';

function SearchPageContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const { searchResults, isSearching, searchError } = useSelector((state: RootState) => state.summary);

    useEffect(() => {
        if (query) {
            dispatch(searchBooks(query));
        }
    }, [dispatch, query]);

    if (isSearching) {
        return (
            <div className="py-24 flex items-center justify-center bg-[var(--background)]">
                <BookLoader message="Finding books..." />
            </div>
        );
    }

    if (searchError) {
        console.error("Search Page Error:", searchError); // Log error as requested
        return (
            <div className="py-24 flex items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-6">
                    <BookLoader message="Failed to load" />
                </div>
            </div>
        );
    }

    // Handle case where query is empty
    if (!query) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]/60">
                <p>Type something to search...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] mb-2 pt-10">Search Results</h1>
                    <p className="text-[var(--foreground)]">Found {searchResults.length} books for <span className="font-bold text-[var(--foreground)]">"{query}"</span></p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.map((book, index) => (
                        <div
                            key={index}
                            onClick={() => router.push(`/summary/${encodeURIComponent(book.title)}`)}
                            className="flex flex-col sm:flex-row gap-6 p-6 rounded-xl border border-[var(--border)] hover:shadow-lg hover:border-[var(--foreground)]/20 transition-all cursor-pointer group bg-[var(--card)]"
                        >
                            {/* Cover */}
                            <div className="shrink-0 w-32 h-48 bg-[var(--input)] rounded-md flex items-center justify-center relative overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                {book.coverImage ? (
                                    <img
                                        src={book.coverImage}
                                        alt={book.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <BookOpen className="h-8 w-8 text-[var(--foreground)]/40" />
                                )}
                            </div>


                            {/* Content */}
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="font-serif text-xl font-bold text-[var(--card-foreground)] leading-tight group-hover:underline decoration-2 underline-offset-2 mb-1">
                                            {book.title}
                                        </h2>
                                        <p className="text-[var(--foreground)] font-medium text-sm">by {book.author}</p>
                                    </div>
                                    {/* Badge */}
                                    <span className="px-2 py-1 bg-[var(--accent)] text-[var(--accent-foreground)] text-[10px] font-bold uppercase tracking-wider rounded-sm">Summarized</span>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-[var(--foreground)] mt-2 mb-4 font-medium">
                                    <span>{book.year}</span>
                                    <span className="w-1 h-1 bg-[var(--foreground)]/20 rounded-full"></span>
                                    <span>{book.pages}</span>
                                </div>

                                <div className="flex items-center gap-1.5 mb-6">
                                    <span className="font-bold text-sm text-[var(--foreground)]">{book.rating}</span>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-3.5 w-3.5 ${star <= Math.round(parseFloat(book.rating)) ? 'fill-[#C2F84F] text-[#C2F84F]' : 'text-[var(--foreground)]/20'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[var(--foreground)]/60">({book.ratingCount})</span>
                                </div>

                                {/* Tags */}
                                <div className="mt-auto flex flex-wrap gap-2">
                                    {book.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-[var(--input)] text-[var(--foreground)] text-xs font-medium rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {!isSearching && searchResults.length === 0 && (
                    <div className="py-20 text-center text-[var(--foreground)]/60">
                        <p>No books found. Try a different search term.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="py-24 flex items-center justify-center bg-[var(--background)]">
                <BookLoader message="Loading search..." />
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}
