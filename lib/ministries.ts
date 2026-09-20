/** Public ministry pages live at `/<slug>`, not under `/events`. */

export const MINISTRIES_LABEL = 'Ministries' as const;

export type Ministry = {
  slug: string;
  path: string;
  label: string;
  tagline: string;
  summary: string;
  description: string[];
  whenLabel: string;
  whenDetail: string;
  /** Existing dedicated page component (not the generic ministry template). */
  existingPage?: boolean;
};

export const MINISTRIES: Ministry[] = [
  {
    slug: 'sunday-service',
    path: '/sunday-service',
    label: 'Sunday Service',
    tagline: 'Join Us for Worship.',
    summary: 'Every Sunday at 10:00 AM. Join us for worship, teaching, and community.',
    description: [],
    whenLabel: 'Every Sunday',
    whenDetail: '10:00 AM',
    existingPage: true,
  },
  {
    slug: 'boys-brigade',
    path: '/boys-brigade',
    label: 'Boys Brigade',
    tagline: 'Faith, skills, and friendship.',
    summary: 'Boys Brigade helps boys grow in character, skills, and faith through activities and community.',
    description: [
      'Boys Brigade is a place for boys to belong, learn new skills, and grow in faith alongside trusted leaders.',
      'If you would like your son to join, or want to help as a leader, please get in touch with the church office.',
    ],
    whenLabel: 'During the term',
    whenDetail: 'Ask the office for current times',
  },
  {
    slug: 'cap',
    path: '/cap',
    label: 'CAP',
    tagline: 'Christians Against Poverty.',
    summary: 'Practical help and hope for people facing debt and money pressure.',
    description: [
      'CAP (Christians Against Poverty) walks with people who are struggling with debt, offering practical support, coaching, and care.',
      'If you need help, or want to support this ministry, contact the church office and we will connect you with the right person.',
    ],
    whenLabel: 'By appointment',
    whenDetail: 'Contact the church office',
  },
  {
    slug: 'children',
    path: '/children',
    label: 'Children',
    tagline: 'Fun and faith for kids.',
    summary: 'Safe, engaging programmes where children can learn about Jesus and belong.',
    description: [],
    whenLabel: 'Every Sunday',
    whenDetail: '10:00 AM',
    existingPage: true,
  },
  {
    slug: 'connect-groups',
    path: '/connect-groups',
    label: 'Connect Groups',
    tagline: 'Life together through the week.',
    summary: 'Small groups where people share life, pray, and grow in faith together.',
    description: [
      'Connect Groups are a simple way to get known and to know others beyond Sunday. Groups meet in homes and around the church family.',
      'If you would like to join a group, or host one, the office can help you find a good fit.',
    ],
    whenLabel: 'Through the week',
    whenDetail: 'Times vary by group',
  },
  {
    slug: 'counselling',
    path: '/counselling',
    label: 'Counselling',
    tagline: 'Care when life is heavy.',
    summary: 'Pastoral counselling support for individuals and families who need a listening ear.',
    description: [
      'Our counselling ministry offers a confidential, caring space to talk through what you are facing.',
      'Please contact the church office and we will help you take the next step with the right person.',
    ],
    whenLabel: 'By appointment',
    whenDetail: 'Contact the church office',
  },
  {
    slug: 'couples',
    path: '/couples',
    label: 'Couples',
    tagline: 'Stronger together.',
    summary: 'Encouragement, friendship, and faith for couples at every stage.',
    description: [
      'Couples ministry is about walking with married and engaged couples as they build healthy, Christ-centred relationships.',
      'Watch the calendar for gatherings, or ask the office how to get connected.',
    ],
    whenLabel: 'Seasonal gatherings',
    whenDetail: 'See the church calendar',
  },
  {
    slug: 'family',
    path: '/family',
    label: 'Family',
    tagline: 'Church for the whole household.',
    summary: 'Support and community for families growing in faith together.',
    description: [
      'Family ministry helps households follow Jesus together — from little ones through to parents and caregivers.',
      'Come along on a Sunday, and ask the office about family events and ways to get involved.',
    ],
    whenLabel: 'Sundays and events',
    whenDetail: 'See the church calendar',
  },
  {
    slug: 'girls-brigade',
    path: '/girls-brigade',
    label: 'Girls Brigade',
    tagline: 'Faith, skills, and friendship.',
    summary: 'Girls Brigade helps girls grow in confidence, skills, and faith.',
    description: [
      'Girls Brigade is a welcoming group where girls can learn, have fun, and grow in character and faith.',
      'If you would like your daughter to join, or want to help as a leader, please contact the church office.',
    ],
    whenLabel: 'During the term',
    whenDetail: 'Ask the office for current times',
  },
  {
    slug: 'men',
    path: '/men',
    label: 'Men',
    tagline: 'Brothers growing in faith.',
    summary: 'Friendship, prayer, and encouragement for men of the church.',
    description: [
      'Men’s ministry is a place to be honest, encouraged, and equipped to follow Jesus in everyday life.',
      'Ask the office about current gatherings, breakfasts, and ways to get involved.',
    ],
    whenLabel: 'Regular gatherings',
    whenDetail: 'Ask the office for dates',
  },
  {
    slug: 'missions',
    path: '/missions',
    label: 'Missions',
    tagline: 'Ashburton and the nations.',
    summary: 'Prayer, giving, and partnership with mission locally and around the world.',
    description: [
      'Missions is part of who we are: disciples of Jesus impacting Ashburton and the nations.',
      'Learn how we pray, give, and partner with people serving locally and overseas — the office can share current partnerships.',
    ],
    whenLabel: 'Ongoing',
    whenDetail: 'Updates shared with the church family',
  },
  {
    slug: 'pastoral-care',
    path: '/pastoral-care',
    label: 'Pastoral Care',
    tagline: 'Walking with you.',
    summary: 'Practical and spiritual care when you need support from your church family.',
    description: [
      'Pastoral care is how we look after one another — visiting, praying, and supporting people through illness, grief, and everyday life.',
      'If you or someone you love needs care, please contact the church office.',
    ],
    whenLabel: 'As needed',
    whenDetail: 'Contact the church office',
  },
  {
    slug: 'plus-65',
    path: '/plus-65',
    label: 'Plus 65+',
    tagline: 'Friendship and faith in later years.',
    summary: 'A welcoming community for people 65 and over.',
    description: [
      'Plus 65+ is a place to enjoy friendship, encouragement, and faith together in this season of life.',
      'Ask the office about current gatherings and how to join in.',
    ],
    whenLabel: 'Regular gatherings',
    whenDetail: 'Ask the office for dates',
  },
  {
    slug: 'teens-youth',
    path: '/teens-youth',
    label: 'Teens & Youth',
    tagline: 'Belong. Grow. Have fun.',
    summary: 'A welcoming space for teens to explore faith and build friendships.',
    description: [],
    whenLabel: 'Tuesday',
    whenDetail: '7:00 PM',
    existingPage: true,
  },
  {
    slug: 'women',
    path: '/women',
    label: 'Women',
    tagline: 'Sisters growing in faith.',
    summary: 'Friendship, prayer, and encouragement for women of the church.',
    description: [
      'Women’s ministry is a place to be known, encouraged, and equipped to follow Jesus together.',
      'Ask the office about current studies, gatherings, and ways to get involved.',
    ],
    whenLabel: 'Regular gatherings',
    whenDetail: 'Ask the office for dates',
  },
  {
    slug: 'worship',
    path: '/worship',
    label: 'Worship',
    tagline: 'Heart and voice together.',
    summary: 'Music and worship that helps the church family encounter God.',
    description: [
      'Worship ministry serves the Sunday gathering and other church events through music, singing, and a heart for God.',
      'If you would like to serve on the worship team, please contact the church office.',
    ],
    whenLabel: 'Every Sunday',
    whenDetail: '10:00 AM',
  },
  {
    slug: 'young-adults',
    path: '/young-adults',
    label: 'Young Adults',
    tagline: 'Connect. Grow. Serve.',
    summary: 'A space for 18–30s to build community and faith.',
    description: [],
    whenLabel: 'See the calendar',
    whenDetail: 'Ask the office for current times',
    existingPage: true,
  },
];

export const MINISTRY_MENU_ITEMS = MINISTRIES.map((ministry) => ({
  label: ministry.label,
  path: ministry.path,
  hash: '',
}));

export const MINISTRY_LEGACY_REDIRECTS: Array<{ from: string; to: string }> = [
  { from: '/events/sunday-service', to: '/sunday-service' },
  { from: '/events/young-adults', to: '/young-adults' },
  { from: '/events/teens-youth', to: '/teens-youth' },
  { from: '/events/kids-program', to: '/children' },
];

export function getMinistryBySlug(slug: string | undefined): Ministry | undefined {
  if (!slug) return undefined;
  return MINISTRIES.find((ministry) => ministry.slug === slug);
}

export function getMinistryByPath(pathname: string): Ministry | undefined {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return MINISTRIES.find((ministry) => ministry.path === normalized);
}
