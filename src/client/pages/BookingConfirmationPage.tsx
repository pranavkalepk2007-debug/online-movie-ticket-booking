import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import Page from '@/client/components/Page';
import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import { CheckCircle, Clock, MapPin, Calendar, Ticket, Film, CreditCard, Smartphone, BadgeCheck } from 'lucide-react';

type Booking = {
  _id: string;
  seats: string[];
  totalAmount: number;
  bookingStatus: string;
  bookingDate: Date;
  // Payment details
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string;
  cardLast4?: string;
  cardType?: string;
  upiId?: string;
  movie: {
    _id: string;
    title: string;
    posterUrl: string;
    duration: number;
    rating: string;
    language: string;
  };
  theater: {
    _id: string;
    name: string;
    location: string;
  };
  showTime: Date;
};

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getCardTypeName(cardType: string | undefined): string {
  switch (cardType) {
    case 'visa': return 'Visa';
    case 'mastercard': return 'Mastercard';
    case 'amex': return 'American Express';
    case 'discover': return 'Discover';
    default: return 'Card';
  }
}

function PaymentStatusBadge({ status }: { status: string | undefined }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <BadgeCheck className="w-3 h-3" />
        Paid
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        Pending
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Failed
      </span>
    );
  }
  return null;
}

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const { data: booking, isLoading } = useQuery({
    ...modelenceQuery<Booking>('movies.getBooking', { bookingId }),
    enabled: !!bookingId,
  });

  return (
    <Page className="bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        ) : booking ? (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
              <p className="text-gray-500 mt-1">Your tickets have been booked successfully</p>
            </div>

            {/* Ticket Card */}
            <Card className="overflow-hidden">
              <div className="bg-rose-600 text-white p-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  <span className="font-semibold">E-Ticket</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-4">
                  <img
                    src={booking.movie.posterUrl}
                    alt={booking.movie.title}
                    className="w-24 h-36 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop';
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{booking.movie.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {booking.movie.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {booking.movie.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        {booking.movie.language}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 my-6"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Theater</p>
                    <p className="font-medium">{booking.theater.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.theater.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Show Time</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDateTime(booking.showTime)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 my-6"></div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Seats</p>
                    <p className="text-lg font-bold text-rose-600">
                      {booking.seats.sort().join(', ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.seats.length} ticket{booking.seats.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                    <p className="text-2xl font-bold">Rs. {booking.totalAmount}</p>
                  </div>
                </div>

                {/* Payment Details Section */}
                {booking.transactionId && (
                  <>
                    <div className="border-t border-dashed border-gray-200 my-6"></div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase">Payment Details</h3>
                        <PaymentStatusBadge status={booking.paymentStatus} />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Transaction ID</span>
                          <span className="font-mono font-medium text-gray-900">{booking.transactionId}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Payment Method</span>
                          <span className="flex items-center gap-2 font-medium text-gray-900">
                            {booking.paymentMethod === 'upi' ? (
                              <>
                                <Smartphone className="w-4 h-4 text-purple-600" />
                                UPI
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                {getCardTypeName(booking.cardType)}
                              </>
                            )}
                          </span>
                        </div>

                        {booking.paymentMethod === 'upi' && booking.upiId && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">UPI ID</span>
                            <span className="font-medium text-gray-900">{booking.upiId}</span>
                          </div>
                        )}

                        {booking.paymentMethod === 'card' && booking.cardLast4 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Card</span>
                            <span className="font-medium text-gray-900">
                              **** **** **** {booking.cardLast4}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount Paid</span>
                          <span className="font-bold text-green-600">Rs. {booking.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="border-t border-dashed border-gray-200 my-6"></div>

                <div className="text-center text-sm text-gray-500">
                  <p>Booking ID: {booking._id}</p>
                  <p className="mt-1">Booked on: {formatDate(booking.bookingDate)}</p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Browse More Movies
                </Button>
              </Link>
              <Link to="/bookings" className="flex-1">
                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                  View My Bookings
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">Booking not found.</div>
        )}
      </div>
    </Page>
  );
}
