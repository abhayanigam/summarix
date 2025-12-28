'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchSummary } from '@/store/features/summarySlice';
import { Play, Clock, BookOpen, Share2, Bookmark, ChevronLeft, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ScrollProgress from '@/components/ui/ScrollProgress';
import TableOfContents, { TOCSection } from '@/components/ui/TableOfContents';
import { BookLoader } from '@/components/ui/BookLoader';

export default function SummaryPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { currentBook, isLoading, error } = useSelector((state: RootState) => state.summary);

    const bookTitle = decodeURIComponent(params.id as string);

    useEffect(() => {
        if (bookTitle) {
            dispatch(fetchSummary(bookTitle));
        }
    }, [dispatch, bookTitle]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] space-y-4">
                <BookLoader message={`Reading "${bookTitle}"...`} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 p-8">
                <div className="max-w-md text-center">
                    <h2 className="font-serif text-2xl font-bold mb-2">Oops!</h2>
                    <p>{error}</p>
                    <a href="/" className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-sm">Try Again</a>
                </div>
            </div>
        );
    }

    if (!currentBook) return null;

    // Build Table of Contents
    const tocSections: TOCSection[] = [
        { id: 'idea-in-brief', title: 'Idea in Brief' },
        { id: 'key-takeaways', title: 'Key Takeaways' },
    ];

    if (currentBook.plotSummary?.sections) {
        tocSections.push({
            id: 'plot-summary',
            title: 'Plot Summary',
            subsections: currentBook.plotSummary.sections.map((section, idx) => ({
                id: `plot-${idx}`,
                title: section.title
            }))
        });
    }

    if (currentBook.characters) {
        tocSections.push({
            id: 'characters',
            title: 'Characters',
            subsections: currentBook.characters.map((char, idx) => ({
                id: `char-${idx}`,
                title: char.name
            }))
        });
    }

    if (currentBook.plotDevices) {
        tocSections.push({ id: 'plot-devices', title: 'Plot Devices' });
    }

    if (currentBook.analysis) {
        tocSections.push({ id: 'analysis', title: 'Analysis' });
    }

    if (currentBook.faq) {
        tocSections.push({ id: 'faq', title: 'FAQ' });
    }

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-300">
            {/* Book Header Section */}
            <section className="bg-[var(--card)] border-b border-[var(--border)]">
                <div className="max-w-7xl mx-auto px- py-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors mb-2 group pt-15"
                    >
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 ml-5" />
                        Back to results
                    </button>
                </div>
                <div className="max-w-7xl mx-auto px-4 pb-12 pt-4 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                    {/* Cover Image */}
                    <div className="shrink-0 w-48 md:w-64 aspect-[2/3] bg-white shadow-xl rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden relative">
                        {currentBook.coverImage ? (
                            <img
                                src={currentBook.coverImage}
                                alt={currentBook.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <span className="font-serif font-bold text-gray-400 text-2xl">COVER</span>
                        )}
                    </div>

                    {/* Meta Data */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-2">
                            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight">
                                {currentBook.title}
                            </h1>
                            <p className="text-xl text-[var(--foreground)]">by <span className="underline decoration-1 underline-offset-4">{currentBook.author}</span></p>
                            {currentBook.year && <p className="text-sm text-gray-600">Published {currentBook.year}</p>}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-600 mt-4">
                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {currentBook.readTime || '10 min read'}</span>
                            <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Summary</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content with Sidebar */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
                    {/* Main Content Column */}
                    <div className="space-y-16">
                        {/* Idea in Brief */}
                        <section id="idea-in-brief" className="scroll-mt-24">
                            <div className="bg-orange-50/10 p-6 rounded-2xl border border-orange-200 shadow-sm">
                                <h2 className="font-serif font-bold text-2xl mb-4 dark:text-orange-400">The Idea in Brief</h2>
                                <div className="text-[var(--foreground)] leading-relaxed font-medium prose prose-orange max-w-none">
                                    <ReactMarkdown>{currentBook.ideaInBrief}</ReactMarkdown>
                                </div>
                            </div>
                        </section>

                        {/* Key Takeaways */}
                        <section id="key-takeaways" className="scroll-mt-24">
                            <h2 className="font-serif text-3xl font-bold mb-6 text-[var(--foreground)]">Key Takeaways</h2>
                            <ul className="grid gap-4">
                                {currentBook.keyTakeaways.map((point, index) => (
                                    <li key={index} className="flex gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--foreground)]/20 transition-colors">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[var(--background)] rounded-full shadow-sm font-serif font-bold text-sm border border-[var(--border)] text-[var(--foreground)]">
                                            {index + 1}
                                        </span>
                                        <div className="text-[var(--foreground)] leading-relaxed text-sm md:text-base">
                                            <ReactMarkdown>{point}</ReactMarkdown>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Plot Summary */}
                        {currentBook.plotSummary?.sections && (
                            <section id="plot-summary" className="scroll-mt-24">
                                <h2 className="font-serif text-3xl font-bold mb-8 text-[var(--foreground)]">Plot Summary</h2>
                                <div className="space-y-8">
                                    {currentBook.plotSummary.sections.map((section, idx) => (
                                        <div key={idx} id={`plot-${idx}`} className="scroll-mt-24">
                                            <h3 className="font-serif text-xl font-bold text-[var(--foreground)] mb-3">{section.title}</h3>
                                            <div className="text-[var(--foreground)] leading-relaxed prose prose-slate max-w-none dark:prose-invert">
                                                <ReactMarkdown>{section.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Characters */}
                        {currentBook.characters && (
                            <section id="characters" className="scroll-mt-24">
                                <h2 className="font-serif text-3xl font-bold mb-8 text-[var(--foreground)]">Characters</h2>
                                <div className="space-y-6">
                                    {currentBook.characters.map((character, idx) => (
                                        <div key={idx} id={`char-${idx}`} className="scroll-mt-24 p-6 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                                            <h3 className="font-serif text-xl font-bold text-[var(--foreground)] mb-3">{character.name}</h3>
                                            <div className="text-[var(--foreground)] leading-relaxed">
                                                <ReactMarkdown>{character.description}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Plot Devices */}
                        {currentBook.plotDevices && (
                            <section id="plot-devices" className="scroll-mt-24">
                                <h2 className="font-serif text-3xl font-bold mb-8 text-[var(--foreground)]">Plot Devices</h2>
                                <div className="space-y-6">
                                    {currentBook.plotDevices.map((device, idx) => (
                                        <div key={idx} className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <h3 className="font-serif text-xl font-bold text-blue-900 mb-3">{device.name}</h3>
                                            <div className="text-[var(--foreground)] leading-relaxed">
                                                <ReactMarkdown>{device.description}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Analysis */}
                        {currentBook.analysis && (
                            <section id="analysis" className="scroll-mt-24">
                                <h2 className="font-serif text-3xl font-bold mb-8 text-[var(--foreground)]">Analysis</h2>
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-[var(--foreground)] mb-3">Writing Style</h3>
                                        <div className="text-[var(--foreground)] leading-relaxed prose prose-slate max-w-none dark:prose-invert">
                                            <ReactMarkdown>{currentBook.analysis.writingStyle}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-[var(--foreground)] mb-3">Psychological Depth</h3>
                                        <div className="text-[var(--foreground)] leading-relaxed prose prose-slate max-w-none dark:prose-invert">
                                            <ReactMarkdown>{currentBook.analysis.psychologicalDepth}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-[var(--foreground)] mb-3">Emotional Impact</h3>
                                        <div className="text-[var(--foreground)] leading-relaxed prose prose-slate max-w-none dark:prose-invert">
                                            <ReactMarkdown>{currentBook.analysis.emotionalImpact}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* FAQ */}
                        {currentBook.faq && (
                            <section id="faq" className="scroll-mt-24">
                                <h2 className="font-serif text-3xl font-bold mb-8 text-[var(--foreground)]">FAQ</h2>
                                <div className="space-y-6">
                                    {currentBook.faq.map((item, idx) => (
                                        <div key={idx} className="border-b border-[var(--border)] pb-6 last:border-0">
                                            <h3 className="font-serif text-lg font-bold text-[var(--foreground)] mb-3">{item.question}</h3>
                                            <div className="text-[var(--foreground)] leading-relaxed">
                                                <ReactMarkdown>{item.answer}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Column - Desktop TOC */}
                    <TableOfContents
                        sections={tocSections}
                        bookTitle={currentBook.title}
                        author={currentBook.author}
                    />
                </div>
            </div>

            {/*<ScrollProgress />*/}
        </main>
    );
}
