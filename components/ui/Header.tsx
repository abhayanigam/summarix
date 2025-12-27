'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show header background and search bar after scrolling past 300px (Hero height approx)
            setScrolled(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${!isHome
                ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 py-3 shadow-sm'
                : 'bg-transparent py-5 border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* Logo/Heading */}
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-md font-serif font-bold text-xl transition-transform group-hover:scale-105">S</div>
                        <span className="font-serif font-bold text-xl tracking-tight text-gray-900 hidden lg:block">Summarix</span>
                    </a>
                </div>

                {/* Scrolled Content: Search Bar & Theme Toggle */}
                {/* Visible ONLY if NOT home */}
                {!isHome && (
                    <div className="ml-auto w-full max-w-md flex items-center gap-4">
                        <div className="flex-1">
                            <SearchBar />
                        </div>
                        <ThemeToggle />
                    </div>
                )}
            </div>
        </header>
    );
}
