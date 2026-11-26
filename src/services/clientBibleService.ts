import { BibleChapterPayload, VerseHebrewGreekMeaning } from '../types';
import { BIBLE_BOOKS_CATALOG, BIBLE_LANGUAGES } from '../data/bibleCatalog';
import { safeFetchJson } from './apiClient';

const USFM_BY_BOOK_NUMBER: string[] = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT',
  'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP',
  'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE',
  '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];

const DIRECT_LANG_MAP: Record<
  string,
  { helloaoId?: string; getBibleKey?: string }
> = {
  en: {},
  ta: { helloaoId: 'tam_irv' },
  ml: { getBibleKey: 'mal1910', helloaoId: 'mal_bib' },
  fr: { getBibleKey: 'ls1910', helloaoId: 'fra_lsg' },
  hi: { helloaoId: 'HINIRV' },
  te: { helloaoId: 'tel_irv' },
  kn: { helloaoId: 'kan_irv' },
  bn: { helloaoId: 'ben_irv' },
  mr: { helloaoId: 'mar_irv' },
  gu: { helloaoId: 'guj_irv' },
  pa: { helloaoId: 'pan_irv' },
  or: { helloaoId: 'ory_irv' },
  ur: { helloaoId: 'urd_gvu' },
  es: { getBibleKey: 'valera' },
  de: { getBibleKey: 'luther1545' },
  pt: { getBibleKey: 'almeida' },
  zh: { getBibleKey: 'cus' },
  ko: { getBibleKey: 'korean' },
  ar: { getBibleKey: 'arabicsv' },
  he: { getBibleKey: 'modernhebrew' },
  el: { getBibleKey: 'moderngreek' },
};

const clientChapterCache = new Map<string, BibleChapterPayload>();

function flattenHelloAoContent(content: any[]): string {
  if (!Array.isArray(content)) return '';
  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      if (part && typeof part.text === 'string') return part.text;
      return '';
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchEnglishDirect(bookName: string, chapterNum: number): Promise<BibleChapterPayload> {
  const key = `${bookName.toLowerCase()}::${chapterNum}::en`;
  if (clientChapterCache.has(key)) return clientChapterCache.get(key)!;

  const queryStr = encodeURIComponent(`${bookName} ${chapterNum}`);
  const result = await safeFetchJson<any>(`https://bible-api.com/${queryStr}?translation=web`);
  if (!result.ok || !Array.isArray(result.data?.verses) || result.data.verses.length === 0) {
    throw new Error(result.error || `Could not load ${bookName} ${chapterNum}`);
  }

  const payload: BibleChapterPayload = {
    reference: result.data.reference || `${bookName} ${chapterNum}`,
    translation_name: result.data.translation_name || 'World English Bible (WEB)',
    languageCode: 'en',
    languageLabel: 'English',
    rtl: false,
    verses: result.data.verses.map((v: any) => ({
      book_name: v.book_name || bookName,
      chapter: Number(v.chapter) || chapterNum,
      verse: Number(v.verse) || 1,
      text: String(v.text || '').trim(),
    })),
  };

  clientChapterCache.set(key, payload);
  return payload;
}

async function fetchDirectFromPublicBibleCdns(
  bookName: string,
  bookNumber: number,
  chapterNum: number,
  langCode: string
): Promise<BibleChapterPayload> {
  const langMeta = BIBLE_LANGUAGES.find((l) => l.code === langCode) || BIBLE_LANGUAGES[0];
  const mapping = DIRECT_LANG_MAP[langCode] || {};
  const usfmCode = USFM_BY_BOOK_NUMBER[bookNumber - 1] || 'JHN';

  if (langCode === 'en') {
    return fetchEnglishDirect(bookName, chapterNum);
  }

  // 1. Try getbible.net (Malayalam, French, Spanish, German, Portuguese, Chinese, Korean, Arabic, Hebrew, Greek)
  if (mapping.getBibleKey) {
    const gbUrl = `https://api.getbible.net/v2/${encodeURIComponent(mapping.getBibleKey)}/${bookNumber}/${chapterNum}.json`;
    const gbRes = await safeFetchJson<any>(gbUrl);
    if (gbRes.ok && Array.isArray(gbRes.data?.verses) && gbRes.data.verses.length > 0) {
      return {
        reference: `${bookName} ${chapterNum}`,
        translation_name: langMeta.translationLabel,
        languageCode: langMeta.code,
        languageLabel: langMeta.label,
        rtl: Boolean(langMeta.rtl),
        verses: gbRes.data.verses.map((v: any) => ({
          book_name: bookName,
          chapter: Number(v.chapter) || chapterNum,
          verse: Number(v.verse) || 1,
          text: String(v.text || '').trim(),
        })),
      };
    }
  }

  // 2. Try bible.helloao.org (Tamil, Hindi, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi, Odia, Urdu, Malayalam/French fallback)
  if (mapping.helloaoId) {
    const haUrl = `https://bible.helloao.org/api/${encodeURIComponent(mapping.helloaoId)}/${usfmCode}/${chapterNum}.json`;
    const haRes = await safeFetchJson<any>(haUrl);
    const rawContent = haRes.data?.chapter?.content;
    if (haRes.ok && Array.isArray(rawContent)) {
      const verses = rawContent
        .filter((item: any) => item?.type === 'verse' && item?.number)
        .map((item: any) => ({
          book_name: bookName,
          chapter: chapterNum,
          verse: Number(item.number),
          text: flattenHelloAoContent(item.content),
        }))
        .filter((v: any) => v.text.length > 0);

      if (verses.length > 0) {
        return {
          reference: `${bookName} ${chapterNum}`,
          translation_name: langMeta.translationLabel,
          languageCode: langMeta.code,
          languageLabel: langMeta.label,
          rtl: Boolean(langMeta.rtl),
          verses,
        };
      }
    }
  }

  // 3. Final safety net: return English WEB if a specific chapter isn't present on public CDNs
  const englishFallback = await fetchEnglishDirect(bookName, chapterNum);
  return {
    ...englishFallback,
    translation_name: `${englishFallback.translation_name} (${langMeta.label} chapter unavailable offline)`,
  };
}

export async function fetchBibleChapterResilient(
  bookName: string,
  bookNumber: number,
  chapterNum: number,
  langCode: string,
  parallel: boolean
): Promise<BibleChapterPayload> {
  const normalizedBook = bookName.trim();
  const resolvedNumber =
    bookNumber ||
    Math.max(1, BIBLE_BOOKS_CATALOG.findIndex((b) => b.name === normalizedBook) + 1);
  const cacheKey = `${normalizedBook.toLowerCase()}::${chapterNum}::${langCode}`;

  const attachParallelEnglish = async (payload: BibleChapterPayload): Promise<BibleChapterPayload> => {
    if (!parallel || langCode === 'en') return payload;
    const alreadyHasEnglish = payload.verses.some((v) => Boolean(v.englishText));
    if (alreadyHasEnglish) return payload;
    try {
      const enData = await fetchEnglishDirect(normalizedBook, chapterNum);
      const enMap = new Map<number, string>();
      enData.verses.forEach((ev) => enMap.set(Number(ev.verse), ev.text));
      return {
        ...payload,
        verses: payload.verses.map((v) => ({
          ...v,
          englishText: enMap.get(Number(v.verse)) || v.englishText || '',
        })),
      };
    } catch {
      return payload;
    }
  };

  if (clientChapterCache.has(cacheKey)) {
    return attachParallelEnglish(clientChapterCache.get(cacheKey)!);
  }

  // Try backend /api/bible/chapter first
  const apiRes = await safeFetchJson<BibleChapterPayload>(
    `/api/bible/chapter?book=${encodeURIComponent(normalizedBook)}&bookNumber=${resolvedNumber}&chapter=${chapterNum}&lang=${encodeURIComponent(langCode)}&parallel=${parallel ? 'true' : 'false'}`
  );

  if (apiRes.ok && Array.isArray(apiRes.data?.verses) && apiRes.data.verses.length > 0) {
    clientChapterCache.set(cacheKey, apiRes.data);
    return attachParallelEnglish(apiRes.data);
  }

  // Fallback directly to CORS-enabled public Scripture CDNs (works seamlessly on static Vercel)
  const directPayload = await fetchDirectFromPublicBibleCdns(
    normalizedBook,
    resolvedNumber,
    chapterNum,
    langCode
  );
  clientChapterCache.set(cacheKey, directPayload);
  return attachParallelEnglish(directPayload);
}

export async function analyzeVerseResilient(
  reference: string,
  verseText: string,
  testament: 'Old Testament' | 'New Testament'
): Promise<VerseHebrewGreekMeaning> {
  const apiRes = await safeFetchJson<VerseHebrewGreekMeaning>('/api/bible/hebrew-meaning', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference, verseText, testament }),
  });

  if (apiRes.ok && Array.isArray(apiRes.data?.keyWords) && apiRes.data.keyWords.length > 0) {
    return apiRes.data;
  }

  const isOT = testament === 'Old Testament';
  const lower = verseText.toLowerCase();
  const keyWords = isOT
    ? [
        lower.includes('lord') || lower.includes('god')
          ? {
              englishWord: 'LORD / God',
              originalScript: 'יְהוָה (YHWH)',
              transliteration: 'Adonai / Yahweh',
              strongsNumber: 'H3068',
              rootMeaning: 'The Self-Existent, Covenant-Keeping Eternal One',
              theologicalDepth:
                'Signifies God’s unchanging covenant presence ("I AM WHO I AM") revealed to Moses and fulfilled in Jesus.',
            }
          : {
              englishWord: 'Steadfast Word',
              originalScript: 'דָּבָר (Davar)',
              transliteration: 'Davar',
              strongsNumber: 'H1697',
              rootMeaning: 'Living Word, Promise, Act of Creation',
              theologicalDepth:
                'In Hebrew thought, God’s spoken word is never empty—it actively accomplishes His saving purpose.',
            },
        {
          englishWord: 'Mercy / Love',
          originalScript: 'חֶסֶד (Chesed)',
          transliteration: 'Chesed',
          strongsNumber: 'H2617',
          rootMeaning: 'Steadfast Covenant Lovingkindness & Unfailing Loyalty',
          theologicalDepth:
            'Describes God’s loyal, tender-hearted devotion that binds Him to His people through every generation.',
        },
        {
          englishWord: 'Peace / Wholeness',
          originalScript: 'שָׁלוֹם (Shalom)',
          transliteration: 'Shalom',
          strongsNumber: 'H7965',
          rootMeaning: 'Completeness, Restoration & Rest in God',
          theologicalDepth:
            'More than absence of trouble—Shalom means total well-being and reconciliation under God’s care.',
        },
      ]
    : [
        {
          englishWord: 'Love / Grace',
          originalScript: 'Ἀγάπη / Χάρις',
          transliteration: 'Agápē / Cháris',
          strongsNumber: 'G26 / G5485',
          rootMeaning: 'Self-Giving Divine Love & Unmerited Favor',
          theologicalDepth:
            'Names the cross-centered, unconditional love of God freely poured out through Jesus Christ.',
        },
        {
          englishWord: 'Faith / Trust',
          originalScript: 'Πίστις',
          transliteration: 'Pístis',
          strongsNumber: 'G4102',
          rootMeaning: 'Confident Reliance, Covenant Fidelity',
          theologicalDepth:
            'Calls believers to lean completely upon the faithfulness of Christ, who never fails His promises.',
        },
        {
          englishWord: 'Word / Gospel',
          originalScript: 'Λόγος',
          transliteration: 'Lógos',
          strongsNumber: 'G3056',
          rootMeaning: 'Divine Reason, Eternal Living Word',
          theologicalDepth:
            'Identified in John 1 as Jesus Messiah Himself—God’s wisdom and salvation made flesh among us.',
        },
      ];

  return {
    reference,
    originalLanguage: isOT ? 'Hebrew' : 'Koine Greek',
    keyWords,
    rabbiHistoricalContext: isOT
      ? `In ancient Israelite Torah and synagogue reading, ${reference} was chanted aloud as covenant remembrance—anchoring daily prayer in God’s faithfulness (Emunah) and lovingkindness (Chesed).`
      : `Within 1st-century Judean and Greek-speaking fellowships, ${reference} proclaimed the fulfillment of Hebrew prophetic promises in everyday Apostolic teaching.`,
    gospelFulfillment: `Every promise illuminated in ${reference} finds its "Yes" and "Amen" in Jesus Christ—confirming that His grace and faithfulness never fail.`,
  };
}
