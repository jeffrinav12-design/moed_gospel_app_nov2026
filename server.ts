import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

export const JESUS_NEVER_FAILS_CHANNEL_URL = "https://www.youtube.com/@jesusneverfails7649";
const YOUTUBE_CHANNEL_ID = "UCDAokHRiN1rvC1QHVRdUkgQ";
const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const DATA_DIR = process.env.VERCEL ? "/tmp" : process.cwd();
const STORE_PATH = path.join(DATA_DIR, ".gospel-partner-store.json");
const BIBLE_CACHE_PATH = path.join(DATA_DIR, ".bible-lang-cache.json");

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

interface PartnerStoreData {
  sessions: any[];
  prayerRequests: any[];
  fellowships: any[];
  customTemplates: any[];
  bookReleases: any[];
}

function loadStore(): PartnerStoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        prayerRequests: Array.isArray(parsed.prayerRequests) ? parsed.prayerRequests : [],
        fellowships: Array.isArray(parsed.fellowships) ? parsed.fellowships : [],
        customTemplates: Array.isArray(parsed.customTemplates) ? parsed.customTemplates : [],
        bookReleases: Array.isArray(parsed.bookReleases) ? parsed.bookReleases : [],
      };
    }
  } catch (err) {
    console.warn("Could not load persistent store, initializing fresh store.", err);
  }
  return { sessions: [], prayerRequests: [], fellowships: [], customTemplates: [], bookReleases: [] };
}

function saveStore(store: PartnerStoreData) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write persistent store:", err);
  }
}

const partnerStore = loadStore();
const sessionsMap = new Map<string, any>();
partnerStore.sessions.forEach((s) => {
  if (s?.id) sessionsMap.set(s.id, s);
});

const bibleChapterCache = new Map<string, any>();

try {
  if (fs.existsSync(BIBLE_CACHE_PATH)) {
    const rawBible = JSON.parse(fs.readFileSync(BIBLE_CACHE_PATH, "utf-8"));
    if (rawBible && typeof rawBible === "object") {
      Object.entries(rawBible).forEach(([k, v]) => bibleChapterCache.set(k, v));
    }
  }
} catch (err) {
  console.warn("Could not hydrate Bible cache:", err);
}

function persistBibleCache() {
  try {
    const entries = Array.from(bibleChapterCache.entries()).slice(-250);
    const obj: Record<string, any> = {};
    entries.forEach(([k, v]) => {
      obj[k] = v;
    });
    fs.writeFileSync(BIBLE_CACHE_PATH, JSON.stringify(obj), "utf-8");
  } catch (err) {
    console.warn("Could not persist Bible cache:", err);
  }
}

function persistSessions() {
  partnerStore.sessions = Array.from(sessionsMap.values());
  saveStore(partnerStore);
}

// Live YouTube RSS Feed Cache (5 minutes)
let cachedVideos: { fetchedAt: number; videos: any[] } = { fetchedAt: 0, videos: [] };

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? decodeXmlEntities(m[1].trim()) : "";
}

async function fetchLiveYouTubeChannelVideos(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedVideos.videos.length > 0 && now - cachedVideos.fetchedAt < 5 * 60 * 1000) {
    return cachedVideos.videos;
  }

  const res = await fetch(YOUTUBE_RSS_URL, {
    headers: { "User-Agent": "MOED-Gospel-Partner-App/1.0" },
  });

  if (!res.ok) {
    throw new Error(`YouTube feed responded with ${res.status}`);
  }

  const xml = await res.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];

  const videos = entries
    .map((entry) => {
      const videoId = extractTag(entry, "yt:videoId");
      const title = extractTag(entry, "title");
      const publishedAt = extractTag(entry, "published");
      const description = extractTag(entry, "media:description");
      const linkMatch = entry.match(/<link[^>]+href="([^"]+)"/i);
      const url = linkMatch ? linkMatch[1] : `https://www.youtube.com/watch?v=${videoId}`;
      const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
      const thumbnailUrl = thumbMatch
        ? thumbMatch[1]
        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const statsMatch = entry.match(/views="(\d+)"/i);
      const views = statsMatch ? statsMatch[1] : "0";
      const isShort = url.includes("/shorts/");

      return {
        videoId,
        title,
        url,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl,
        publishedAt,
        description,
        views,
        isShort,
        channelName: "Jesus Never Fails",
        channelHandle: "@jesusneverfails7649",
        channelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
      };
    })
    .filter((v) => v.videoId && v.title);

  if (videos.length > 0) {
    cachedVideos = { fetchedAt: now, videos };
  }
  return videos;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy_key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const CANONICAL_BOOKS_USFM: Array<{ name: string; usfm: string }> = [
  { name: "genesis", usfm: "GEN" }, { name: "exodus", usfm: "EXO" }, { name: "leviticus", usfm: "LEV" },
  { name: "numbers", usfm: "NUM" }, { name: "deuteronomy", usfm: "DEU" }, { name: "joshua", usfm: "JOS" },
  { name: "judges", usfm: "JDG" }, { name: "ruth", usfm: "RUT" }, { name: "1 samuel", usfm: "1SA" },
  { name: "2 samuel", usfm: "2SA" }, { name: "1 kings", usfm: "1KI" }, { name: "2 kings", usfm: "2KI" },
  { name: "1 chronicles", usfm: "1CH" }, { name: "2 chronicles", usfm: "2CH" }, { name: "ezra", usfm: "EZR" },
  { name: "nehemiah", usfm: "NEH" }, { name: "esther", usfm: "EST" }, { name: "job", usfm: "JOB" },
  { name: "psalms", usfm: "PSA" }, { name: "proverbs", usfm: "PRO" }, { name: "ecclesiastes", usfm: "ECC" },
  { name: "song of solomon", usfm: "SNG" }, { name: "isaiah", usfm: "ISA" }, { name: "jeremiah", usfm: "JER" },
  { name: "lamentations", usfm: "LAM" }, { name: "ezekiel", usfm: "EZK" }, { name: "daniel", usfm: "DAN" },
  { name: "hosea", usfm: "HOS" }, { name: "joel", usfm: "JOL" }, { name: "amos", usfm: "AMO" },
  { name: "obadiah", usfm: "OBA" }, { name: "jonah", usfm: "JON" }, { name: "micah", usfm: "MIC" },
  { name: "nahum", usfm: "NAM" }, { name: "habakkuk", usfm: "HAB" }, { name: "zephaniah", usfm: "ZEP" },
  { name: "haggai", usfm: "HAG" }, { name: "zechariah", usfm: "ZEC" }, { name: "malachi", usfm: "MAL" },
  { name: "matthew", usfm: "MAT" }, { name: "mark", usfm: "MRK" }, { name: "luke", usfm: "LUK" },
  { name: "john", usfm: "JHN" }, { name: "acts", usfm: "ACT" }, { name: "romans", usfm: "ROM" },
  { name: "1 corinthians", usfm: "1CO" }, { name: "2 corinthians", usfm: "2CO" }, { name: "galatians", usfm: "GAL" },
  { name: "ephesians", usfm: "EPH" }, { name: "philippians", usfm: "PHP" }, { name: "colossians", usfm: "COL" },
  { name: "1 thessalonians", usfm: "1TH" }, { name: "2 thessalonians", usfm: "2TH" }, { name: "1 timothy", usfm: "1TI" },
  { name: "2 timothy", usfm: "2TI" }, { name: "titus", usfm: "TIT" }, { name: "philemon", usfm: "PHM" },
  { name: "hebrews", usfm: "HEB" }, { name: "james", usfm: "JAS" }, { name: "1 peter", usfm: "1PE" },
  { name: "2 peter", usfm: "2PE" }, { name: "1 john", usfm: "1JN" }, { name: "2 john", usfm: "2JN" },
  { name: "3 john", usfm: "3JN" }, { name: "jude", usfm: "JUD" }, { name: "revelation", usfm: "REV" },
];

const SERVER_BIBLE_LANGUAGES: Record<
  string,
  { label: string; translationLabel: string; helloaoId?: string; getBibleKey?: string; rtl?: boolean }
> = {
  en: { label: "English", translationLabel: "World English Bible (WEB)" },
  ta: { label: "Tamil (தமிழ்)", translationLabel: "தமிழ் வேதாகமம் (Indian Revised Version)", helloaoId: "tam_irv" },
  ml: { label: "Malayalam (മലയാളം)", translationLabel: "സത്യവേദപുസ്തകം (Malayalam 1910)", getBibleKey: "mal1910", helloaoId: "mal_bib" },
  fr: { label: "French (Français)", translationLabel: "Louis Segond 1910 (Français)", getBibleKey: "ls1910", helloaoId: "fra_lsg" },
  hi: { label: "Hindi (हिन्दी)", translationLabel: "हिन्दी बाइबिल (Indian Revised Version)", helloaoId: "HINIRV" },
  te: { label: "Telugu (తెలుగు)", translationLabel: "తెలుగు బైబిల్ (Indian Revised Version)", helloaoId: "tel_irv" },
  kn: { label: "Kannada (ಕನ್ನಡ)", translationLabel: "ಕನ್ನಡ ಬೈಬಲ್ (Indian Revised Version)", helloaoId: "kan_irv" },
  bn: { label: "Bengali (বাংলা)", translationLabel: "বাংলা বাইবেল (Indian Revised Version)", helloaoId: "ben_irv" },
  mr: { label: "Marathi (मराठी)", translationLabel: "मराठी बायबल (Indian Revised Version)", helloaoId: "mar_irv" },
  gu: { label: "Gujarati (ગુજરાતી)", translationLabel: "ગુજરાતી બાઇબલ (Indian Revised Version)", helloaoId: "guj_irv" },
  pa: { label: "Punjabi (ਪੰਜਾਬੀ)", translationLabel: "ਪੰਜਾਬੀ ਬਾਈਬਲ (Indian Revised Version)", helloaoId: "pan_irv" },
  or: { label: "Odia (ଓଡ଼ିଆ)", translationLabel: "ଓଡ଼ିଆ ବାଇବଲ (Indian Revised Version)", helloaoId: "ory_irv" },
  ur: { label: "Urdu (اردو)", translationLabel: "کتابِ مقدّس (Urdu Bible)", helloaoId: "urd_gvu", rtl: true },
  es: { label: "Spanish (Español)", translationLabel: "Reina Valera 1909 (Español)", getBibleKey: "valera" },
  de: { label: "German (Deutsch)", translationLabel: "Luther Bibel (Deutsch)", getBibleKey: "luther1545" },
  pt: { label: "Portuguese (Português)", translationLabel: "Almeida Atualizada (Português)", getBibleKey: "almeida" },
  zh: { label: "Chinese (中文)", translationLabel: "和合本 (Chinese Union)", getBibleKey: "cus" },
  ko: { label: "Korean (한국어)", translationLabel: "개역한글 (Korean Bible)", getBibleKey: "korean" },
  ar: { label: "Arabic (العربية)", translationLabel: "الكتاب المقدس (Arabic Smith & Van Dyke)", getBibleKey: "arabicsv", rtl: true },
  he: { label: "Hebrew (עברית)", translationLabel: "תנ״ך והברית החדשה (Modern Hebrew)", getBibleKey: "modernhebrew", rtl: true },
  el: { label: "Greek (Ελληνικά)", translationLabel: "Η Αγία Γραφή (Greek)", getBibleKey: "moderngreek" },
};

function flattenHelloAoVerseContent(content: any[]): string {
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part.text === "string") return part.text;
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchEnglishCanonicalChapter(book: string, chapter: number) {
  const enCacheKey = `${book.toLowerCase()}::${chapter}::en`;
  if (bibleChapterCache.has(enCacheKey)) {
    return bibleChapterCache.get(enCacheKey);
  }
  const queryStr = encodeURIComponent(`${book} ${chapter}`);
  const apiUrl = `https://bible-api.com/${queryStr}?translation=web`;
  const upstream = await fetch(apiUrl, {
    headers: { "User-Agent": "MOED-Gospel-Partner-App/1.0" },
  });
  if (!upstream.ok) {
    throw new Error(`Could not load ${book} chapter ${chapter} (${upstream.status})`);
  }
  const data = await upstream.json();
  const payload = {
    reference: data.reference || `${book} ${chapter}`,
    translation_name: data.translation_name || "World English Bible (WEB)",
    languageCode: "en",
    languageLabel: "English",
    rtl: false,
    verses: Array.isArray(data.verses)
      ? data.verses.map((v: any) => ({
          book_name: v.book_name || book,
          chapter: Number(v.chapter) || chapter,
          verse: Number(v.verse) || 1,
          text: String(v.text || "").trim(),
        }))
      : [],
  };
  if (payload.verses.length > 0) {
    bibleChapterCache.set(enCacheKey, payload);
    persistBibleCache();
  }
  return payload;
}

// Live 66-Book Multilingual Holy Bible Chapter endpoint (cached on memory + disk)
app.get("/api/bible/chapter", async (req, res) => {
  const book = String(req.query.book || "John").trim();
  const chapter = Math.max(1, Number(req.query.chapter) || 1);
  const lang = String(req.query.lang || "en").trim().toLowerCase();
  const parallel = String(req.query.parallel || "false") === "true";
  const langMeta = SERVER_BIBLE_LANGUAGES[lang] || SERVER_BIBLE_LANGUAGES.en;
  const effectiveLang = SERVER_BIBLE_LANGUAGES[lang] ? lang : "en";
  const cacheKey = `${book.toLowerCase()}::${chapter}::${effectiveLang}`;

  const attachParallelIfRequested = async (payload: any) => {
    if (!parallel || effectiveLang === "en") return payload;
    try {
      const enData = await fetchEnglishCanonicalChapter(book, chapter);
      const enByVerse = new Map<number, string>();
      (enData?.verses || []).forEach((ev: any) => enByVerse.set(Number(ev.verse), ev.text));
      return {
        ...payload,
        verses: (payload.verses || []).map((v: any) => ({
          ...v,
          englishText: enByVerse.get(Number(v.verse)) || v.englishText || "",
        })),
      };
    } catch {
      return payload;
    }
  };

  if (bibleChapterCache.has(cacheKey)) {
    const cachedPayload = bibleChapterCache.get(cacheKey);
    return res.json(await attachParallelIfRequested(cachedPayload));
  }

  const bookIdx = CANONICAL_BOOKS_USFM.findIndex((b) => b.name === book.toLowerCase());
  const bookNumber = Number(req.query.bookNumber) || (bookIdx >= 0 ? bookIdx + 1 : 43);
  const usfmCode =
    CANONICAL_BOOKS_USFM[bookNumber - 1]?.usfm ||
    CANONICAL_BOOKS_USFM[bookIdx]?.usfm ||
    "JHN";

  try {
    if (effectiveLang === "en") {
      const enPayload = await fetchEnglishCanonicalChapter(book, chapter);
      return res.json(enPayload);
    }

    // 1. Try getbible.net/v2 when mapped (Malayalam, French, Spanish, German, Portuguese, Chinese, Korean, Arabic, Hebrew, Greek)
    if (langMeta.getBibleKey) {
      try {
        const gbUrl = `https://api.getbible.net/v2/${encodeURIComponent(langMeta.getBibleKey)}/${bookNumber}/${chapter}.json`;
        const gbRes = await fetch(gbUrl, {
          headers: { "User-Agent": "MOED-Gospel-Partner-App/1.0" },
        });
        if (gbRes.ok) {
          const gbData = await gbRes.json();
          if (Array.isArray(gbData?.verses) && gbData.verses.length > 0) {
            const payload = {
              reference: `${book} ${chapter}`,
              translation_name: langMeta.translationLabel,
              languageCode: effectiveLang,
              languageLabel: langMeta.label,
              rtl: Boolean(langMeta.rtl),
              verses: gbData.verses.map((v: any) => ({
                book_name: book,
                chapter: Number(v.chapter) || chapter,
                verse: Number(v.verse) || 1,
                text: String(v.text || "").trim(),
              })),
            };
            bibleChapterCache.set(cacheKey, payload);
            persistBibleCache();
            return res.json(await attachParallelIfRequested(payload));
          }
        }
      } catch (gbErr) {
        console.warn(`getbible.net fallback for ${effectiveLang} ${book} ${chapter}:`, gbErr);
      }
    }

    // 2. Try bible.helloao.org open Indian Revised Version & Contemporary translations (Tamil, Hindi, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi, Odia, Urdu, etc.)
    if (langMeta.helloaoId) {
      try {
        const haUrl = `https://bible.helloao.org/api/${encodeURIComponent(langMeta.helloaoId)}/${usfmCode}/${chapter}.json`;
        const haRes = await fetch(haUrl, {
          headers: { "User-Agent": "MOED-Gospel-Partner-App/1.0" },
        });
        if (haRes.ok) {
          const haData = await haRes.json();
          const rawContent = haData?.chapter?.content;
          if (Array.isArray(rawContent)) {
            const parsedVerses = rawContent
              .filter((item: any) => item?.type === "verse" && item?.number)
              .map((item: any) => ({
                book_name: book,
                chapter,
                verse: Number(item.number),
                text: flattenHelloAoVerseContent(item.content),
              }))
              .filter((v: any) => v.text.length > 0);

            if (parsedVerses.length > 0) {
              const payload = {
                reference: `${book} ${chapter}`,
                translation_name: langMeta.translationLabel,
                languageCode: effectiveLang,
                languageLabel: langMeta.label,
                rtl: Boolean(langMeta.rtl),
                verses: parsedVerses,
              };
              bibleChapterCache.set(cacheKey, payload);
              persistBibleCache();
              return res.json(await attachParallelIfRequested(payload));
            }
          }
        }
      } catch (haErr) {
        console.warn(`helloao fallback for ${effectiveLang} ${book} ${chapter}:`, haErr);
      }
    }

    // 3. Gemini AI translation fallback over canonical English verses if an upstream chapter wasn't covered
    const enData = await fetchEnglishCanonicalChapter(book, chapter);
    const verses = enData.verses || [];
    if (verses.length === 0) {
      return res.status(404).json({ error: `Could not load ${book} chapter ${chapter}` });
    }

    const ai = getGeminiClient();
    const translatedVerses: any[] = [];
    const CHUNK_SIZE = 35;

    for (let i = 0; i < verses.length; i += CHUNK_SIZE) {
      const chunk = verses.slice(i, i + CHUNK_SIZE);
      const inputJson = JSON.stringify(chunk.map((v: any) => ({ verse: v.verse, text: v.text })));

      const aiRes = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Translate every verse of this Holy Bible chapter (${book} Chapter ${chapter}) faithfully, reverently, and naturally into ${langMeta.label} (${langMeta.translationLabel}) using traditional Scripture terminology.
Preserve exact verse numbers 1-for-1. Return JSON matching the schema.

Verses to translate:
${inputJson}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    verse: { type: Type.INTEGER },
                    text: { type: Type.STRING },
                  },
                  required: ["verse", "text"],
                },
              },
            },
            required: ["verses"],
          },
        },
      });

      const parsedChunk = JSON.parse(aiRes.text || "{}");
      const outMap = new Map<number, string>();
      (parsedChunk.verses || []).forEach((item: any) => {
        outMap.set(Number(item.verse), String(item.text || "").trim());
      });

      chunk.forEach((orig: any) => {
        translatedVerses.push({
          book_name: orig.book_name || book,
          chapter,
          verse: Number(orig.verse),
          text: outMap.get(Number(orig.verse)) || orig.text,
        });
      });
    }

    const payload = {
      reference: `${book} ${chapter}`,
      translation_name: langMeta.translationLabel,
      languageCode: effectiveLang,
      languageLabel: langMeta.label,
      rtl: Boolean(langMeta.rtl),
      verses: translatedVerses,
    };

    bibleChapterCache.set(cacheKey, payload);
    persistBibleCache();
    return res.json(await attachParallelIfRequested(payload));
  } catch (error: any) {
    console.error("Failed to fetch Bible chapter:", error);
    return res.status(502).json({
      error: "Unable to load this Scripture chapter right now. Please try again shortly.",
      details: error?.message || String(error),
    });
  }
});

// Hebrew & Greek meaning breakdown for any selected Bible verse
app.post("/api/bible/hebrew-meaning", async (req, res) => {
  try {
    const { reference, verseText, testament = "Old Testament" } = req.body || {};
    if (!reference || !verseText) {
      return res.status(400).json({ error: "Bible reference and verse text are required." });
    }

    const ai = getGeminiClient();
    const origLang = testament === "Old Testament" ? "Hebrew" : "Koine Greek (plus OT Hebrew roots)";

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Analyze this Bible verse with original ${origLang} linguistic precision and warm Jewish/Gospel depth:
Reference: ${reference}
Verse: "${verseText}"

Provide:
1. originalLanguage: "Hebrew" or "Koine Greek"
2. keyWords: 3 to 4 key words from this verse with englishWord, originalScript (authentic Hebrew with niqqud or Greek script), transliteration, strongsNumber, rootMeaning, and theologicalDepth.
3. rabbiHistoricalContext: 2-3 sentences from a Jewish historical / Torah scholar lens explaining cultural custom, synagogue usage, or ancient Near Eastern setting.
4. gospelFulfillment: 2 sentences connecting this verse to the love and saving grace of Jesus Christ.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalLanguage: { type: Type.STRING },
            keyWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  englishWord: { type: Type.STRING },
                  originalScript: { type: Type.STRING },
                  transliteration: { type: Type.STRING },
                  strongsNumber: { type: Type.STRING },
                  rootMeaning: { type: Type.STRING },
                  theologicalDepth: { type: Type.STRING },
                },
                required: ["englishWord", "originalScript", "transliteration", "rootMeaning", "theologicalDepth"],
              },
            },
            rabbiHistoricalContext: { type: Type.STRING },
            gospelFulfillment: { type: Type.STRING },
          },
          required: ["originalLanguage", "keyWords", "rabbiHistoricalContext", "gospelFulfillment"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      reference,
      ...parsed,
    });
  } catch (error: any) {
    console.error("Error generating verse Hebrew/Greek meaning:", error);
    return res.status(500).json({
      error: "Could not analyze Hebrew/Greek root words right now.",
      details: error?.message || String(error),
    });
  }
});

// Rabbi / Jewish Historical Background Commentary Explorer
app.post("/api/bible/rabbi-history", async (req, res) => {
  try {
    const { queryText } = req.body || {};
    if (!queryText || !String(queryText).trim()) {
      return res.status(400).json({ error: "Please enter a Bible passage, feast, or Jewish historical topic." });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `You are a reverent Biblical historian & Jewish background scholar explaining ancient Torah, Second Temple Judea, synagogue customs, and Jewish roots so Christians fall deeper in love with God's Word and Jesus Christ.
Topic / Passage Asked: "${String(queryText).trim()}"

Provide an accurate, respectful historical lesson covering:
- title
- hebrewTerm
- hebrewScript (authentic Hebrew characters)
- era (e.g. Exodus / First Temple / Second Temple Galilee)
- torahOrScriptureRefs
- summary (2-3 clear sentences)
- rabbiPerspectiveDetails (3 concise historical bullet points)
- jewishCustomsExplained (practical explanation of how Israel practiced or understood this)
- fulfillmentInJesus (warm Gospel connection showing how Jesus fulfills this truth)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hebrewTerm: { type: Type.STRING },
            hebrewScript: { type: Type.STRING },
            era: { type: Type.STRING },
            torahOrScriptureRefs: { type: Type.STRING },
            summary: { type: Type.STRING },
            rabbiPerspectiveDetails: { type: Type.ARRAY, items: { type: Type.STRING } },
            jewishCustomsExplained: { type: Type.STRING },
            fulfillmentInJesus: { type: Type.STRING },
          },
          required: [
            "title",
            "hebrewTerm",
            "hebrewScript",
            "era",
            "torahOrScriptureRefs",
            "summary",
            "rabbiPerspectiveDetails",
            "jewishCustomsExplained",
            "fulfillmentInJesus",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      id: `rabbi-custom-${Date.now().toString(36)}`,
      ...parsed,
    });
  } catch (error: any) {
    console.error("Error generating Rabbi historical commentary:", error);
    return res.status(500).json({
      error: "Failed to load historical Jewish background commentary.",
      details: error?.message || String(error),
    });
  }
});

// Lookup ANY Biblical person's complete separated story
app.post("/api/bible/character-story", async (req, res) => {
  try {
    const { personName } = req.body || {};
    if (!personName || !String(personName).trim()) {
      return res.status(400).json({ error: "Please enter a Biblical person's name." });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Write a deeply faithful, historically grounded Bible biography profile for the Biblical person: "${String(personName).trim()}".
Include their Hebrew or Greek name, name meaning, category (one of: "Patriarchs & Matriarchs", "Judges & Prophets", "Kings & Poets", "Women of Faith", "Apostles & Witnesses", "Encounters with Jesus"), historical era, exact key chapters, an anchor verse, a rich 3-sentence lifeSummary, 3-4 chronological keyTurningPoints, 2-3 spiritualLessons, and a Christ-centered gospelConnection.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            hebrewOrGreekName: { type: Type.STRING },
            nameMeaning: { type: Type.STRING },
            category: { type: Type.STRING },
            era: { type: Type.STRING },
            keyChapters: { type: Type.STRING },
            anchorVerse: { type: Type.STRING },
            lifeSummary: { type: Type.STRING },
            keyTurningPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            spiritualLessons: { type: Type.ARRAY, items: { type: Type.STRING } },
            gospelConnection: { type: Type.STRING },
          },
          required: [
            "name",
            "hebrewOrGreekName",
            "nameMeaning",
            "category",
            "era",
            "keyChapters",
            "anchorVerse",
            "lifeSummary",
            "keyTurningPoints",
            "spiritualLessons",
            "gospelConnection",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      id: `story-custom-${Date.now().toString(36)}`,
      ...parsed,
    });
  } catch (error: any) {
    console.error("Error generating Bible character story:", error);
    return res.status(500).json({
      error: "Could not retrieve Bible story right now.",
      details: error?.message || String(error),
    });
  }
});

// Guest/local Custom Biblical Card Templates persistence endpoints
app.get("/api/custom-templates", (req, res) => {
  res.json(partnerStore.customTemplates);
});

app.post("/api/custom-templates", (req, res) => {
  const card = req.body;
  if (!card || !card.cardId || !card.title) {
    return res.status(400).json({ error: "Card ID and title are required." });
  }
  const saved = {
    ...card,
    updatedAt: new Date().toISOString(),
  };
  partnerStore.customTemplates = [
    saved,
    ...partnerStore.customTemplates.filter((c) => c.cardId !== saved.cardId),
  ].slice(0, 100);
  saveStore(partnerStore);
  res.json(saved);
});

app.delete("/api/custom-templates/:id", (req, res) => {
  partnerStore.customTemplates = partnerStore.customTemplates.filter(
    (c) => c.cardId !== req.params.id
  );
  saveStore(partnerStore);
  res.json({ success: true });
});

// Gospel Book Releases Showcase endpoints
app.get("/api/book-releases", (req, res) => {
  res.json(partnerStore.bookReleases);
});

app.post("/api/book-releases", (req, res) => {
  const book = req.body;
  if (!book || !book.bookId || !book.title) {
    return res.status(400).json({ error: "Book ID and title are required." });
  }
  const saved = {
    ...book,
    createdAt: book.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  partnerStore.bookReleases = [
    saved,
    ...partnerStore.bookReleases.filter((b) => b.bookId !== saved.bookId),
  ].slice(0, 50);
  saveStore(partnerStore);
  res.json(saved);
});

app.delete("/api/book-releases/:id", (req, res) => {
  partnerStore.bookReleases = partnerStore.bookReleases.filter(
    (b) => b.bookId !== req.params.id
  );
  saveStore(partnerStore);
  res.json({ success: true });
});

// Live YouTube Channel Feed endpoint for @jesusneverfails7649
app.get("/api/youtube/videos", async (req, res) => {
  try {
    const force = req.query.refresh === "true" || req.query.refresh === "1";
    const videos = await fetchLiveYouTubeChannelVideos(force);
    res.json({
      success: true,
      channelName: "Jesus Never Fails",
      channelHandle: "@jesusneverfails7649",
      channelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
      channelId: YOUTUBE_CHANNEL_ID,
      videos,
      fetchedAt: new Date(cachedVideos.fetchedAt || Date.now()).toISOString(),
    });
  } catch (error: any) {
    console.error("Failed to fetch live YouTube videos:", error);
    res.status(502).json({
      success: false,
      channelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
      videos: cachedVideos.videos || [],
      error: error.message || "Could not refresh YouTube feed",
    });
  }
});

// Live Prayer Wall fallback/sync API for guest partners
app.get("/api/prayer-requests", (req, res) => {
  res.json(partnerStore.prayerRequests);
});

app.post("/api/prayer-requests", (req, res) => {
  const { authorName, message, topicTitle } = req.body || {};
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: "Prayer request message is required" });
  }
  const item = {
    id: `prayer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    authorUid: "partner-guest",
    authorName: String(authorName || "Gospel Partner").trim().slice(0, 80),
    message: String(message).trim().slice(0, 1000),
    topicTitle: String(topicTitle || "General Fellowship Prayer").slice(0, 180),
    amenCount: 0,
    createdAt: new Date().toISOString(),
  };
  partnerStore.prayerRequests = [item, ...partnerStore.prayerRequests].slice(0, 50);
  saveStore(partnerStore);
  res.json(item);
});

app.post("/api/prayer-requests/:id/amen", (req, res) => {
  const target = partnerStore.prayerRequests.find((p) => p.id === req.params.id);
  if (!target) {
    return res.status(404).json({ error: "Prayer request not found" });
  }
  target.amenCount = (Number(target.amenCount) || 0) + 1;
  saveStore(partnerStore);
  res.json(target);
});

// Live Fellowships sync API for guest partners
app.get("/api/fellowships", (req, res) => {
  res.json(partnerStore.fellowships);
});

app.post("/api/fellowships", (req, res) => {
  const group = req.body;
  if (!group || !group.name) {
    return res.status(400).json({ error: "Fellowship name is required" });
  }
  const saved = {
    ...group,
    id: group.id || `fellowship-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  partnerStore.fellowships = [saved, ...partnerStore.fellowships.filter((f) => f.id !== saved.id)];
  saveStore(partnerStore);
  res.json(saved);
});

app.get("/api/sessions", (req, res) => {
  res.json(Array.from(sessionsMap.values()));
});

app.get("/api/sessions/:id", (req, res) => {
  const session = sessionsMap.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Gospel study session not found" });
  }
  res.json(session);
});

app.post("/api/sessions", (req, res) => {
  const session = req.body;
  if (!session || !session.id) {
    return res.status(400).json({ error: "Invalid Gospel study object" });
  }
  sessionsMap.set(session.id, session);
  persistSessions();
  res.json({ success: true, id: session.id });
});

// Generate complete live Gospel study module & attach real @jesusneverfails7649 videos
app.post("/api/generate-gospel-module", async (req, res) => {
  try {
    const {
      topic,
      pillar = "Faith & Miracles",
      scriptureBook = "Gospels & Epistles",
      fellowshipName = "Jesus Never Fails Gospel Partners",
      prompt = "",
      documentText = "",
      imageBase64,
      imageMimeType = "image/jpeg",
      sourceVideoId,
      sourceVideoTitle,
      sourceVideoUrl,
    } = req.body;

    if (!topic && !prompt && !documentText && !imageBase64 && !sourceVideoTitle) {
      return res.status(400).json({ error: "Please provide a Scripture topic, video, sermon notes, or image" });
    }

    // Grab latest live channel videos so suggested videos use real video IDs when available
    let liveChannelVideos: any[] = [];
    try {
      liveChannelVideos = await fetchLiveYouTubeChannelVideos(false);
    } catch {
      liveChannelVideos = [];
    }

    const ai = getGeminiClient();
    const effectiveTopic = topic || sourceVideoTitle || "Jesus Never Fails Gospel Message";

    const systemPrompt = `You are a Christ-centered, Scripture-faithful Gospel study curator and Bible pastor serving the "Jesus Never Fails" YouTube Gospel Partner community (${JESUS_NEVER_FAILS_CHANNEL_URL}).
Generate a deeply encouraging, biblically grounded interactive Gospel study module. Everything must be rooted in the Holy Bible and the Gospel of Jesus Christ.

Gospel Pillar: ${pillar}
Scripture Focus: ${scriptureBook}
Target Gospel Topic: ${effectiveTopic}
Fellowship Context: ${fellowshipName}
Additional Guidance: ${prompt || "Comprehensive Scripture-centered devotional & interactive partner study"}

Requirements:
1. title: Reverent, inspiring Gospel title for the topic.
2. anchorVerse: One full key Bible verse with book, chapter, and verse reference.
3. channelReference: "Jesus Never Fails (@jesusneverfails7649)".
4. suggestedVideos: 2 to 3 suggested video topics tailored to Jesus Never Fails matching this exact topic (title, duration, category: "Sermon" | "Prayer & Deliverance" | "Worship Song" | "Bible Teaching", scriptureReference, and description).
5. summary: 2-3 sentences explaining the Gospel truth and how Jesus Christ is revealed in this passage.
6. definitions: 3 to 4 key Biblical or Greek/Hebrew terms with definition, analogy, formula (Bible references & root word), and example.
7. flashcards: 4 Scripture memory verse cards with front, back, category (verse reference), and hint.
8. quiz: 4 multiple-choice Bible & Gospel comprehension questions with 4 options, correctIndex, explanation, points, timeLimitSeconds.
9. assertionReasons: 2 Scripture Assertion-Reason questions with assertion, reason, correctOption ('A'|'B'|'C'|'D'), explanation, conceptTip.
10. caseBasedQuestions: 1 Biblical narrative/parable Case Study with title, casePassage, and 2 subQuestions with modelAnswer, marks, explanation.
11. giveReasons: 1 to 2 "Give Biblical Reason" apologetics/faith questions with statement, reasonPoints, scientificKeywordFocus (key theological terms), modelAnswer, marks.
12. differentiations: 1 Biblical contrast table with topicHeading, conceptA, conceptB, rows (parameter, conceptAValue, conceptBValue), keyTakeaway.
13. shortAnswers: 2 short Scripture reflection questions with question, marks, keyPointsRequired, modelAnswer, markingScheme.
14. longAnswers: 1 deep sermon reflection prompt with question, marks, structuralGuideline, modelAnswer, rubricBreakdown.
15. practiceExercises: 2 prayer/personal testimony reflection tasks with modelAnswer and keyRubrics.
16. studyNotes: 2 to 3 structured devotional study sections with title, bullets, and formulaBox (Anchor Verse).
17. quickTips: 3 practical daily Christian walk applications.
18. prayerPoints: Concise prayer points summary (under 40 words).`;

    const contents: any[] = [];

    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64,
        },
      });
    }

    let userText = `Create a live Gospel Partner interactive study module for: ${effectiveTopic}.`;
    if (documentText) {
      userText += `\n\nReference Sermon Notes / Bible Text:\n${documentText.slice(0, 15000)}`;
    }
    if (prompt) {
      userText += `\n\nPartner Study Focus:\n${prompt}`;
    }

    contents.push({ text: userText });

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            anchorVerse: { type: Type.STRING },
            channelReference: { type: Type.STRING },
            summary: { type: Type.STRING },
            suggestedVideos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  category: { type: Type.STRING },
                  scriptureReference: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["title", "category", "scriptureReference", "description"],
              },
            },
            definitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  analogy: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ["term", "definition"],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  category: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ["front", "back", "category"],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                  timeLimitSeconds: { type: Type.INTEGER },
                },
                required: ["question", "options", "correctIndex", "explanation"],
              },
            },
            assertionReasons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  assertion: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  correctOption: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  conceptTip: { type: Type.STRING },
                },
                required: ["assertion", "reason", "correctOption", "explanation"],
              },
            },
            caseBasedQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  casePassage: { type: Type.STRING },
                  subQuestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        modelAnswer: { type: Type.STRING },
                        marks: { type: Type.INTEGER },
                        explanation: { type: Type.STRING },
                      },
                      required: ["question", "modelAnswer", "marks"],
                    },
                  },
                },
                required: ["title", "casePassage", "subQuestions"],
              },
            },
            giveReasons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  statement: { type: Type.STRING },
                  reasonPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                  scientificKeywordFocus: { type: Type.ARRAY, items: { type: Type.STRING } },
                  modelAnswer: { type: Type.STRING },
                  marks: { type: Type.INTEGER },
                },
                required: ["statement", "reasonPoints", "scientificKeywordFocus", "modelAnswer", "marks"],
              },
            },
            differentiations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topicHeading: { type: Type.STRING },
                  conceptA: { type: Type.STRING },
                  conceptB: { type: Type.STRING },
                  rows: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        parameter: { type: Type.STRING },
                        conceptAValue: { type: Type.STRING },
                        conceptBValue: { type: Type.STRING },
                      },
                      required: ["parameter", "conceptAValue", "conceptBValue"],
                    },
                  },
                  keyTakeaway: { type: Type.STRING },
                },
                required: ["topicHeading", "conceptA", "conceptB", "rows"],
              },
            },
            shortAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  marks: { type: Type.INTEGER },
                  keyPointsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
                  modelAnswer: { type: Type.STRING },
                  markingScheme: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        step: { type: Type.STRING },
                        marksAllocated: { type: Type.NUMBER },
                      },
                      required: ["step", "marksAllocated"],
                    },
                  },
                },
                required: ["question", "marks", "modelAnswer"],
              },
            },
            longAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  marks: { type: Type.INTEGER },
                  structuralGuideline: { type: Type.STRING },
                  modelAnswer: { type: Type.STRING },
                  rubricBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        criterion: { type: Type.STRING },
                        marks: { type: Type.NUMBER },
                      },
                      required: ["criterion", "marks"],
                    },
                  },
                },
                required: ["question", "marks", "modelAnswer"],
              },
            },
            practiceExercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  type: { type: Type.STRING },
                  maxScore: { type: Type.INTEGER },
                  modelAnswer: { type: Type.STRING },
                  keyRubrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["question", "modelAnswer", "keyRubrics"],
              },
            },
            studyNotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                  formulaBox: { type: Type.STRING },
                },
                required: ["title", "bullets"],
              },
            },
            quickTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            prayerPoints: { type: Type.STRING },
          },
          required: [
            "title",
            "summary",
            "definitions",
            "flashcards",
            "quiz",
            "practiceExercises",
            "studyNotes",
            "quickTips",
          ],
        },
      },
    });

    const rawText = response.text || "{}";
    const parsed = JSON.parse(rawText);

    const sessionId = `gospel-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const randomMeetCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

    const builtSuggested = [];
    if (sourceVideoId && sourceVideoTitle) {
      builtSuggested.push({
        id: `yt-src-${sourceVideoId}`,
        videoId: sourceVideoId,
        title: sourceVideoTitle,
        channelName: "Jesus Never Fails",
        channelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
        videoSearchUrl: sourceVideoUrl || `https://www.youtube.com/watch?v=${sourceVideoId}`,
        embedUrl: `https://www.youtube.com/embed/${sourceVideoId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${sourceVideoId}/hqdefault.jpg`,
        duration: "Channel Video",
        category: "Bible Teaching",
        scriptureReference: scriptureBook,
        description: "Featured live upload from @jesusneverfails7649 interlinked with this Gospel study.",
      });
    }

    (parsed.suggestedVideos || []).forEach((v: any, idx: number) => {
      const matchedLive = liveChannelVideos[idx % (liveChannelVideos.length || 1)];
      builtSuggested.push({
        id: `yt-gen-${idx + 1}`,
        videoId: matchedLive?.videoId,
        title: v.title || matchedLive?.title || `Jesus Never Fails: ${effectiveTopic}`,
        channelName: "Jesus Never Fails",
        channelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
        videoSearchUrl:
          matchedLive?.url ||
          `${JESUS_NEVER_FAILS_CHANNEL_URL}/search?query=${encodeURIComponent(v.title || effectiveTopic)}`,
        embedUrl: matchedLive?.embedUrl,
        thumbnailUrl: matchedLive?.thumbnailUrl,
        duration: v.duration || "Watch on Channel",
        category: v.category || "Sermon",
        scriptureReference: v.scriptureReference || scriptureBook,
        description: v.description || "Biblical message and encouragement from Jesus Never Fails (@jesusneverfails7649).",
      });
    });

    const newSession = {
      id: sessionId,
      title: parsed.title || effectiveTopic,
      pillar,
      scriptureBook,
      anchorVerse: parsed.anchorVerse || "Jesus Christ is the same yesterday, today, and forever. — Hebrews 13:8",
      topic: effectiveTopic,
      channelReference: "Jesus Never Fails (@jesusneverfails7649)",
      youtubeChannelUrl: JESUS_NEVER_FAILS_CHANNEL_URL,
      suggestedVideos: builtSuggested,
      fellowshipName,
      createdAt: new Date().toISOString().split("T")[0],
      googleMeetUrl: `https://meet.google.com/${randomMeetCode}`,
      isLiveNow: true,
      summary: parsed.summary || "",
      definitions: (parsed.definitions || []).map((d: any, idx: number) => ({ ...d, id: `def-${idx + 1}` })),
      flashcards: (parsed.flashcards || []).map((f: any, idx: number) => ({ ...f, id: `fc-${idx + 1}` })),
      quiz: (parsed.quiz || []).map((q: any, idx: number) => ({
        ...q,
        id: `q-${idx + 1}`,
        points: q.points || 1000,
        timeLimitSeconds: q.timeLimitSeconds || 20,
      })),
      assertionReasons: (parsed.assertionReasons || []).map((a: any, idx: number) => ({ ...a, id: `ar-${idx + 1}` })),
      caseBasedQuestions: (parsed.caseBasedQuestions || []).map((c: any, idx: number) => ({
        ...c,
        id: `cbq-${idx + 1}`,
        subQuestions: (c.subQuestions || []).map((sq: any, sIdx: number) => ({
          ...sq,
          id: `cbq-${idx + 1}-s-${sIdx + 1}`,
        })),
      })),
      giveReasons: (parsed.giveReasons || []).map((g: any, idx: number) => ({ ...g, id: `gr-${idx + 1}` })),
      differentiations: (parsed.differentiations || []).map((d: any, idx: number) => ({ ...d, id: `diff-${idx + 1}` })),
      shortAnswers: (parsed.shortAnswers || []).map((sa: any, idx: number) => ({ ...sa, id: `sa-${idx + 1}` })),
      longAnswers: (parsed.longAnswers || []).map((la: any, idx: number) => ({ ...la, id: `la-${idx + 1}` })),
      practiceExercises: (parsed.practiceExercises || []).map((e: any, idx: number) => ({
        ...e,
        id: `ex-${idx + 1}`,
        maxScore: e.maxScore || 5,
      })),
      studyNotes: parsed.studyNotes || [],
      quickTips: parsed.quickTips || [],
      prayerPoints: parsed.prayerPoints || "Pray for grace, faith, and boldness in Christ Jesus.",
    };

    sessionsMap.set(sessionId, newSession);
    persistSessions();

    return res.json({
      success: true,
      sessionId,
      session: newSession,
    });
  } catch (error: any) {
    console.error("Error generating Gospel module:", error);
    res.status(500).json({
      error: "Failed to generate Gospel study module",
      details: error.message || String(error),
    });
  }
});

// Evaluate partner's prayer journal / Scripture reflection using Gemini
app.post("/api/check-writing-answer", async (req, res) => {
  try {
    const { question, modelAnswer, studentAnswer, keyRubrics = [], maxScore = 5 } = req.body;

    if (!studentAnswer || !studentAnswer.trim()) {
      return res.status(400).json({ error: "Please write your reflection or prayer before submitting." });
    }

    const ai = getGeminiClient();
    const prompt = `You are a warm, encouraging Bible study pastor reviewing a Gospel partner's Scripture reflection or prayer response.
Prompt: ${question}
Max Alignment Points: ${maxScore}
Sample Biblical Reflection: ${modelAnswer}
Key Spiritual Themes: ${JSON.stringify(keyRubrics)}

Gospel Partner's Written Reflection:
"${studentAnswer}"

Respond lovingly and biblically:
1. Assign an integer alignment score between 0 and ${maxScore}.
2. Provide 2 sentences of warm, Scripture-encouraging feedback.
3. List 1-2 spiritual strengths in their reflection.
4. List 1-2 Scriptures or suggestions to deepen their walk.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            maxScore: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "maxScore", "feedback", "strengths", "improvements"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error reviewing Gospel reflection:", error);
    res.status(500).json({
      error: "Failed to review Gospel reflection",
      details: error.message || String(error),
    });
  }
});

// Gospel AI Bible Study & Partner Chat
app.post("/api/ai-tutor-chat", async (req, res) => {
  try {
    const { message, topic, pillar, scriptureBook, role = "believer" } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are a warm, Scripture-grounded Gospel Study Guide serving the "Jesus Never Fails" Gospel Partner community (${JESUS_NEVER_FAILS_CHANNEL_URL}).
Current Pillar: ${pillar || "Gospel & Scripture"} (${scriptureBook || "Holy Bible"}).
Current Gospel Topic: "${topic}".
Participant role: ${role}.
Answer questions clearly from the Holy Bible with grace, compassion, accurate verses, and encouragement that Jesus Christ never fails. Encourage partners to watch related worship & Bible challenge videos on @jesusneverfails7649.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({
      reply: response.text || "May the grace and peace of the Lord Jesus Christ strengthen your heart today.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  } catch (error: any) {
    console.error("Error in Gospel mentor chat:", error);
    res.status(500).json({
      error: "Failed to generate Gospel guidance reply",
      details: error.message || String(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) return next();
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MOED Gospel Partner Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
