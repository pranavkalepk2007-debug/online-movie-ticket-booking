import z from 'zod';
import { AuthError } from 'modelence';
import { Module, ObjectId, UserInfo } from 'modelence/server';
import { dbMovies, dbTheaters, dbShows, dbBookings } from './db';

export default new Module('movies', {
  stores: [dbMovies, dbTheaters, dbShows, dbBookings],

  queries: {
    // Get all active movies
    getMovies: async () => {
      const movies = await dbMovies.fetch({ isActive: true }, { sort: { releaseDate: -1 } });
      return movies.map((movie) => ({
        _id: movie._id.toString(),
        title: movie.title,
        description: movie.description,
        genre: movie.genre,
        duration: movie.duration,
        rating: movie.rating,
        releaseDate: movie.releaseDate,
        posterUrl: movie.posterUrl,
        language: movie.language,
      }));
    },

    // Get single movie details
    getMovie: async (args: unknown) => {
      const { movieId } = z.object({ movieId: z.string() }).parse(args);
      const movie = await dbMovies.requireOne({ _id: new ObjectId(movieId) });
      return {
        _id: movie._id.toString(),
        title: movie.title,
        description: movie.description,
        genre: movie.genre,
        duration: movie.duration,
        rating: movie.rating,
        releaseDate: movie.releaseDate,
        posterUrl: movie.posterUrl,
        language: movie.language,
      };
    },

    // Get shows for a movie
    getShowsForMovie: async (args: unknown) => {
      const { movieId } = z.object({ movieId: z.string() }).parse(args);
      const now = new Date();

      const shows = await dbShows.fetch({
        movieId: new ObjectId(movieId),
        isActive: true,
        showTime: { $gte: now },
      }, { sort: { showTime: 1 } });

      // Get all theater IDs
      const theaterIds = [...new Set(shows.map((s) => s.theaterId.toString()))];
      const theaters = await dbTheaters.fetch({
        _id: { $in: theaterIds.map((id) => new ObjectId(id)) },
      });
      const theaterMap = new Map(theaters.map((t) => [t._id.toString(), t]));

      return shows.map((show) => {
        const theater = theaterMap.get(show.theaterId.toString());
        return {
          _id: show._id.toString(),
          showTime: show.showTime,
          price: show.price,
          theater: theater ? {
            _id: theater._id.toString(),
            name: theater.name,
            location: theater.location,
          } : null,
          availableSeats: theater ? theater.totalSeats - show.bookedSeats.length : 0,
        };
      });
    },

    // Get show details with seat info
    getShowDetails: async (args: unknown) => {
      const { showId } = z.object({ showId: z.string() }).parse(args);
      const show = await dbShows.requireOne({ _id: new ObjectId(showId) });
      const theater = await dbTheaters.requireOne({ _id: show.theaterId });
      const movie = await dbMovies.requireOne({ _id: show.movieId });

      return {
        _id: show._id.toString(),
        showTime: show.showTime,
        price: show.price,
        bookedSeats: show.bookedSeats,
        movie: {
          _id: movie._id.toString(),
          title: movie.title,
          posterUrl: movie.posterUrl,
          duration: movie.duration,
          rating: movie.rating,
        },
        theater: {
          _id: theater._id.toString(),
          name: theater.name,
          location: theater.location,
          rows: theater.rows,
          seatsPerRow: theater.seatsPerRow,
        },
      };
    },

    // Get user's bookings
    getMyBookings: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const bookings = await dbBookings.fetch(
        { userId: new ObjectId(user.id) },
        { sort: { bookingDate: -1 } }
      );

      // Get all movie and theater IDs
      const movieIds = [...new Set(bookings.map((b) => b.movieId.toString()))];
      const theaterIds = [...new Set(bookings.map((b) => b.theaterId.toString()))];
      const showIds = [...new Set(bookings.map((b) => b.showId.toString()))];

      const [movies, theaters, shows] = await Promise.all([
        dbMovies.fetch({ _id: { $in: movieIds.map((id) => new ObjectId(id)) } }),
        dbTheaters.fetch({ _id: { $in: theaterIds.map((id) => new ObjectId(id)) } }),
        dbShows.fetch({ _id: { $in: showIds.map((id) => new ObjectId(id)) } }),
      ]);

      const movieMap = new Map(movies.map((m) => [m._id.toString(), m]));
      const theaterMap = new Map(theaters.map((t) => [t._id.toString(), t]));
      const showMap = new Map(shows.map((s) => [s._id.toString(), s]));

      return bookings.map((booking) => {
        const movie = movieMap.get(booking.movieId.toString());
        const theater = theaterMap.get(booking.theaterId.toString());
        const show = showMap.get(booking.showId.toString());

        return {
          _id: booking._id.toString(),
          seats: booking.seats,
          totalAmount: booking.totalAmount,
          bookingStatus: booking.bookingStatus,
          bookingDate: booking.bookingDate,
          movie: movie ? {
            title: movie.title,
            posterUrl: movie.posterUrl,
          } : null,
          theater: theater ? {
            name: theater.name,
            location: theater.location,
          } : null,
          showTime: show?.showTime || null,
        };
      });
    },

    // Get single booking details
    getBooking: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const { bookingId } = z.object({ bookingId: z.string() }).parse(args);
      const booking = await dbBookings.requireOne({ _id: new ObjectId(bookingId) });

      if (booking.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      const [movie, theater, show] = await Promise.all([
        dbMovies.requireOne({ _id: booking.movieId }),
        dbTheaters.requireOne({ _id: booking.theaterId }),
        dbShows.requireOne({ _id: booking.showId }),
      ]);

      return {
        _id: booking._id.toString(),
        seats: booking.seats,
        totalAmount: booking.totalAmount,
        bookingStatus: booking.bookingStatus,
        bookingDate: booking.bookingDate,
        // Payment details
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId,
        cardLast4: booking.cardLast4,
        cardType: booking.cardType,
        upiId: booking.upiId,
        movie: {
          _id: movie._id.toString(),
          title: movie.title,
          posterUrl: movie.posterUrl,
          duration: movie.duration,
          rating: movie.rating,
          language: movie.language,
        },
        theater: {
          _id: theater._id.toString(),
          name: theater.name,
          location: theater.location,
        },
        showTime: show.showTime,
      };
    },
  },

  mutations: {
    // Book seats for a show with payment
    bookSeats: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const paymentSchema = z.object({
        showId: z.string(),
        seats: z.array(z.string()),
        paymentMethod: z.enum(['upi', 'card']),
        // UPI fields
        upiId: z.string().optional(),
        // Card fields
        cardNumber: z.string().optional(),
        cardExpiry: z.string().optional(),
        cardCvv: z.string().optional(),
        cardName: z.string().optional(),
      });

      const { showId, seats, paymentMethod, upiId, cardNumber } = paymentSchema.parse(args);

      if (seats.length === 0) {
        throw new Error('Please select at least one seat');
      }

      // Validate payment details
      if (paymentMethod === 'upi' && !upiId) {
        throw new Error('UPI ID is required');
      }
      if (paymentMethod === 'card' && !cardNumber) {
        throw new Error('Card number is required');
      }

      const show = await dbShows.requireOne({ _id: new ObjectId(showId) });

      // Check if seats are available
      const unavailableSeats = seats.filter((seat) => show.bookedSeats.includes(seat));
      if (unavailableSeats.length > 0) {
        throw new Error(`Seats ${unavailableSeats.join(', ')} are already booked`);
      }

      // Generate transaction ID
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Simulate payment processing (in production, integrate with payment gateway)
      const paymentSuccess = true; // Simulated success

      if (!paymentSuccess) {
        throw new Error('Payment failed. Please try again.');
      }

      // Update show with booked seats
      await dbShows.updateOne(
        { _id: new ObjectId(showId) },
        { $push: { bookedSeats: { $each: seats } } }
      );

      // Detect card type from card number
      const getCardType = (num: string): string => {
        if (num.startsWith('4')) return 'visa';
        if (num.startsWith('5')) return 'mastercard';
        if (num.startsWith('37') || num.startsWith('34')) return 'amex';
        if (num.startsWith('6')) return 'discover';
        return 'card';
      };

      // Create booking with payment details
      const booking = await dbBookings.insertOne({
        userId: new ObjectId(user.id),
        showId: new ObjectId(showId),
        movieId: show.movieId,
        theaterId: show.theaterId,
        seats,
        totalAmount: show.price * seats.length,
        bookingStatus: 'confirmed',
        bookingDate: new Date(),
        paymentMethod,
        paymentStatus: 'completed',
        transactionId,
        cardLast4: paymentMethod === 'card' && cardNumber ? cardNumber.slice(-4) : undefined,
        cardType: paymentMethod === 'card' && cardNumber ? getCardType(cardNumber) : undefined,
        upiId: paymentMethod === 'upi' ? upiId : undefined,
        createdAt: new Date(),
      });

      return {
        bookingId: booking.insertedId.toString(),
        transactionId,
        paymentStatus: 'completed'
      };
    },

    // Cancel booking
    cancelBooking: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const { bookingId } = z.object({ bookingId: z.string() }).parse(args);
      const booking = await dbBookings.requireOne({ _id: new ObjectId(bookingId) });

      if (booking.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      if (booking.bookingStatus === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      // Remove seats from show
      await dbShows.updateOne(
        { _id: booking.showId },
        { $pull: { bookedSeats: { $in: booking.seats } } }
      );

      // Update booking status
      await dbBookings.updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { bookingStatus: 'cancelled' } }
      );

      return { success: true };
    },

    // Update movie posters
    updateMoviePoster: async () => {
      // Update Mulshi Pattern
      const mulshi = await dbMovies.findOne({ title: 'Mulshi Pattern' });
      if (mulshi) {
        await dbMovies.updateOne(
          { _id: mulshi._id },
          { $set: { posterUrl: 'https://img.airtel.tv/unsafe/fit-in/500x0/filters:format(webp)/https://xstreamcp-assets-msp.streamready.in/assets/ZEEFIVE/MOVIE/66ff63013692ed5c68789ff7/images/rsz630x945withlogo96bb13bf802c4ea8a1d5ba2568b0391a.jpg?o=production' } }
        );
      }

      // Update Lai Bhaari
      const laiBhaari = await dbMovies.findOne({ title: 'Lai Bhaari' });
      if (laiBhaari) {
        await dbMovies.updateOne(
          { _id: laiBhaari._id },
          { $set: { posterUrl: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSX36APy5_xuAAeSSBqfdIPglR2Y6LFE0JqYuexMh4t3WgAN3Zh' } }
        );
      }

      // Update Natsamrat
      const natsamrat = await dbMovies.findOne({ title: 'Natsamrat' });
      if (natsamrat) {
        await dbMovies.updateOne(
          { _id: natsamrat._id },
          { $set: { posterUrl: 'https://media.themoviedb.org/t/p/w300_and_h450_face/idpdndC9eRM4CLH3rttMaMAeXv.jpg' } }
        );
      }

      // Update Fandry
      const fandry = await dbMovies.findOne({ title: 'Fandry' });
      if (fandry) {
        await dbMovies.updateOne(
          { _id: fandry._id },
          { $set: { posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjM5MDYwNDIzNF5BMl5BanBnXkFtZTgwMjc3MjQ2NDE@._V1_.jpg' } }
        );
      }

      // Update Sairat
      const sairat = await dbMovies.findOne({ title: 'Sairat' });
      if (sairat) {
        await dbMovies.updateOne(
          { _id: sairat._id },
          { $set: { posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a1/Sairat_Marathi_Film_Poster.jpg/250px-Sairat_Marathi_Film_Poster.jpg' } }
        );
      }

      return { message: 'Movie posters updated' };
    },

    // Add Marathi movies to existing database
    addMarathiMovies: async () => {
      // Check if Marathi movies already exist
      const existingMarathi = await dbMovies.fetch({ language: 'Marathi' }, { limit: 1 });
      if (existingMarathi.length > 0) {
        return { message: 'Marathi movies already added' };
      }

      const marathiMovies = [
        {
          title: 'Sairat',
          description: 'A romantic drama about two young people from different castes who fall in love and face the consequences of their forbidden relationship in rural Maharashtra.',
          genre: 'Romance/Drama',
          duration: 175,
          rating: 'UA',
          releaseDate: new Date('2016-04-29'),
          posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a1/Sairat_Marathi_Film_Poster.jpg/250px-Sairat_Marathi_Film_Poster.jpg',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Natsamrat',
          description: 'An aging theater actor struggles with his fading glory and complicated relationships with his children after retirement.',
          genre: 'Drama',
          duration: 161,
          rating: 'UA',
          releaseDate: new Date('2016-01-01'),
          posterUrl: 'https://media.themoviedb.org/t/p/w300_and_h450_face/idpdndC9eRM4CLH3rttMaMAeXv.jpg',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Lai Bhaari',
          description: 'A young man discovers his true identity and must embrace his destiny as he fights against powerful enemies to protect his family.',
          genre: 'Action/Drama',
          duration: 152,
          rating: 'UA',
          releaseDate: new Date('2014-07-11'),
          posterUrl: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSX36APy5_xuAAeSSBqfdIPglR2Y6LFE0JqYuexMh4t3WgAN3Zh',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Mulshi Pattern',
          description: 'A farmer\'s son turns to crime after his family loses their land to urbanization, exploring the dark side of rapid development in Maharashtra.',
          genre: 'Crime/Drama',
          duration: 150,
          rating: 'A',
          releaseDate: new Date('2018-08-03'),
          posterUrl: 'https://img.airtel.tv/unsafe/fit-in/500x0/filters:format(webp)/https://xstreamcp-assets-msp.streamready.in/assets/ZEEFIVE/MOVIE/66ff63013692ed5c68789ff7/images/rsz630x945withlogo96bb13bf802c4ea8a1d5ba2568b0391a.jpg?o=production',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Fandry',
          description: 'A young Dalit boy dreams of catching a black sparrow to win the heart of an upper-caste girl, highlighting caste discrimination in rural India.',
          genre: 'Drama',
          duration: 103,
          rating: 'UA',
          releaseDate: new Date('2014-02-14'),
          posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjM5MDYwNDIzNF5BMl5BanBnXkFtZTgwMjc3MjQ2NDE@._V1_.jpg',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Court',
          description: 'A folk singer is arrested for allegedly inciting a sewage worker\'s suicide, leading to a prolonged trial that exposes the Indian judicial system.',
          genre: 'Drama',
          duration: 116,
          rating: 'UA',
          releaseDate: new Date('2015-04-17'),
          posterUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=600&fit=crop',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
      ];

      // Insert Marathi movies
      const insertedMovies = await Promise.all(
        marathiMovies.map((movie) => dbMovies.insertOne(movie))
      );

      // Create shows for the new movies
      const theaters = await dbTheaters.fetch({});
      const showTimes = ['10:00', '13:30', '17:00', '20:30'];
      const prices = [150, 200, 250, 300];

      for (let day = 0; day < 7; day++) {
        for (const movieResult of insertedMovies) {
          for (let i = 0; i < theaters.length; i++) {
            const theater = theaters[i];
            const selectedTimes = showTimes.slice(i % 2, (i % 2) + 2);

            for (const time of selectedTimes) {
              const [hours, minutes] = time.split(':').map(Number);
              const showDate = new Date();
              showDate.setDate(showDate.getDate() + day);
              showDate.setHours(hours, minutes, 0, 0);

              await dbShows.insertOne({
                movieId: movieResult.insertedId,
                theaterId: theater._id,
                showTime: showDate,
                price: prices[Math.floor(Math.random() * prices.length)],
                bookedSeats: [],
                isActive: true,
                createdAt: new Date(),
              });
            }
          }
        }
      }

      return { message: 'Marathi movies added successfully', count: insertedMovies.length };
    },

    // Seed sample data (for initial setup)
    seedSampleData: async () => {
      // Check if data already exists
      const existingMovies = await dbMovies.fetch({}, { limit: 1 });
      if (existingMovies.length > 0) {
        // Check if shows are outdated (all in the past)
        const now = new Date();
        const futureShows = await dbShows.fetch({ showTime: { $gte: now } }, { limit: 1 });
        if (futureShows.length > 0) {
          return { message: 'Data already seeded' };
        }
        // Shows are outdated, refresh them
        await dbShows.deleteMany({});
        const movies = await dbMovies.fetch({});
        const theaters = await dbTheaters.fetch({});

        // Create fresh shows for next 7 days
        const showTimes = ['10:00', '13:30', '17:00', '20:30'];
        const prices = [150, 200, 250, 300];

        for (let day = 0; day < 7; day++) {
          for (const movie of movies) {
            for (let i = 0; i < theaters.length; i++) {
              const theater = theaters[i];
              const selectedTimes = showTimes.slice(i % 2, (i % 2) + 2);

              for (const time of selectedTimes) {
                const [hours, minutes] = time.split(':').map(Number);
                const showDate = new Date();
                showDate.setDate(showDate.getDate() + day);
                showDate.setHours(hours, minutes, 0, 0);

                await dbShows.insertOne({
                  movieId: movie._id,
                  theaterId: theater._id,
                  showTime: showDate,
                  price: prices[Math.floor(Math.random() * prices.length)],
                  bookedSeats: [],
                  isActive: true,
                  createdAt: new Date(),
                });
              }
            }
          }
        }
        return { message: 'Shows refreshed successfully' };
      }

      // Create sample movies
      const movies = [
        {
          title: 'Inception',
          description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
          genre: 'Sci-Fi/Action',
          duration: 148,
          rating: 'UA',
          releaseDate: new Date('2010-07-16'),
          posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
          language: 'English',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'The Dark Knight',
          description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
          genre: 'Action/Drama',
          duration: 152,
          rating: 'UA',
          releaseDate: new Date('2008-07-18'),
          posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
          language: 'English',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Interstellar',
          description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
          genre: 'Sci-Fi/Adventure',
          duration: 169,
          rating: 'UA',
          releaseDate: new Date('2014-11-07'),
          posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
          language: 'English',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Avengers: Endgame',
          description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.',
          genre: 'Action/Adventure',
          duration: 181,
          rating: 'UA',
          releaseDate: new Date('2019-04-26'),
          posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop',
          language: 'English',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Parasite',
          description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
          genre: 'Thriller/Drama',
          duration: 132,
          rating: 'A',
          releaseDate: new Date('2019-05-30'),
          posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
          language: 'Korean',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Dune',
          description: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset while its heir becomes troubled by visions of a dark future.',
          genre: 'Sci-Fi/Adventure',
          duration: 155,
          rating: 'UA',
          releaseDate: new Date('2021-10-22'),
          posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
          language: 'English',
          isActive: true,
          createdAt: new Date(),
        },
        // Marathi Movies
        {
          title: 'Sairat',
          description: 'A romantic drama about two young people from different castes who fall in love and face the consequences of their forbidden relationship in rural Maharashtra.',
          genre: 'Romance/Drama',
          duration: 175,
          rating: 'UA',
          releaseDate: new Date('2016-04-29'),
          posterUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a1/Sairat_Marathi_Film_Poster.jpg/250px-Sairat_Marathi_Film_Poster.jpg',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Natsamrat',
          description: 'An aging theater actor struggles with his fading glory and complicated relationships with his children after retirement.',
          genre: 'Drama',
          duration: 161,
          rating: 'UA',
          releaseDate: new Date('2016-01-01'),
          posterUrl: 'https://media.themoviedb.org/t/p/w300_and_h450_face/idpdndC9eRM4CLH3rttMaMAeXv.jpg',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Lai Bhaari',
          description: 'A young man discovers his true identity and must embrace his destiny as he fights against powerful enemies to protect his family.',
          genre: 'Action/Drama',
          duration: 152,
          rating: 'UA',
          releaseDate: new Date('2014-07-11'),
          posterUrl: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSX36APy5_xuAAeSSBqfdIPglR2Y6LFE0JqYuexMh4t3WgAN3Zh',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Mulshi Pattern',
          description: 'A farmer\'s son turns to crime after his family loses their land to urbanization, exploring the dark side of rapid development in Maharashtra.',
          genre: 'Crime/Drama',
          duration: 150,
          rating: 'A',
          releaseDate: new Date('2018-08-03'),
          posterUrl: 'https://img.airtel.tv/unsafe/fit-in/500x0/filters:format(webp)/https://xstreamcp-assets-msp.streamready.in/assets/ZEEFIVE/MOVIE/66ff63013692ed5c68789ff7/images/rsz630x945withlogo96bb13bf802c4ea8a1d5ba2568b0391a.jpg?o=production',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Fandry',
          description: 'A young Dalit boy dreams of catching a black sparrow to win the heart of an upper-caste girl, highlighting caste discrimination in rural India.',
          genre: 'Drama',
          duration: 103,
          rating: 'UA',
          releaseDate: new Date('2014-02-14'),
          posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjM5MDYwNDIzNF5BMl5BanBnXkFtZTgwMjc3MjQ2NDE@._V1_.jpg',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: 'Court',
          description: 'A folk singer is arrested for allegedly inciting a sewage worker\'s suicide, leading to a prolonged trial that exposes the Indian judicial system.',
          genre: 'Drama',
          duration: 116,
          rating: 'UA',
          releaseDate: new Date('2015-04-17'),
          posterUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=600&fit=crop',
          language: 'Marathi',
          isActive: true,
          createdAt: new Date(),
        },
      ];

      const insertedMovies = await Promise.all(
        movies.map((movie) => dbMovies.insertOne(movie))
      );

      // Create sample theaters
      const theaters = [
        {
          name: 'PVR Cinemas',
          location: 'Phoenix Mall, Downtown',
          totalSeats: 120,
          rows: 10,
          seatsPerRow: 12,
          createdAt: new Date(),
        },
        {
          name: 'INOX',
          location: 'City Center Mall',
          totalSeats: 100,
          rows: 10,
          seatsPerRow: 10,
          createdAt: new Date(),
        },
        {
          name: 'Cinepolis',
          location: 'Grand Plaza',
          totalSeats: 80,
          rows: 8,
          seatsPerRow: 10,
          createdAt: new Date(),
        },
      ];

      const insertedTheaters = await Promise.all(
        theaters.map((theater) => dbTheaters.insertOne(theater))
      );

      // Create sample shows for next 7 days
      const showTimes = ['10:00', '13:30', '17:00', '20:30'];
      const prices = [150, 200, 250, 300];

      for (let day = 0; day < 7; day++) {
        for (const movieResult of insertedMovies) {
          for (let i = 0; i < insertedTheaters.length; i++) {
            const theaterResult = insertedTheaters[i];
            // Each theater shows 2 random time slots per movie
            const selectedTimes = showTimes.slice(i % 2, (i % 2) + 2);

            for (const time of selectedTimes) {
              const [hours, minutes] = time.split(':').map(Number);
              const showDate = new Date();
              showDate.setDate(showDate.getDate() + day);
              showDate.setHours(hours, minutes, 0, 0);

              await dbShows.insertOne({
                movieId: movieResult.insertedId,
                theaterId: theaterResult.insertedId,
                showTime: showDate,
                price: prices[Math.floor(Math.random() * prices.length)],
                bookedSeats: [],
                isActive: true,
                createdAt: new Date(),
              });
            }
          }
        }
      }

      return { message: 'Sample data seeded successfully' };
    },
  },
});
