export const categories = [
  { id: 'all', name: 'All', icon: 'Grid' },
  { id: 'wedding', name: 'Wedding', icon: 'Heart' },
  { id: 'pre-wedding', name: 'Pre-Wedding', icon: 'Camera' },
  { id: 'birthday', name: 'Birthday', icon: 'Cake' },
  { id: 'party', name: 'Party', icon: 'PartyPopper' },
  { id: 'corporate', name: 'Corporate', icon: 'Briefcase' },
  { id: 'family', name: 'Family', icon: 'Users' },
] as const;

export interface Photographer {
  id: string;
  name: string;
  bio: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  image: string;
  categories: string[];
  portfolio: string[];
  yearsOfExperience: number;
  availableSlots: number;
}

export const photographers: Photographer[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    bio: 'Capturing life\'s precious moments with creativity and passion. Specialized in wedding and pre-wedding photography.',
    location: 'Mumbai, India',
    rating: 4.9,
    reviewCount: 156,
    priceRange: '₹25,000 - ₹50,000',
    image: 'https://images.unsplash.com/photo-1696273338595-178a113ead5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    categories: ['wedding', 'pre-wedding', 'party'],
    portfolio: [
      'https://images.unsplash.com/photo-1647730346059-c7c75506451e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      'https://images.unsplash.com/photo-1743069316179-668679f71b2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      'https://images.unsplash.com/photo-1718096551469-cea94cc454db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    ],
    yearsOfExperience: 8,
    availableSlots: 5,
  },
  {
    id: '2',
    name: 'Rahul Verma',
    bio: 'Professional photographer with expertise in candid wedding photography and destination weddings.',
    location: 'Delhi, India',
    rating: 4.8,
    reviewCount: 203,
    priceRange: '₹30,000 - ₹60,000',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    categories: ['wedding', 'party', 'corporate'],
    portfolio: [
      'https://images.unsplash.com/photo-1647730346059-c7c75506451e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      'https://images.unsplash.com/photo-1650584997985-e713a869ee77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    ],
    yearsOfExperience: 10,
    availableSlots: 3,
  },
  {
    id: '3',
    name: 'Anita Desai',
    bio: 'Specializing in birthday parties and family events. Making every celebration memorable.',
    location: 'Bangalore, India',
    rating: 4.7,
    reviewCount: 89,
    priceRange: '₹15,000 - ₹35,000',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    categories: ['birthday', 'party', 'family'],
    portfolio: [
      'https://images.unsplash.com/photo-1650584997985-e713a869ee77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      'https://images.unsplash.com/photo-1718096551469-cea94cc454db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    ],
    yearsOfExperience: 6,
    availableSlots: 8,
  },
  {
    id: '4',
    name: 'Vikram Singh',
    bio: 'Award-winning photographer specializing in pre-wedding shoots and destination photography.',
    location: 'Jaipur, India',
    rating: 4.9,
    reviewCount: 178,
    priceRange: '₹35,000 - ₹70,000',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    categories: ['pre-wedding', 'wedding', 'family'],
    portfolio: [
      'https://images.unsplash.com/photo-1743069316179-668679f71b2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      'https://images.unsplash.com/photo-1647730346059-c7c75506451e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    ],
    yearsOfExperience: 12,
    availableSlots: 2,
  },
  {
    id: '5',
    name: 'Meera Kapoor',
    bio: 'Corporate event photographer with a creative eye for detail and professional execution.',
    location: 'Pune, India',
    rating: 4.6,
    reviewCount: 124,
    priceRange: '₹20,000 - ₹45,000',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    categories: ['corporate', 'party', 'family'],
    portfolio: [
      'https://images.unsplash.com/photo-1718096551469-cea94cc454db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    ],
    yearsOfExperience: 7,
    availableSlots: 6,
  },
  {
    id: '6',
    name: 'Arjun Patel',
    bio: 'Passionate about capturing emotions and creating timeless memories for families and couples.',
    location: 'Ahmedabad, India',
    rating: 4.8,
    reviewCount: 142,
    priceRange: '₹28,000 - ₹55,000',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    categories: ['wedding', 'family', 'birthday'],
    portfolio: [
      'https://images.unsplash.com/photo-1647730346059-c7c75506451e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      'https://images.unsplash.com/photo-1650584997985-e713a869ee77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    ],
    yearsOfExperience: 9,
    availableSlots: 4,
  },
];
