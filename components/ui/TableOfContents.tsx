'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export interface TOCSection {
    id: string;
    title: string;
    subsections?: Array<{ id: string; title: string }>;
}

interface TableOfContentsProps {
    sections: TOCSection[];
    bookTitle: string;
    author: string;
}

export default function TableOfContents({ sections, bookTitle, author }: TableOfContentsProps) {
    const [activeSection, setActiveSection] = useState<string>('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.flatMap(section => {
                const main = document.getElementById(section.id);
                const subs = section.subsections?.map(sub => document.getElementById(sub.id)) || [];
                return [main, ...subs].filter(Boolean) as HTMLElement[];
            });

            const scrollPosition = window.scrollY + 100;

            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const element = sectionElements[i];
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveSection(element.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
            setIsMobileMenuOpen(false);
        }
    };

    const TOCContent = () => (
        <>
            <div className="mb-6 pb-6 border-b border-[var(--border)]">
                <h3 className="font-serif font-bold text-sm text-[var(--foreground)] leading-tight mb-1">
                    {bookTitle}
                </h3>
                <p className="text-xs text-[var(--foreground)] opacity-70">by {author}</p>
            </div>

            <nav className="space-y-1">
                {sections.map((section) => (
                    <div key={section.id}>
                        <button
                            onClick={() => scrollToSection(section.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id
                                ? 'bg-[var(--input)] text-[var(--foreground)] font-bold'
                                : 'text-[var(--foreground)] opacity-70 hover:bg-[var(--input)]/50 hover:text-[var(--foreground)] hover:opacity-100'
                                }`}
                        >
                            {section.title}
                        </button>

                        {section.subsections && section.subsections.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1">
                                {section.subsections.map((subsection) => (
                                    <button
                                        key={subsection.id}
                                        onClick={() => scrollToSection(subsection.id)}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${activeSection === subsection.id
                                            ? 'text-[var(--foreground)] font-bold'
                                            : 'text-[var(--foreground)] opacity-60 hover:text-[var(--foreground)] hover:opacity-100'
                                            }`}
                                    >
                                        {subsection.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block sticky top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto">
                <TOCContent />
            </div>

            {/* Mobile Floating Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-800 transition-colors"
                aria-label="Open Table of Contents"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/50 z-50"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[var(--background)] z-50 shadow-2xl overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-[var(--background)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
                                <h2 className="font-serif font-bold text-lg text-[var(--foreground)]">Table of Contents</h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-[var(--input)] rounded-lg transition-colors text-[var(--foreground)]"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="px-6 py-4">
                                <TOCContent />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
