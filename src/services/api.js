import { quotes as localQuotes } from '../data/quotes';

const BIBLE_VERSES = [
    "Philippians+4:13",
    "Joshua+1:9",
    "Jeremiah+29:11",
    "Isaiah+40:31",
    "1+Corinthians+10:13",
    "Psalm+23:4",
    "Psalm+34:17-18",
    "Matthew+11:28",
    "2+Timothy+1:7",
    "Psalm+46:1",
    "Romans+8:28",
    "Proverbs+3:5-6",
    "Psalm+121:1-2"
];

const API_ENDPOINTS = {
    quote: "https://quotes-api-self.vercel.app/quote",
    bible: "https://bible-api.com/"
};

/**
 * Fetches a random motivational quote or bible verse.
 * @param {'motivational'|'bible'} type 
 * @returns {Promise<{text: string, author: string, type: string}>}
 */
export const fetchReward = async (type = 'motivational') => {
    try {
        if (type === 'bible') {
            return await fetchBibleVerse();
        } else {
            return await fetchMotivationalQuote();
        }
    } catch (error) {
        console.warn("API Request failed, falling back to local data.", error);
        return getLocalFallback(type);
    }
};

const fetchBibleVerse = async () => {
    const randomRef = BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
    const res = await fetch(`${API_ENDPOINTS.bible}${randomRef}`);
    if (!res.ok) throw new Error("Bible API failed");
    const data = await res.json();

    return {
        text: data.text.trim(),
        author: `${data.reference} (${data.translation_name})`,
        type: 'bible'
    };
};

const fetchMotivationalQuote = async () => {
    const res = await fetch(API_ENDPOINTS.quote);
    if (!res.ok) throw new Error("Quote API failed");
    const data = await res.json();

    return {
        text: data.quote,
        author: data.author,
        type: 'motivational'
    };
};

const getLocalFallback = (type) => {
    const filtered = localQuotes.filter(q => q.type === type);
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    return random;
};
