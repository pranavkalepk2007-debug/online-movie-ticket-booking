import { dbMovies, dbTheaters, dbShows } from '../movies/db';

export async function seedMovies() {
  console.log('Checking and seeding movie recommendations...');

  // Ensure theaters exist
  let theaters = await dbTheaters.fetch({});
  if (theaters.length === 0) {
    const sampleTheaters = [
      {
        name: 'PVR ICON Gold',
        location: 'Phoenix Marketcity, Kurla',
        totalSeats: 120,
        rows: 10,
        seatsPerRow: 12,
        createdAt: new Date(),
      },
      {
        name: 'INOX Megaplex',
        location: 'Inorbit Mall, Malad',
        totalSeats: 100,
        rows: 10,
        seatsPerRow: 10,
        createdAt: new Date(),
      },
      {
        name: 'Cinepolis VIP',
        location: 'Viviana Mall, Thane',
        totalSeats: 80,
        rows: 8,
        seatsPerRow: 10,
        createdAt: new Date(),
      },
      {
        name: 'City Pride Multiplex',
        location: 'Kothrud, Pune',
        totalSeats: 110,
        rows: 10,
        seatsPerRow: 11,
        createdAt: new Date(),
      },
    ];

    await Promise.all(sampleTheaters.map((t) => dbTheaters.insertOne(t)));
    theaters = await dbTheaters.fetch({});
  }

  const allMovies = [
    // Latest Theatrical Releases & Blockbusters
    {
      title: 'Stree 2',
      description: 'The town of Chanderi is haunted once again, this time by a headless entity named Sarkata that is abducting modern women. The gang reunites with Stree to save their town.',
      genre: 'Comedy/Horror',
      duration: 147,
      rating: 'UA',
      releaseDate: new Date('2024-08-15'),
      posterUrl: '/posters/stree-2.jpg',
      language: 'Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Kalki 2898 AD',
      description: 'Set in a post-apocalyptic world in the year 2898 AD, a chosen few embark on a momentous mission to protect an unborn child who is believed to be the avatar of Vishnu.',
      genre: 'Sci-Fi/Action/Mythology',
      duration: 181,
      rating: 'UA',
      releaseDate: new Date('2024-06-27'),
      posterUrl: '/posters/kalki-2898-ad.jpg',
      language: 'Telugu/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Pushpa 2: The Rule',
      description: 'Pushpa Raj consolidates his syndicate empire with unwavering dominance as police superintendent Bhanwar Singh Shekhawat seeks ultimate retribution in a ruthless battle.',
      genre: 'Action/Thriller/Drama',
      duration: 200,
      rating: 'A',
      releaseDate: new Date('2024-12-05'),
      posterUrl: '/posters/pushpa-2.jpg',
      language: 'Telugu/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
      genre: 'Sci-Fi/Adventure/Epic',
      duration: 166,
      rating: 'UA',
      releaseDate: new Date('2024-03-01'),
      posterUrl: '/posters/dune-2.jpg',
      language: 'English/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Deadpool & Wolverine',
      description: 'A listless Wade Wilson toils away in civilian life with his days as the mercenary Deadpool behind him, until a threat to his home world forces him to team up with a reluctant Wolverine.',
      genre: 'Action/Comedy/Sci-Fi',
      duration: 128,
      rating: 'A',
      releaseDate: new Date('2024-07-26'),
      posterUrl: '/posters/deadpool-and-wolverine.jpg',
      language: 'English/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Bhool Bhulaiyaa 3',
      description: 'Rooh Baba ventures into a haunted mansion in West Bengal, unraveling the mysterious origins of the vengeful spirit Manjulika and encountering unexpected double trouble.',
      genre: 'Comedy/Horror',
      duration: 158,
      rating: 'UA',
      releaseDate: new Date('2024-11-01'),
      posterUrl: '/posters/bhool-bhulaiyaa-3.jpg',
      language: 'Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Fighter',
      description: 'Top Indian Air Force aviators come together to form the Air Dragons elite unit, facing deadly threats and international terror missions while overcoming their personal pasts.',
      genre: 'Action/War/Thriller',
      duration: 166,
      rating: 'UA',
      releaseDate: new Date('2024-01-25'),
      posterUrl: '/posters/fighter.jpg',
      language: 'Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Chhaava',
      description: 'The monumental saga of Chhatrapati Sambhaji Maharaj, the fearless Maratha emperor who defended his realm against the Mughal Empire with unyielding valor and strategic mastery.',
      genre: 'Historical/Action/Drama',
      duration: 160,
      rating: 'UA',
      releaseDate: new Date('2024-12-06'),
      posterUrl: '/posters/chhaava.jpg',
      language: 'Hindi/Marathi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Singham Again',
      description: 'DCP Bajirao Singham leads a modern-day Ramayana-inspired mission with his fellow cop universe comrades to rescue his abducted wife from a dangerous criminal syndicate.',
      genre: 'Action/Drama',
      duration: 144,
      rating: 'UA',
      releaseDate: new Date('2024-11-01'),
      posterUrl: '/posters/singham-again.jpg',
      language: 'Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Munjya',
      description: 'A young man visits his ancestral village in the Konkan region and inadvertently awakens an eccentric boy-spirit obsessed with an unfulfilled marital desire.',
      genre: 'Comedy/Horror/Folklore',
      duration: 123,
      rating: 'UA',
      releaseDate: new Date('2024-06-07'),
      posterUrl: '/posters/munjya.jpg',
      language: 'Hindi/Marathi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Inside Out 2',
      description: 'Teenager Riley enters high school as Headquarters undergoes sudden demolition to make room for brand new emotions including Anxiety, Envy, Ennui, and Embarrassment.',
      genre: 'Animation/Comedy/Family',
      duration: 96,
      rating: 'U',
      releaseDate: new Date('2024-06-14'),
      posterUrl: '/posters/inside-out-2.jpg',
      language: 'English/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Gladiator II',
      description: 'Years after witnessing the death of Maximus, Lucius enters the Colosseum to fight for the future of Rome against tyrannical emperors and corrupt power brokers.',
      genre: 'Action/Adventure/Drama',
      duration: 148,
      rating: 'A',
      releaseDate: new Date('2024-11-15'),
      posterUrl: '/posters/gladiator-2.jpg',
      language: 'English/Hindi',
      isActive: true,
      createdAt: new Date(),
    },

    // User Requested Titles
    {
      title: 'Mirzapur',
      description: 'The iron-fisted Akhandanand Tripathi rules the lawless city of Mirzapur as the mafia boss, until an incident sparks an all-out blood war with two determined brothers.',
      genre: 'Crime/Action/Thriller',
      duration: 165,
      rating: 'A',
      releaseDate: new Date('2020-10-23'),
      posterUrl: '/posters/mirzapur.jpg',
      language: 'Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'The Love Hypothesis',
      description: 'A third-year Ph.D. candidate panics and kisses the first man she sees to convince her friend she is dating—who turns out to be the notoriously critical Professor Adam Carlsen, sparking an unexpected fake-dating pact.',
      genre: 'Romance/Comedy',
      duration: 124,
      rating: 'UA',
      releaseDate: new Date('2023-02-14'),
      posterUrl: '/posters/the-love-hypothesis.jpg',
      language: 'English',
      isActive: true,
      createdAt: new Date(),
    },

    // Acclaimed Regional / Marathi Masterpieces
    {
      title: 'Tumbbad',
      description: 'A mythological horror masterpiece following a family through generations who succumbs to greed for a cursed god\'s gold.',
      genre: 'Horror/Fantasy/Period',
      duration: 104,
      rating: 'A',
      releaseDate: new Date('2018-10-12'),
      posterUrl: '/posters/tumbbad.jpg',
      language: 'Marathi/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Killa',
      description: 'A 11-year-old boy struggles to cope with the loss of his father while adapting to a new school in a small coastal Maharashtrian town.',
      genre: 'Drama/Coming-of-Age',
      duration: 107,
      rating: 'U',
      releaseDate: new Date('2015-06-26'),
      posterUrl: '/posters/killa.jpg',
      language: 'Marathi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Katyar Kaljat Ghusali',
      description: 'The intense rivalry between two contrasting classical music gharanas over musical supremacy and royal patronage.',
      genre: 'Musical/Drama',
      duration: 162,
      rating: 'U',
      releaseDate: new Date('2015-11-12'),
      posterUrl: '/posters/katyar-kaljat-ghusali.jpg',
      language: 'Marathi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Harishchandrachi Factory',
      description: 'The delightfully inspiring true story of Dadasaheb Phalke as he battles all odds to produce India\'s first feature film, Raja Harishchandra.',
      genre: 'Biography/Comedy',
      duration: 96,
      rating: 'U',
      releaseDate: new Date('2009-11-01'),
      posterUrl: '/posters/harishchandrachi-factory.jpg',
      language: 'Marathi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Jhimma',
      description: 'Seven women from diverse backgrounds embark on a transformative tour of London, finding joy, healing, and unbreakable sisterhood.',
      genre: 'Comedy/Drama',
      duration: 130,
      rating: 'U',
      releaseDate: new Date('2021-11-19'),
      posterUrl: '/posters/jhimma.jpg',
      language: 'Marathi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Sairat',
      description: 'A young college couple from different castes fall in love and face violent opposition from the girl\'s powerful family.',
      genre: 'Romance/Drama',
      duration: 175,
      rating: 'UA',
      releaseDate: new Date('2016-04-29'),
      posterUrl: '/posters/sairat.jpg',
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
      posterUrl: '/posters/natsamrat.jpg',
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
      posterUrl: '/posters/mulshi-pattern.jpg',
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
      posterUrl: '/posters/lai-bhaari.jpg',
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
      posterUrl: '/posters/court.jpg',
      language: 'Marathi',
      isActive: true,
      createdAt: new Date(),
    },

    // Global & Epic Blockbusters
    {
      title: 'Interstellar',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked with piloting a spacecraft to find a new home for mankind.',
      genre: 'Sci-Fi/Adventure/Drama',
      duration: 169,
      rating: 'UA',
      releaseDate: new Date('2014-11-07'),
      posterUrl: '/posters/interstellar.jpg',
      language: 'English/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Oppenheimer',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
      genre: 'Biography/Drama/History',
      duration: 180,
      rating: 'A',
      releaseDate: new Date('2023-07-21'),
      posterUrl: '/posters/oppenheimer.jpg',
      language: 'English/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      genre: 'Sci-Fi/Action/Thriller',
      duration: 148,
      rating: 'UA',
      releaseDate: new Date('2010-07-16'),
      posterUrl: '/posters/inception.jpg',
      language: 'English/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on Gotham City, Batman must accept one of the greatest psychological and physical tests.',
      genre: 'Action/Crime/Drama',
      duration: 152,
      rating: 'UA',
      releaseDate: new Date('2008-07-18'),
      posterUrl: '/posters/the-dark-knight.jpg',
      language: 'English/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'Dangal',
      description: 'Former wrestler Mahavir Singh Phogat trains his young daughters Geeta and Babita to become world-class wrestling champions against societal prejudice.',
      genre: 'Biography/Sports/Drama',
      duration: 161,
      rating: 'U',
      releaseDate: new Date('2016-12-23'),
      posterUrl: '/posters/dangal.jpg',
      language: 'Hindi',
      isActive: true,
      createdAt: new Date(),
    },
    {
      title: 'RRR',
      description: 'A fearless revolutionary and an officer in the British force decide to join hands and create a momentous path against oppressive British rulers.',
      genre: 'Action/Drama',
      duration: 187,
      rating: 'UA',
      releaseDate: new Date('2022-03-25'),
      posterUrl: '/posters/rrr.jpg',
      language: 'Telugu/Hindi',
      isActive: true,
      createdAt: new Date(),
    },
  ];

  const showTimes = ['10:00', '13:30', '16:45', '20:15', '22:45'];
  const prices = [160, 200, 240, 280, 350];

  for (const movieData of allMovies) {
    let movie = await dbMovies.findOne({ title: movieData.title });
    let movieId = movie?._id;

    if (!movie) {
      const res = await dbMovies.insertOne(movieData);
      movieId = res.insertedId;
      console.log(`Inserted new movie recommendation: ${movieData.title}`);
    } else {
      // Ensure posterUrl and metadata are updated to the official local assets
      await dbMovies.updateOne(
        { _id: movie._id },
        {
          $set: {
            posterUrl: movieData.posterUrl,
            description: movieData.description,
            genre: movieData.genre,
            duration: movieData.duration,
            rating: movieData.rating,
            language: movieData.language,
          },
        }
      );
    }

    // Check if shows exist for this movie
    const showCount = await dbShows.countDocuments({ movieId });
    if (showCount === 0 && movieId) {
      for (let day = 0; day < 7; day++) {
        for (let i = 0; i < theaters.length; i++) {
          const theater = theaters[i];
          const chosenTimes = showTimes.slice(i % 3, (i % 3) + 2);

          for (const time of chosenTimes) {
            const [hours, minutes] = time.split(':').map(Number);
            const showDate = new Date();
            showDate.setDate(showDate.getDate() + day);
            showDate.setHours(hours, minutes, 0, 0);

            await dbShows.insertOne({
              movieId,
              theaterId: theater._id,
              showTime: showDate,
              price: prices[(i + day) % prices.length],
              bookedSeats: [],
              isActive: true,
              createdAt: new Date(),
            });
          }
        }
      }
    }
  }

  console.log('All movie recommendations and showtimes successfully synced.');
}
