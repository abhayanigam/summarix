import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface BookSearchResult {
    title: string;
    author: string;
    year: string;
    pages: string;
    rating: string;
    ratingCount: string;
    tags: string[];
    coverImage?: string;
}


export interface BookSummary {
    title: string;
    author: string;
    year?: string;
    coverImage?: string;
    readTime?: string; // New field
    ideaInBrief: string;
    keyTakeaways: string[];
    fullSummary?: string; // Keep for backward compatibility
    plotSummary?: {
        sections: Array<{ title: string; content: string }>;
    };
    characters?: Array<{ name: string; description: string }>;
    plotDevices?: Array<{ name: string; description: string }>;
    analysis?: {
        writingStyle: string;
        psychologicalDepth: string;
        emotionalImpact: string;
    };
    faq?: Array<{ question: string; answer: string }>;
}

interface SummaryState {
    currentBook: BookSummary | null;
    searchResults: BookSearchResult[];
    isSearching: boolean;
    searchError: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: SummaryState = {
    currentBook: null,
    searchResults: [],
    isSearching: false,
    searchError: null,
    isLoading: false,
    error: null,
};

// Async thunk to search books
export const searchBooks = createAsyncThunk(
    'summary/searchBooks',
    async (query: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to search books');
            }
            const data = await response.json();
            return data.books as BookSearchResult[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to fetch summary from our API
export const fetchSummary = createAsyncThunk(
    'summary/fetchSummary',
    async (bookTitle: string, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({ bookTitle }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch summary');
            }

            const data = await response.json();
            return data as BookSummary;
        } catch (error: any) {
            return rejectWithValue(error.message as string);
        }
    }
);

const summarySlice = createSlice({
    name: 'summary',
    initialState,
    reducers: {
        clearSummary: (state) => {
            state.currentBook = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSummary.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSummary.fulfilled, (state, action: PayloadAction<BookSummary>) => {
                state.isLoading = false;
                state.currentBook = action.payload;
            })
            .addCase(fetchSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(searchBooks.pending, (state) => {
                state.isSearching = true;
                state.searchError = null;
            })
            .addCase(searchBooks.fulfilled, (state, action) => {
                state.isSearching = false;
                state.searchResults = action.payload;
            })
            .addCase(searchBooks.rejected, (state, action) => {
                state.isSearching = false;
                state.searchError = action.payload as string;
            });
    },
});

export const { clearSummary } = summarySlice.actions;
export default summarySlice.reducer;
