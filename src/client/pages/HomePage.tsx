import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import Page from '@/client/components/Page';
import { Card } from '@/client/components/ui/Card';
import { Clock, Star, Film } from 'lucide-react';

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

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link to={`/movie/${movie._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-[2/3] relative overflow-hidden bg-gray-200">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop';
            }}
          />
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            {movie.rating}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{movie.genre}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.duration} min
            </span>
            <span className="flex items-center gap-1">
              <Film className="w-3 h-3" />
              {movie.language}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  const { data: movies, isLoading, error } = useQuery({
    ...modelenceQuery<Movie[]>('movies.getMovies'),
  });

  const { mutate: seedData, isPending: isSeeding } = useMutation({
    ...modelenceMutation('movies.seedSampleData'),
  });

  const { mutate: addMarathiMovies } = useMutation({
    ...modelenceMutation('movies.addMarathiMovies'),
  });

  const { mutate: updateMoviePoster } = useMutation({
    ...modelenceMutation('movies.updateMoviePoster'),
  });

  // Seed data on first load if no movies exist, or refresh shows if needed
  useEffect(() => {
    if (!isLoading && movies) {
      if (movies.length === 0) {
        seedData({});
      } else {
        // Trigger seed to refresh shows if they're outdated
        seedData({});
        // Add Marathi movies if not already added
        addMarathiMovies({});
        // Update movie posters
        updateMoviePoster({});
      }
    }
  }, [isLoading, movies, seedData, addMarathiMovies, updateMoviePoster]);

  return (
    <Page className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="py-8">
          <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold">Book Movie Tickets</h1>
            <p className="mt-2 text-rose-100 max-w-xl">
              Discover and book tickets for the latest movies at theaters near you.
              Experience the magic of cinema!
            </p>
          </div>
        </div>

        {/* Movies Section */}
        <div className="pb-8">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-semibold">Now Showing</h2>
          </div>

          {isLoading || isSeeding ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Error loading movies. Please try again.
            </div>
          ) : movies && movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No movies available at the moment.
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
