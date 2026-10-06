import { Store, schema } from 'modelence/server';

// Movies collection
export const dbMovies = new Store('movies', {
  schema: {
    title: schema.string(),
    description: schema.string(),
    genre: schema.string(),
    duration: schema.number(), // in minutes
    rating: schema.string(), // U, UA, A, etc.
    releaseDate: schema.date(),
    posterUrl: schema.string(),
    language: schema.string(),
    isActive: schema.boolean(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { isActive: 1 } },
    { key: { releaseDate: -1 } },
  ]
});

// Theaters collection
export const dbTheaters = new Store('theaters', {
  schema: {
    name: schema.string(),
    location: schema.string(),
    totalSeats: schema.number(),
    rows: schema.number(),
    seatsPerRow: schema.number(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { location: 1 } },
  ]
});

// Shows collection (movie + theater + time)
export const dbShows = new Store('shows', {
  schema: {
    movieId: schema.objectId(),
    theaterId: schema.objectId(),
    showTime: schema.date(),
    price: schema.number(),
    bookedSeats: schema.array(schema.string()), // e.g., ["A1", "A2", "B5"]
    isActive: schema.boolean(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { movieId: 1 } },
    { key: { theaterId: 1 } },
    { key: { showTime: 1 } },
    { key: { movieId: 1, showTime: 1 } },
  ]
});

// Bookings collection
export const dbBookings = new Store('bookings', {
  schema: {
    userId: schema.userId(),
    showId: schema.objectId(),
    movieId: schema.objectId(),
    theaterId: schema.objectId(),
    seats: schema.array(schema.string()),
    totalAmount: schema.number(),
    bookingStatus: schema.string(), // pending, confirmed, cancelled
    bookingDate: schema.date(),
    // Payment fields
    paymentMethod: schema.string(), // upi, card
    paymentStatus: schema.string(), // pending, completed, failed
    transactionId: schema.string(),
    // Card details (masked)
    cardLast4: schema.string().optional(),
    cardType: schema.string().optional(), // visa, mastercard, etc.
    // UPI details
    upiId: schema.string().optional(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1 } },
    { key: { showId: 1 } },
    { key: { bookingDate: -1 } },
    { key: { transactionId: 1 } },
  ]
});
