export interface Movie {
  id: string;
  title: string;
  tagline: string;
  description: string;
  year: number;
  rating: string;
  matchScore: number;
  duration: string;
  category: 'trending' | 'scifi' | 'action' | 'anime' | 'classics';
  genres: string[];
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  badge?: string;
}

export const MOVIES: Movie[] = [
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel: Neo Amsterdam',
    tagline: 'A dystopian sci-fi showdown in a futuristic cyberpunk world.',
    description:
      'Set in a dystopian future where Amsterdam is occupied by gigantic robotic warriors, a group of scientists and soldiers reunite to reverse a catastrophic past romance that changed the fate of humanity.',
    year: 2024,
    rating: 'PG-13',
    matchScore: 98,
    duration: '12m 14s',
    category: 'scifi',
    genres: ['Sci-Fi', 'Cyberpunk', 'VFX Action'],
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    badge: 'Trending #1',
  },
  {
    id: 'cyberpunk-revelation',
    title: 'Cyber Chronicles: Zero Hour',
    tagline: 'When neon fades, the machine consciousness awakes.',
    description:
      'In the year 2088, neural network operatives discover a hidden signal broadcast beneath the subterranean data towers. Watch the thriller unfold with friends in frame-accurate synchrony.',
    year: 2025,
    rating: '16+',
    matchScore: 96,
    duration: '10m 00s',
    category: 'trending',
    genres: ['Action', 'Thriller', 'Techno-Noir'],
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    badge: 'Popular',
  },
  {
    id: 'sintel-quest',
    title: 'Sintel: The Dragon Quest',
    tagline: 'A lonely warrior searches the ends of the earth for her companion.',
    description:
      'A solitary young woman named Sintel rescues a wounded baby dragon, forming an unbreakable bond. When it is captured, she embarks on a dangerous journey through deserts and icy peaks.',
    year: 2023,
    rating: 'PG',
    matchScore: 94,
    duration: '15m 05s',
    category: 'anime',
    genres: ['Fantasy', 'Animation', 'Adventure'],
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    badge: 'Top Rated',
  },
  {
    id: 'big-buck-bunny',
    title: 'The Great Forest Rebellion',
    tagline: 'When the woodland bullies push too far, the gentle giant fights back.',
    description:
      'A warm-hearted giant rabbit is pushed to his limits when three vicious forest rodents start terrorizing innocent butterflies and small creatures. An entertaining animated classic for party laughs.',
    year: 2024,
    rating: 'All',
    matchScore: 99,
    duration: '9m 56s',
    category: 'classics',
    genres: ['Comedy', 'Animation', 'Family'],
    posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=1920&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    badge: 'Family Favorite',
  },
  {
    id: 'elephants-dream',
    title: 'The Mechanical Odyssey',
    tagline: 'Inside the labyrinth of infinite wires and surreal machines.',
    description:
      'Two explorers wander through a giant surreal machine whose whimsical architecture twists reality itself. A stunning visual exploration of imagination and friendship.',
    year: 2023,
    rating: 'PG',
    matchScore: 91,
    duration: '10m 53s',
    category: 'scifi',
    genres: ['Sci-Fi', 'Surrealism', 'Mystery'],
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'for-bigger-blazes',
    title: 'Velocity: The Supercar Rush',
    tagline: 'High speed, raw horsepower, and adrenaline on the desert highway.',
    description:
      'Experience the pulse-pounding speed and engineering perfection of hypercars battling against track limits across California coastal highways.',
    year: 2025,
    rating: 'PG-13',
    matchScore: 93,
    duration: '15m 00s',
    category: 'action',
    genres: ['Action', 'Speed', 'Docuseries'],
    posterUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    badge: 'Adrenaline',
  },
  {
    id: 'subaru-outback',
    title: 'Wilderness: Northern Passage',
    tagline: 'Through glacial fjords and uncharted mountain passes.',
    description:
      'An inspiring outdoor documentary charting an expedition through raw arctic terrain, pristine rivers, and mountain valleys under the Northern Lights.',
    year: 2024,
    rating: 'All',
    matchScore: 89,
    duration: '8m 30s',
    category: 'classics',
    genres: ['Nature', 'Expedition', 'Documentary'],
    posterUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
  },
];
