// ============================================
// TEDxDutse 2025 — Site Content Data
// "Roots and Wings"
// ============================================

export const siteConfig = {
  eventName: 'TEDxDutse',
  eventYear: 2025,
  theme: 'Roots and Wings',
  tagline: 'Where Culture Meets Innovation',
  subtitle: 'Where Dutse\'s stories take flight',
  date: 'Saturday, November 29, 2025',
  time: '9:00 AM – 6:00 PM',
  venue: 'Ahmadu Bello Hall, New Secretariat Complex, Dutse, Jigawa State, Nigeria',
  venueShort: 'Ahmadu Bello Hall, Dutse',
  dressCode: 'Smart Casual',
  contact: {
    email: 'info@tedxdutse.com',
    phone: '+234 XXX XXX XXXX',
    whatsapp: 'https://chat.whatsapp.com/FSClJBjkgr6LYdDMcFx2A0',
  },
  social: {
    instagram: 'https://instagram.com/tedxdutse',
    twitter: 'https://twitter.com/tedxdutse',
    facebook: 'https://facebook.com/tedxdutse',
    linkedin: 'https://linkedin.com/company/tedxdutse',
  },
};

export const speakers = [
  {
    id: 1,
    name: 'Amina Sagir',
    title: 'Dreaming With Roots, Growing With Wings',
    role: 'Speaker',
    bio: 'Opening speaker exploring the duality of heritage and ambition.',
    duration: 10,
    image: null,
  },
  {
    id: 2,
    name: 'Husna Mu\'Abaffah',
    title: 'From Humble Roots to Transformational Leadership',
    role: 'Public Health Specialist | Civic Advocate',
    bio: 'Public health specialist overseeing TB & HIV programs in Kano State. Advocate for African Union Agenda 2063 and UNICEF YPAT alumna.',
    duration: 15,
    image: null,
  },
  {
    id: 3,
    name: 'Dr. AY Kazaure',
    title: 'From Ideas to Impact: Creating Your Own Path',
    role: 'Medical Doctor | Public Health Advocate',
    bio: 'MBBS from Ibn Sina University. Public health advocate with clinical experience at ABUTH Zaria, FMC Birnin Kudu. Currently pursuing a Master\'s in Public Health.',
    duration: 15,
    image: null,
  },
  {
    id: 4,
    name: 'Dr. Yana',
    title: 'Looking Back Can Help You Forge a Clearer Future',
    role: 'African Literature | Culture | Youth Empowerment',
    bio: 'Specialist in African literature, culture, and history. Lecturer at Sule Lamido University, UK-trained with a PhD from University of Exeter.',
    duration: 15,
    image: null,
  },
  {
    id: 5,
    name: 'Prof. Haruna Musa',
    title: 'From Learning Poverty to Learning Power: The Jigawa Model',
    role: 'Professor | Education Reform',
    bio: 'Leading voice in education transformation, championing the Jigawa model for learning empowerment.',
    duration: 15,
    image: null,
  },
  {
    id: 6,
    name: 'Dr. Hauwa Babura',
    title: 'Returning Home: Giving Back Without Losing Your Wings',
    role: 'Community Development | Social Impact',
    bio: 'Championing community-driven development and the power of returning knowledge to one\'s roots.',
    duration: 15,
    image: null,
  },
  {
    id: 7,
    name: 'Engr. Mustapha Abu',
    title: 'The Room I Was Born to Build',
    role: 'Engineer | Innovation',
    bio: 'Engineering visionary building spaces that transform communities and inspire the next generation.',
    duration: 15,
    image: null,
  },
  {
    id: 8,
    name: 'Nasir Bin Shuraim',
    title: 'Unleashing the Hidden Self: Roots as the Foundation for Flight',
    role: 'Personal Development | Philosophy',
    bio: 'Exploring the deep connection between self-discovery and cultural identity as launchpads for greatness.',
    duration: 15,
    image: null,
  },
];

export const schedule = {
  morning: {
    label: 'Morning Session',
    time: 'Before 11:00 AM – 12:40 PM',
    items: [
      { time: '', title: 'Arrival & Introduction', type: 'break', description: 'Before 11:00 AM' },
      { time: '11:00 – 11:10 AM', title: 'Amina Sagir', type: 'talk', description: '"Dreaming With Roots, Growing With Wings" (10 mins)', speakerId: 1 },
      { time: '11:10 – 11:25 AM', title: 'Husna Mu\'Abaffah', type: 'talk', description: '"From Humble Roots to Transformational Leadership" (15 mins)', speakerId: 2 },
      { time: '11:25 – 11:35 AM', title: 'Khadijah Adam Pingels', type: 'performance', description: 'Poetry Performance (10 mins)' },
      { time: '11:35 – 11:50 AM', title: 'Dr. AY Kazaure', type: 'talk', description: '"From Ideas to Impact: Creating Your Own Path" (15 mins)', speakerId: 3 },
      { time: '11:50 – 12:05 PM', title: 'Dr. Yana', type: 'talk', description: '"Looking Back Can Help You Forge a Clearer Future" (15 mins)', speakerId: 4 },
      { time: '12:05 – 12:10 PM', title: 'Host Remarks', type: 'remarks', description: 'Summary of first speakers (5 mins)' },
      { time: '12:10 – 12:40 PM', title: 'Lunch Break + Networking', type: 'break', description: 'VVIP, VIP, Guests & Speakers (30 mins)' },
    ],
  },
  afternoon: {
    label: 'Afternoon Session',
    time: '12:40 PM – 3:00 PM',
    items: [
      { time: '12:40 – 12:45 PM', title: 'MC Introduction', type: 'remarks', description: 'Introduction to New Segment (5 mins)' },
      { time: '12:45 – 12:50 PM', title: 'Short Video Display', type: 'video', description: '(5 mins)' },
      { time: '12:50 – 1:05 PM', title: 'Prof. Haruna Musa', type: 'talk', description: '"From Learning Poverty to Learning Power: The Jigawa Model" (15 mins)', speakerId: 5 },
      { time: '1:05 – 1:20 PM', title: 'Dr. Hauwa Babura', type: 'talk', description: '"Returning Home: Giving Back Without Losing Your Wings" (15 mins)', speakerId: 6 },
      { time: '1:20 – 1:35 PM', title: 'Engr. Mustapha Abu', type: 'talk', description: '"The Room I Was Born to Build" (15 mins)', speakerId: 7 },
      { time: '1:35 – 1:50 PM', title: 'Nasir Bin Shuraim', type: 'talk', description: '"Unleashing the Hidden Self: Roots as the Foundation for Flight" (15 mins)', speakerId: 8 },
      { time: '1:50 – 2:05 PM', title: 'Prof. Uba Abdullahi', type: 'video', description: 'Pre-Recorded Video (15 mins)' },
      { time: '2:05 – 2:10 PM', title: 'Host Remarks', type: 'remarks', description: 'Second segment wrap-up (5 mins)' },
      { time: '2:10 – 2:15 PM', title: 'MC Introduces Last Segment', type: 'remarks', description: '(5 mins)' },
      { time: '2:15 – 2:25 PM', title: 'Khairat Abdullahi', type: 'performance', description: 'Artist Performance (10 mins)' },
      { time: '2:25 – 2:40 PM', title: 'Award Presentation', type: 'award', description: 'Awards to Guests (15 mins)' },
      { time: '2:40 – 2:50 PM', title: 'Mr Mooh', type: 'performance', description: 'Artist Performance (10 mins)' },
      { time: '2:50 – 3:00 PM', title: 'Closing Remarks', type: 'remarks', description: '(10 mins)' },
    ],
  },
};

export const sponsors = {
  presenting: [
    { name: 'Presenting Partner', logo: null },
  ],
  platinum: [
    { name: 'Platinum Partner 1', logo: null },
    { name: 'Platinum Partner 2', logo: null },
  ],
  gold: [
    { name: 'Gold Partner 1', logo: null },
    { name: 'Gold Partner 2', logo: null },
    { name: 'Gold Partner 3', logo: null },
  ],
  community: [
    { name: 'Community Partner 1', logo: null },
    { name: 'Community Partner 2', logo: null },
  ],
};

export const ticketTiers = [
  {
    id: 'regular',
    name: 'Regular',
    price: 3000,
    currency: '₦',
    features: [
      'General admission',
      'Access to all talks',
      'Networking sessions',
      'Event program',
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 10000,
    currency: '₦',
    features: [
      'Priority seating',
      'All Regular benefits',
      'VIP networking lounge',
      'Exclusive meet & greet',
    ],
    popular: true,
  },
  {
    id: 'vvip',
    name: 'VVIP',
    price: 25000,
    currency: '₦',
    features: [
      'Front row seating',
      'All VIP benefits',
      'Speaker dinner invitation',
      'Gift bag',
      'Certificate of attendance',
    ],
  },
];

export const galleryImages = [
  { id: 1, src: '/images/gallery/TEDxD-1.jpg', alt: 'TEDxDutse event', orientation: 'landscape' },
  { id: 2, src: '/images/gallery/TEDxD-2.jpg', alt: 'TEDxDutse speaker', orientation: 'portrait' },
  { id: 3, src: '/images/gallery/TEDxD-3.jpg', alt: 'TEDxDutse speaker', orientation: 'portrait' },
  { id: 4, src: '/images/gallery/TEDxD-4.jpg', alt: 'TEDxDutse speaker', orientation: 'portrait' },
  { id: 5, src: '/images/gallery/TEDxD-5.jpg', alt: 'TEDxDutse event', orientation: 'landscape' },
  { id: 6, src: '/images/gallery/TEDxD-6.jpg', alt: 'TEDxDutse event', orientation: 'landscape' },
  { id: 7, src: '/images/gallery/TEDxD-7.jpg', alt: 'TEDxDutse speaker', orientation: 'portrait' },
  { id: 8, src: '/images/gallery/TEDxD-8.jpg', alt: 'TEDxDutse speaker', orientation: 'portrait' },
  { id: 9, src: '/images/gallery/TEDxD-9.jpg', alt: 'TEDxDutse event', orientation: 'landscape' },
  { id: 10, src: '/images/gallery/TEDxD-10.jpg', alt: 'TEDxDutse event', orientation: 'landscape' },
  { id: 11, src: '/images/gallery/TEDxD-11.jpg', alt: 'TEDxDutse event', orientation: 'landscape' },
  { id: 12, src: '/images/gallery/TEDxD-12.jpg', alt: 'TEDxDutse event', orientation: 'landscape' },
  { id: 13, src: '/images/gallery/TEDxD-13.jpg', alt: 'TEDxDutse speaker', orientation: 'portrait' },
  { id: 14, src: '/images/gallery/TEDxD-14.jpg', alt: 'TEDxDutse speaker', orientation: 'portrait' },
  { id: 15, src: '/images/gallery/TEDxD-15.jpg', alt: 'TEDxDutse event', orientation: 'landscape' },
  { id: 16, src: '/images/gallery/TEDxD-16.jpg', alt: 'TEDxDutse event', orientation: 'landscape' },
];

// TEDx required boilerplate text
export const tedxBoilerplate = {
  whatIsTedx: `In the spirit of discovering and spreading ideas, TED has created a program called TEDx. TEDx is a program of local, self-organized events that bring people together to share a TED-like experience. Our event is called TEDxDutse, where x = independently organized TED event. At our TEDxDutse event, TED Talks video and live speakers will combine to spark deep discussion and connection in a small group. The TED Conference provides general guidance for the TEDx program, but individual TEDx events, including ours, are self-organized.`,
  footerDisclaimer: 'This independent TEDx event is operated under license from TED.',
  aboutTed: `TED is a nonprofit, nonpartisan organization dedicated to discovering, debating and spreading ideas that spark conversation, deepen understanding and drive meaningful change. Our organization is devoted to curiosity, reason, wonder and the pursuit of knowledge — without an agenda.`,
};
