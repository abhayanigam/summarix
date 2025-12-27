'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[var(--foreground)]/50" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books..."
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--input)]/50 border border-[var(--border)] rounded-full text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--foreground)]/20 focus:bg-[var(--card)] transition-all"
            />
        </form>
    );
}
