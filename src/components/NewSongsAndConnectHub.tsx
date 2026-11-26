import React, { useState } from 'react';
import {
  Music,
  Mic,
  Youtube,
  ExternalLink,
  Globe,
  Share2,
  Briefcase,
  Code2,
  BookMarked,
  Play,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Save,
  Loader2,
  X,
  Cloud,
} from 'lucide-react';
import {
  BookReleaseItem,
  CardTemplateStyle,
  LiveYouTubeVideo,
} from '../types';
import {
  NEW_SONG_RELEASES,
  MINISTRY_SOCIAL_LINKS,
  JEFFRINA_PROFESSION_LINKS,
  JESUS_NEVER_FAILS_HANDLE,
} from '../data/ministryLinks';
import { JESUS_NEVER_FAILS_CHANNEL_URL } from '../data/gospelData';

interface NewSongsAndConnectHubProps {
  liveVideos?: LiveYouTubeVideo[];
  bookReleases?: BookReleaseItem[];
  onSaveBookRelease?: (book: BookReleaseItem) => Promise<void>;
  onDeleteBookRelease?: (bookId: string) => Promise<void>;
  sectionFocus?: 'all' | 'songs' | 'books' | 'socials';
}

const BOOK_COVER_STYLES: Array<{
  id: CardTemplateStyle;
  label: string;
  cardClass: string;
  spineClass: string;
}> = [
  {
    id: 'torah-scroll',
    label: 'Torah Gold',
    cardClass: 'bg-amber-50/75 border-amber-300',
    spineClass: 'bg-amber-900 text-amber-100',
  },
  {
    id: 'classic-alabaster',
    label: 'Alabaster',
    cardClass: 'bg-[#FBF9F5] border-stone-300',
    spineClass: 'bg-stone-900 text-stone-100',
  },
  {
    id: 'sanctuary-rose',
    label: 'Sanctuary Rose',
    cardClass: 'bg-rose-50/75 border-rose-300',
    spineClass: 'bg-rose-800 text-rose-50',
  },
  {
    id: 'lapis-scripture',
    label: 'Lapis Blue',
    cardClass: 'bg-indigo-50/75 border-indigo-300',
    spineClass: 'bg-indigo-900 text-indigo-50',
  },
];

export const NewSongsAndConnectHub: React.FC<NewSongsAndConnectHubProps> = ({
  liveVideos = [],
  bookReleases = [],
  onSaveBookRelease,
  onDeleteBookRelease,
  sectionFocus = 'all',
}) => {
  const [selectedVideo, setSelectedVideo] = useState<LiveYouTubeVideo | null>(null);
  const showSongs = sectionFocus === 'all' || sectionFocus === 'songs';
  const showBooks = sectionFocus === 'all' || sectionFocus === 'books';
  const showSocials = sectionFocus === 'all' || sectionFocus === 'socials';

  // Book Release Publisher Form state
  const [showBookForm, setShowBookForm] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [bookFormError, setBookFormError] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<BookReleaseItem>({
    bookId: `book-${Date.now().toString(36)}`,
    title: '',
    subtitle: '',
    authorName: 'Jeffrina V · Jesus Never Fail Ministries',
    scriptureFocus: '',
    description: '',
    releaseStatus: 'released',
    releaseDateLabel: 'New Release',
    purchaseOrReadUrl: '',
    youtubeTrailerUrl: '',
    coverStyle: 'torah-scroll',
    createdAt: new Date().toISOString(),
  });

  const worshipUploads = liveVideos.filter(
    (v) =>
      /song|worship|praise|sing|psalm|hymn|jesus/i.test(v.title) || liveVideos.indexOf(v) < 4
  );

  const openNewBookForm = () => {
    setEditingBook({
      bookId: `book-${Date.now().toString(36)}`,
      title: '',
      subtitle: '',
      authorName: 'Jeffrina V · Jesus Never Fail Ministries',
      scriptureFocus: '',
      description: '',
      releaseStatus: 'released',
      releaseDateLabel: 'Released Now',
      purchaseOrReadUrl: '',
      youtubeTrailerUrl: '',
      coverStyle: 'torah-scroll',
      createdAt: new Date().toISOString(),
    });
    setBookFormError(null);
    setShowBookForm(true);
  };

  const openEditBookForm = (book: BookReleaseItem) => {
    setEditingBook({ ...book });
    setBookFormError(null);
    setShowBookForm(true);
  };

  const handleSubmitBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook.title.trim() || !editingBook.description.trim()) {
      setBookFormError('Please provide the book title and a brief summary.');
      return;
    }
    if (!onSaveBookRelease) return;
    setSavingBook(true);
    setBookFormError(null);
    try {
      await onSaveBookRelease({
        ...editingBook,
        updatedAt: new Date().toISOString(),
      });
      setShowBookForm(false);
    } catch (err: any) {
      setBookFormError(err?.message || 'Unable to save book release right now.');
    } finally {
      setSavingBook(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top 4 New Song Releases Showcase */}
      {showSongs && (
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-rose-700">New Songs Playlist · 4 Separate Releases</span>
              <span aria-hidden="true">·</span>
              <span>Jesus Never Fail Ministries Worship</span>
              <span aria-hidden="true">·</span>
              <span>StarMaker Singing Collaboration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-editorial">
              New Gospel Song Releases & Worship Collaborations
            </h2>
            <p className="text-sm text-stone-600 max-w-2xl">
              Explore all four dedicated New Song Releases separately, listen directly via @jesusneverfails7649, or sing together on StarMaker.
            </p>
          </div>

          <a
            href={MINISTRY_SOCIAL_LINKS.find((s) => s.id === 'social-starmaker')?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors self-start md:self-center shrink-0"
          >
            <Mic className="w-4 h-4" />
            <span>Collaborate on Singing on StarMaker</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4 Separate New Song Release Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {NEW_SONG_RELEASES.map((song, index) => {
            const matchedLive = worshipUploads[index];
            return (
              <div
                key={song.id}
                className="rounded-2xl border border-stone-200 bg-[#FBF9F5] overflow-hidden flex flex-col sm:flex-row"
              >
                <div className="sm:w-44 h-44 sm:h-auto shrink-0 bg-stone-900 relative overflow-hidden">
                  <img
                    src={song.coverImage}
                    alt={song.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-950/85 text-white text-[11px] font-bold tabular-nums">
                    Release 0{song.releaseNumber}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-amber-800">
                      {song.scriptureAnchor}
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 font-editorial leading-snug">
                      {song.title}
                    </h3>
                    <div className="text-xs font-hebrew font-semibold text-rose-800">
                      {song.hebrewTheme}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed pt-1">
                      {song.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-200/70">
                    {matchedLive ? (
                      <button
                        type="button"
                        onClick={() => setSelectedVideo(matchedLive)}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play Channel Track</span>
                      </button>
                    ) : (
                      <a
                        href={song.listenUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        <span>Listen on YouTube</span>
                      </a>
                    )}

                    <a
                      href={song.starmakerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Sing on StarMaker</span>
                    </a>

                    <a
                      href={song.channelVideoQueryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 inline-flex items-center gap-1"
                    >
                      <Music className="w-3 h-3" />
                      <span>Channel Songs</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inline Video Player when triggered */}
        {selectedVideo && (
          <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-950">
            <div className="aspect-video w-full">
              <iframe
                src={`${selectedVideo.embedUrl}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="px-5 py-3 bg-stone-900 text-white flex items-center justify-between gap-3 text-xs">
              <span className="font-bold font-editorial truncate">{selectedVideo.title}</span>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="text-stone-300 hover:text-white font-semibold shrink-0"
              >
                Close Player
              </button>
            </div>
          </div>
        )}
      </section>
      )}

      {/* Upcoming & Published Gospel Book Releases Shelf */}
      {showBooks && (
      <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-amber-800">Books & Writings</span>
              <span aria-hidden="true">·</span>
              <span>Jesus Never Fail Ministries Publications</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-editorial">
              Gospel Book Releases & Upcoming Publications
            </h2>
            <p className="text-xs text-stone-600">
              Publish your book details, purchase/read link, and YouTube trailer right here as soon as your book releases.
            </p>
          </div>

          {onSaveBookRelease && (
            <button
              type="button"
              onClick={openNewBookForm}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-center shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book Release</span>
            </button>
          )}
        </div>

        {/* Inline Publish / Edit Form */}
        {showBookForm && (
          <form
            onSubmit={handleSubmitBook}
            className="p-5 sm:p-6 rounded-2xl border border-stone-300 bg-[#FBF9F5] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-stone-900 font-editorial">
                Publish or Update Book Release
              </h3>
              <button
                type="button"
                onClick={() => setShowBookForm(false)}
                className="text-stone-500 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookFormError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {bookFormError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  placeholder="Enter your Gospel book title..."
                  className="w-full border border-stone-300 bg-white rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={editingBook.subtitle || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, subtitle: e.target.value })}
                  placeholder="e.g. Walking Daily in Unfailing Grace"
                  className="w-full border border-stone-300 bg-white rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={editingBook.authorName}
                  onChange={(e) => setEditingBook({ ...editingBook, authorName: e.target.value })}
                  className="w-full border border-stone-300 bg-white rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Scripture Anchor & Release Date Label
                </label>
                <input
                  type="text"
                  maxLength={140}
                  value={editingBook.scriptureFocus || ''}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, scriptureFocus: e.target.value })
                  }
                  placeholder="e.g. Hebrews 13:8 · Launching 2026"
                  className="w-full border border-stone-300 bg-white rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Book Description & Message
              </label>
              <textarea
                rows={3}
                required
                maxLength={1500}
                value={editingBook.description}
                onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                placeholder="Share what readers will experience inside this book..."
                className="w-full border border-stone-300 bg-white rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Order / Read Book Link (URL)
                </label>
                <input
                  type="url"
                  maxLength={500}
                  value={editingBook.purchaseOrReadUrl || ''}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, purchaseOrReadUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full border border-stone-300 bg-white rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  YouTube Book Launch Video Link (Optional)
                </label>
                <input
                  type="url"
                  maxLength={500}
                  value={editingBook.youtubeTrailerUrl || ''}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, youtubeTrailerUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/..."
                  className="w-full border border-stone-300 bg-white rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Release Status
                </label>
                <select
                  value={editingBook.releaseStatus}
                  onChange={(e) =>
                    setEditingBook({
                      ...editingBook,
                      releaseStatus: e.target.value as 'upcoming' | 'released',
                    })
                  }
                  className="w-full border border-stone-300 bg-white rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                >
                  <option value="released">Released Now</option>
                  <option value="upcoming">Upcoming / Announced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cover Accent Style
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {BOOK_COVER_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setEditingBook({ ...editingBook, coverStyle: st.id })}
                      className={`py-2 px-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                        editingBook.coverStyle === st.id
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingBook}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                {savingBook ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Publish Book Here</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBookForm(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Book Shelf Display */}
        {bookReleases.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-stone-300 bg-[#FBF9F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-20 rounded-xl bg-amber-900 text-amber-100 flex flex-col items-center justify-center p-2 shrink-0">
                <BookOpen className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase mt-1 tracking-wider">Book</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Ready for Your Book Launch
                </div>
                <h3 className="text-base font-bold text-stone-900 font-editorial">
                  Upcoming Gospel Book Showcase Slot — Jesus Never Fail Ministries
                </h3>
                <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
                  As soon as your book is released, click "Add Book Release" to publish its title, Scripture focus, summary, read/order link, and YouTube trailer directly onto this shelf.
                </p>
              </div>
            </div>

            {onSaveBookRelease && (
              <button
                type="button"
                onClick={openNewBookForm}
                className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-900 inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add When Released</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {bookReleases.map((book) => {
              const styleMeta =
                BOOK_COVER_STYLES.find((s) => s.id === book.coverStyle) || BOOK_COVER_STYLES[0];
              return (
                <div
                  key={book.bookId}
                  className={`rounded-2xl border p-5 sm:p-6 flex gap-4 items-start ${styleMeta.cardClass}`}
                >
                  <div
                    className={`w-20 h-28 rounded-xl p-2.5 flex flex-col justify-between shrink-0 ${styleMeta.spineClass}`}
                  >
                    <BookOpen className="w-4 h-4 opacity-90" />
                    <div className="text-[10px] font-editorial font-bold leading-tight line-clamp-3">
                      {book.title}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold uppercase tracking-wider text-amber-900">
                        {book.releaseStatus === 'released' ? 'Released Now' : 'Upcoming Release'}
                        {book.scriptureFocus ? ` · ${book.scriptureFocus}` : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        {onSaveBookRelease && (
                          <button
                            type="button"
                            onClick={() => openEditBookForm(book)}
                            className="text-stone-600 hover:text-stone-950 inline-flex items-center gap-1 font-semibold"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                        {onDeleteBookRelease && (
                          <button
                            type="button"
                            onClick={() => onDeleteBookRelease(book.bookId)}
                            className="text-rose-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-stone-900 font-editorial leading-snug">
                        {book.title}
                      </h3>
                      {book.subtitle && (
                        <p className="text-xs font-medium text-stone-700">{book.subtitle}</p>
                      )}
                      <p className="text-[11px] text-stone-500 mt-0.5">By {book.authorName}</p>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">{book.description}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {book.purchaseOrReadUrl && (
                        <a
                          href={book.purchaseOrReadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read / Order Book</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {book.youtubeTrailerUrl && (
                        <a
                          href={book.youtubeTrailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Youtube className="w-3.5 h-3.5" />
                          <span>Watch Launch Video</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      )}

      {/* Our Social Media Pages + Connect With Jeffrina */}
      {showSocials && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ministry Social Pages */}
        <section className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <div className="text-xs font-semibold text-rose-700">
                Jesus Never Fail Ministries · {JESUS_NEVER_FAILS_HANDLE}
              </div>
              <h3 className="text-xl font-bold text-stone-900 font-editorial mt-0.5">
                Our Official Ministry Social Pages & Worship Platform
              </h3>
            </div>
            <Share2 className="w-5 h-5 text-stone-400 shrink-0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MINISTRY_SOCIAL_LINKS.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:border-rose-400 transition-colors flex flex-col justify-between gap-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                    {item.platform}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-700" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900 font-editorial">
                    {item.label}
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">{item.handleOrNote}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Connect With Jeffrina V Professionally */}
        <section className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <div className="text-xs font-semibold text-amber-800">
                  Creator & Engineer
                </div>
                <h3 className="text-xl font-bold text-stone-900 font-editorial mt-0.5">
                  Connect With Jeffrina V in Her Profession
                </h3>
              </div>
              <Briefcase className="w-5 h-5 text-amber-800 shrink-0" />
            </div>

            <div className="space-y-3">
              {JEFFRINA_PROFESSION_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-stone-200 bg-[#FBF9F5] hover:border-stone-500 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 text-stone-800">
                      {link.platform === 'Rafoan Cloud' ? (
                        <Cloud className="w-4 h-4 text-amber-800" />
                      ) : link.platform === 'GitHub' ? (
                        <Code2 className="w-4 h-4" />
                      ) : link.platform === 'Portfolio' ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <BookMarked className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-stone-900 font-editorial">
                        {link.label}
                      </div>
                      <div className="text-xs text-stone-500 truncate">
                        {link.handleOrNote}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-stone-900 shrink-0" />
                </a>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>StarMaker Singing #StarMaker</span>
            <a
              href={JESUS_NEVER_FAILS_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-700 font-semibold hover:underline"
            >
              Subscribe @jesusneverfails7649
            </a>
          </div>
        </section>
      </div>
      )}
    </div>
  );
};
