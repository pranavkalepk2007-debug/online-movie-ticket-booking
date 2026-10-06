import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import toast from 'react-hot-toast';
import Page from '@/client/components/Page';
import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import { Clock, MapPin, Calendar, Ticket, XCircle } from 'lucide-react';

type Booking = {
  _id: string;
  seats: string[];
  totalAmount: number;
  bookingStatus: string;
  bookingDate: Date;
  movie: {
    title: string;
    posterUrl: string;
  } | null;
  theater: {
    name: string;
    location: string;
  } | null;
  showTime: Date | null;
};

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function BookingCard({
  booking,
  onCancel,
  isCancelling,
}: {
  booking: Booking;
  onCancel: (bookingId: string) => void;
  isCancelling: boolean;
}) {
  const isPast = booking.showTime && new Date(booking.showTime) < new Date();
  const isCancelled = booking.bookingStatus === 'cancelled';

  return (
    <Card className={`overflow-hidden ${isCancelled ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-32 sm:flex-shrink-0">
          <img
            src={booking.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop'}
            alt={booking.movie?.title || 'Movie'}
            className="w-full h-32 sm:h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop';
            }}
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{booking.movie?.title || 'Unknown Movie'}</h3>
              <div className="mt-1 text-sm text-gray-600">
                {booking.theater && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {booking.theater.name}, {booking.theater.location}
                  </p>
                )}
                {booking.showTime && (
                  <p className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateTime(booking.showTime)}
                  </p>
                )}
              </div>
            </div>
            {isCancelled ? (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                Cancelled
              </span>
            ) : isPast ? (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                Completed
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                Confirmed
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-rose-600">
              <Ticket className="w-4 h-4" />
              <span className="font-medium">{booking.seats.sort().join(', ')}</span>
            </div>
            <div className="font-semibold">Rs. {booking.totalAmount}</div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Booked on {formatDate(booking.bookingDate)}
            </p>
            <div className="flex gap-2">
              <Link to={`/booking/${booking._id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
              {!isCancelled && !isPast && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(booking._id)}
                  disabled={isCancelling}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function MyBookingsPage() {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    ...modelenceQuery<Booking[]>('movies.getMyBookings'),
  });

  const { mutate: cancelBooking, isPending: isCancelling } = useMutation({
    ...modelenceMutation('movies.cancelBooking'),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: createQueryKey('movies.getMyBookings') });
    },
    onError: (error) => {
      toast.error((error as Error).message || 'Failed to cancel booking');
    },
  });

  const handleCancel = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking({ bookingId });
    }
  };

  const upcomingBookings = bookings?.filter(
    (b) => b.bookingStatus !== 'cancelled' && b.showTime && new Date(b.showTime) >= new Date()
  );
  const pastBookings = bookings?.filter(
    (b) => b.bookingStatus === 'cancelled' || (b.showTime && new Date(b.showTime) < new Date())
  );

  return (
    <Page className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-8">
            {upcomingBookings && upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-600" />
                  Upcoming Bookings
                </h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onCancel={handleCancel}
                      isCancelling={isCancelling}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastBookings && pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-600">Past Bookings</h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onCancel={handleCancel}
                      isCancelling={isCancelling}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
            <p className="text-gray-500 mt-1">
              Start exploring movies and book your first ticket!
            </p>
            <Link to="/">
              <Button className="mt-4 bg-rose-600 hover:bg-rose-700 text-white">
                Browse Movies
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </Page>
  );
}
