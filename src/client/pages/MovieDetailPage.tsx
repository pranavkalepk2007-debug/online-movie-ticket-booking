import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import Page from '@/client/components/Page';
import { Button } from '@/client/components/ui/Button';
import { Clock, Film, Calendar, MapPin, ChevronLeft, Ticket } from 'lucide-react';

type Movie = {
  _id: string;
  title: string;
  description: string;
  genre: string;
  duration: number;
  rating: string;
  releaseDate: Date;
  posterUrl: string;
  language: string;
};

type Show = {
  _id: string;
  showTime: Date;
  price: number;
  theater: {
    _id: string;
    name: string;
    location: string;
  } | null;
  availableSeats: number;
};

function formatDateShort(date: Date) {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function groupShowsByDateAndTheater(shows: Show[]) {
  const grouped: Record<string, Record<string, Show[]>> = {};

  shows.forEach((show) => {
    const dateKey = new Date(show.showTime).toDateString();
    const theaterKey = show.theater?._id || 'unknown';

    if (!grouped[dateKey]) {
      grouped[dateKey] = {};
    }
    if (!grouped[dateKey][theaterKey]) {
      grouped[dateKey][theaterKey] = [];
    }
    grouped[dateKey][theaterKey].push(show);
  });

  return grouped;
}

export default function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: movie, isLoading: movieLoading } = useQuery({
    ...modelenceQuery<Movie>('movies.getMovie', { movieId }),
    enabled: !!movieId,
  });

  const { data: shows, isLoading: showsLoading } = useQuery({
    ...modelenceQuery<Show[]>('movies.getShowsForMovie', { movieId }),
    enabled: !!movieId,
  });

  const isLoading = movieLoading || showsLoading;
  const groupedShows = shows ? groupShowsByDateAndTheater(shows) : {};
  const dates = Object.keys(groupedShows).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Auto-select first date if not selected
  const activeDateKey = selectedDate || dates[0] || null;

  return (
    <Page className="bg-zinc-950 min-h-screen">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500 border-t-transparent"></div>
        </div>
      ) : movie ? (
        <>
          {/* Hero Section with Backdrop */}
          <div className="relative">
            {/* Backdrop Image */}
            <div className="absolute inset-0 h-[400px] md:h-[500px]">
              <img
                src={movie.posterUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=600&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative max-w-6xl mx-auto px-4 pt-6">
              <Link
                to="/"
                className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-8"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Movies
              </Link>

              <div className="flex flex-col md:flex-row gap-8 pb-8">
                {/* Poster */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="w-56 md:w-64 rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop';
                      }}
                    />
                  </div>
                </div>

                {/* Movie Info */}
                <div className="flex-1 text-center md:text-left pt-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    {movie.title}
                  </h1>

                  {/* Meta Tags */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                    <span className="bg-rose-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                      {movie.rating}
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-300 text-sm">
                      <Clock className="w-4 h-4" />
                      {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-300 text-sm">
                      <Film className="w-4 h-4" />
                      {movie.language}
                    </span>
                  </div>

                  {/* Genre Pills */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                    {movie.genre.split('/').map((g, i) => (
                      <span
                        key={i}
                        className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm border border-zinc-700"
                      >
                        {g.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="mt-6 text-zinc-400 leading-relaxed max-w-2xl mx-auto md:mx-0">
                    {movie.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Showtimes Section */}
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-600/20 rounded-lg">
                <Calendar className="w-5 h-5 text-rose-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Select Showtime</h2>
            </div>

            {dates.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 text-lg">No shows available for this movie at the moment.</p>
                <p className="text-zinc-500 text-sm mt-2">Check back later for new showtimes.</p>
              </div>
            ) : (
              <>
                {/* Date Selector */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                  {dates.map((dateKey) => {
                    const isActive = dateKey === activeDateKey;
                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDate(dateKey)}
                        className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                        }`}
                      >
                        {formatDateShort(new Date(dateKey))}
                      </button>
                    );
                  })}
                </div>

                {/* Theaters for Selected Date */}
                {activeDateKey && groupedShows[activeDateKey] && (
                  <div className="space-y-4">
                    {Object.entries(groupedShows[activeDateKey]).map(([theaterId, theaterShows]) => {
                      const theater = theaterShows[0]?.theater;
                      if (!theater) return null;

                      return (
                        <div
                          key={theaterId}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Theater Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-white">{theater.name}</h3>
                              <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{theater.location}</span>
                              </p>
                            </div>

                            {/* Showtimes */}
                            <div className="flex flex-wrap gap-2">
                              {theaterShows
                                .sort((a, b) => new Date(a.showTime).getTime() - new Date(b.showTime).getTime())
                                .map((show) => {
                                  const isSoldOut = show.availableSeats === 0;
                                  return (
                                    <Link
                                      key={show._id}
                                      to={isSoldOut ? '#' : `/seats/${show._id}`}
                                      onClick={(e) => isSoldOut && e.preventDefault()}
                                    >
                                      <Button
                                        variant="outline"
                                        className={`flex flex-col items-center px-5 py-3 h-auto rounded-lg transition-all ${
                                          isSoldOut
                                            ? 'opacity-40 cursor-not-allowed bg-zinc-800 border-zinc-700 text-zinc-500'
                                            : 'bg-zinc-800 border-zinc-700 text-white hover:bg-rose-600 hover:border-rose-600 hover:shadow-lg hover:shadow-rose-600/20'
                                        }`}
                                        disabled={isSoldOut}
                                      >
                                        <span className="font-semibold text-sm">{formatTime(show.showTime)}</span>
                                        <span className="text-xs mt-0.5 opacity-70">
                                          {isSoldOut ? 'Sold Out' : `Rs. ${show.price}`}
                                        </span>
                                      </Button>
                                    </Link>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Film className="w-16 h-16 text-zinc-700 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Movie not found</h2>
          <p className="text-zinc-500 mb-6">The movie you're looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white">
              Browse Movies
            </Button>
          </Link>
        </div>
      )}
    </Page>
  );
}
