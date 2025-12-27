'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Sun className="h-5 w-5 text-[#1F3A4B] dark:text-[#FAFDEE]" />
            ) : (
                <Moon className="h-5 w-5 text-[#1F3A4B] dark:text-[#FAFDEE]" />
            )}
        </button>
    );
}
