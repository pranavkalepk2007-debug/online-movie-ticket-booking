import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import toast from 'react-hot-toast';
import Page from '@/client/components/Page';
import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { ChevronLeft, Clock, MapPin, Calendar, CreditCard, Smartphone, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/client/lib/utils';

type ShowDetails = {
  _id: string;
  showTime: Date;
  price: number;
  bookedSeats: string[];
  movie: {
    _id: string;
    title: string;
    posterUrl: string;
    duration: number;
    rating: string;
  };
  theater: {
    _id: string;
    name: string;
    location: string;
    rows: number;
    seatsPerRow: number;
  };
};

type PaymentMethod = 'upi' | 'card';

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

function generateSeatId(row: number, seat: number): string {
  return `${String.fromCharCode(65 + row)}${seat + 1}`;
}

function SeatGrid({
  rows,
  seatsPerRow,
  bookedSeats,
  selectedSeats,
  onSeatToggle,
}: {
  rows: number;
  seatsPerRow: number;
  bookedSeats: string[];
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Screen */}
      <div className="w-full max-w-md mb-6">
        <div className="h-2 bg-gradient-to-b from-gray-400 to-gray-200 rounded-t-full"></div>
        <p className="text-center text-xs text-gray-500 mt-1">SCREEN</p>
      </div>

      {/* Seats */}
      <div className="overflow-x-auto w-full">
        <div className="inline-flex flex-col gap-2 min-w-fit mx-auto">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2">
              <span className="w-6 text-xs font-medium text-gray-500">
                {String.fromCharCode(65 + rowIndex)}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                  const seatId = generateSeatId(rowIndex, seatIndex);
                  const isBooked = bookedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      onClick={() => !isBooked && onSeatToggle(seatId)}
                      disabled={isBooked}
                      className={cn(
                        'w-7 h-7 text-xs rounded-t-lg border-2 transition-all',
                        isBooked
                          ? 'bg-gray-300 border-gray-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-rose-600 border-rose-700 text-white'
                          : 'bg-white border-gray-300 hover:border-rose-400'
                      )}
                      title={seatId}
                    >
                      {seatIndex + 1}
                    </button>
                  );
                })}
              </div>
              <span className="w-6 text-xs font-medium text-gray-500">
                {String.fromCharCode(65 + rowIndex)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-md bg-white border-2 border-gray-300"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-md bg-rose-600 border-2 border-rose-700"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-md bg-gray-300 border-2 border-gray-400"></div>
          <span className="text-gray-600">Booked</span>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({
  paymentMethod,
  setPaymentMethod,
  upiId,
  setUpiId,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvv,
  setCardCvv,
  cardName,
  setCardName,
}: {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  upiId: string;
  setUpiId: (value: string) => void;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  cardExpiry: string;
  setCardExpiry: (value: string) => void;
  cardCvv: string;
  setCardCvv: (value: string) => void;
  cardName: string;
  setCardName: (value: string) => void;
}) {
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-4">
      {/* Payment Method Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPaymentMethod('upi')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all',
            paymentMethod === 'upi'
              ? 'border-rose-600 bg-rose-50 text-rose-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          )}
        >
          <Smartphone className="w-5 h-5" />
          <span className="font-medium">UPI</span>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('card')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all',
            paymentMethod === 'card'
              ? 'border-rose-600 bg-rose-50 text-rose-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          )}
        >
          <CreditCard className="w-5 h-5" />
          <span className="font-medium">Card</span>
        </button>
      </div>

      {/* UPI Form */}
      {paymentMethod === 'upi' && (
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="upi-id" className="text-sm font-medium text-gray-700">
              UPI ID
            </Label>
            <Input
              id="upi-id"
              type="text"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Enter your UPI ID (e.g., name@paytm, name@gpay)</p>
          </div>
        </div>
      )}

      {/* Card Form */}
      {paymentMethod === 'card' && (
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="card-name" className="text-sm font-medium text-gray-700">
              Cardholder Name
            </Label>
            <Input
              id="card-name"
              type="text"
              placeholder="Name on card"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="card-number" className="text-sm font-medium text-gray-700">
              Card Number
            </Label>
            <div className="relative mt-1">
              <Input
                id="card-number"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="pr-10"
              />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card-expiry" className="text-sm font-medium text-gray-700">
                Expiry Date
              </Label>
              <Input
                id="card-expiry"
                type="text"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="card-cvv" className="text-sm font-medium text-gray-700">
                CVV
              </Label>
              <div className="relative mt-1">
                <Input
                  id="card-cvv"
                  type="password"
                  placeholder="123"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="pr-10"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <Lock className="w-4 h-4 flex-shrink-0" />
        <span>Your payment information is encrypted and secure. We do not store your card details.</span>
      </div>
    </div>
  );
}

export default function SeatSelectionPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const { data: show, isLoading } = useQuery({
    ...modelenceQuery<ShowDetails>('movies.getShowDetails', { showId }),
    enabled: !!showId,
  });

  const { mutate: bookSeats, isPending: isBooking } = useMutation({
    ...modelenceMutation<{ bookingId: string; transactionId: string; paymentStatus: string }>('movies.bookSeats'),
    onSuccess: (data) => {
      toast.success(`Payment successful! Transaction ID: ${data.transactionId}`);
      navigate(`/booking/${data.bookingId}`);
    },
    onError: (error) => {
      toast.error((error as Error).message || 'Payment failed. Please try again.');
    },
  });

  const handleSeatToggle = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleProceedToPayment = () => {
    if (!user) {
      const currentPath = `/seats/${showId}`;
      navigate(`/login?_redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    setShowPayment(true);
  };

  const handlePayment = () => {
    // Validate payment details
    if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return;
      }
    } else {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        toast.error('Please enter a valid expiry date');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return;
      }
      if (!cardName) {
        toast.error('Please enter the cardholder name');
        return;
      }
    }

    bookSeats({
      showId,
      seats: selectedSeats,
      paymentMethod,
      upiId: paymentMethod === 'upi' ? upiId : undefined,
      cardNumber: paymentMethod === 'card' ? cardNumber.replace(/\s/g, '') : undefined,
      cardExpiry: paymentMethod === 'card' ? cardExpiry : undefined,
      cardCvv: paymentMethod === 'card' ? cardCvv : undefined,
      cardName: paymentMethod === 'card' ? cardName : undefined,
    });
  };

  const totalAmount = show ? show.price * selectedSeats.length : 0;

  return (
    <Page className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link
          to={show ? `/movie/${show.movie._id}` : '/'}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Showtimes
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        ) : show ? (
          <>
            {/* Show Info */}
            <Card className="p-4 mb-6">
              <div className="flex gap-4">
                <img
                  src={show.movie.posterUrl}
                  alt={show.movie.title}
                  className="w-16 h-24 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop';
                  }}
                />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold">{show.movie.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {show.movie.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {show.movie.duration} min
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p className="font-medium">{show.theater.name}</p>
                    <p className="text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {show.theater.location}
                    </p>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(show.showTime)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {!showPayment ? (
              <>
                {/* Seat Selection */}
                <Card className="p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4 text-center">Select Your Seats</h2>
                  <SeatGrid
                    rows={show.theater.rows}
                    seatsPerRow={show.theater.seatsPerRow}
                    bookedSeats={show.bookedSeats}
                    selectedSeats={selectedSeats}
                    onSeatToggle={handleSeatToggle}
                  />
                </Card>

                {/* Booking Summary */}
                <Card className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      {selectedSeats.length > 0 ? (
                        <>
                          <p className="text-sm text-gray-600">
                            {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                          </p>
                          <p className="font-medium">
                            Seats: {selectedSeats.sort().join(', ')}
                          </p>
                          <p className="text-lg font-bold text-rose-600 mt-1">
                            Total: Rs. {totalAmount}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">No seats selected</p>
                      )}
                    </div>
                    <Button
                      onClick={handleProceedToPayment}
                      disabled={selectedSeats.length === 0}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-8"
                    >
                      {user ? 'Proceed to Payment' : 'Login to Book'}
                    </Button>
                  </div>
                </Card>
              </>
            ) : (
              <>
                {/* Payment Section */}
                <Card className="p-6 mb-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-700">
                      {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected: {selectedSeats.sort().join(', ')}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                  <PaymentForm
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    upiId={upiId}
                    setUpiId={setUpiId}
                    cardNumber={cardNumber}
                    setCardNumber={setCardNumber}
                    cardExpiry={cardExpiry}
                    setCardExpiry={setCardExpiry}
                    cardCvv={cardCvv}
                    setCardCvv={setCardCvv}
                    cardName={cardName}
                    setCardName={setCardName}
                  />
                </Card>

                {/* Payment Summary */}
                <Card className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount to Pay</p>
                      <p className="text-2xl font-bold text-rose-600">Rs. {totalAmount}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowPayment(false)}
                        disabled={isBooking}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handlePayment}
                        disabled={isBooking}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-8"
                      >
                        {isBooking ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          `Pay Rs. ${totalAmount}`
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">Show not found.</div>
        )}
      </div>
    </Page>
  );
}
