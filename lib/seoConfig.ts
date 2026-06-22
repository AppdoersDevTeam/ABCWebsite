/** Per-route SEO metadata for public pages (HashRouter pathnames). */

export interface PageMeta {
  /** Page title. The church name suffix is appended automatically unless `rawTitle` is true. */
  title: string;
  description: string;
  /** When true, use `title` verbatim without appending the church name. */
  rawTitle?: boolean;
}

export const SITE_NAME = 'Ashburton Baptist Church';

export const DEFAULT_META: PageMeta = {
  title: 'Ashburton Baptist Church | Disciples of Jesus impacting Ashburton',
  rawTitle: true,
  description:
    'Ashburton Baptist Church — disciples of Jesus impacting Ashburton and the nations. Join us Sundays at 10am for worship, teaching, and community at 284 Havelock Street, Ashburton.',
};

/** Exact pathname (inside the hash) -> metadata. */
export const ROUTE_META: Record<string, PageMeta> = {
  '/': DEFAULT_META,
  '/about': {
    title: 'About Us',
    description:
      'Learn about Ashburton Baptist Church — who we are, our story, our leadership, and our heart for the Ashburton community.',
  },
  '/about/history': {
    title: 'Our History',
    description:
      'The story of Ashburton Baptist Church — our heritage and how God has been at work in our community over the years.',
  },
  '/about/vision': {
    title: 'Our Vision',
    description:
      'Our vision and values at Ashburton Baptist Church: making disciples of Jesus who impact Ashburton and the nations.',
  },
  '/about/beliefs': {
    title: 'What We Believe',
    description:
      'Our statement of faith — the core beliefs that shape life and ministry at Ashburton Baptist Church.',
  },
  '/events': {
    title: 'Events',
    description:
      'Whatʼs happening at Ashburton Baptist Church — upcoming events, services, and ways to connect with our church family.',
  },
  '/events/sermons': {
    title: 'Sermons',
    description:
      'Watch and listen to recent sermons from Ashburton Baptist Church. Be encouraged and equipped by Godʼs word.',
  },
  '/events/sunday-service': {
    title: 'Sunday Service',
    description:
      'Join us every Sunday at 10am for worship, teaching, and community at Ashburton Baptist Church, 284 Havelock Street.',
  },
  '/events/young-adults': {
    title: 'Young Adults',
    description:
      'Young adults community at Ashburton Baptist Church — connect, grow, and belong with others in your season of life.',
  },
  '/events/teens-youth': {
    title: 'Teens & Youth',
    description:
      'Our teens and youth ministry at Ashburton Baptist Church — a place for young people to belong, have fun, and grow in faith.',
  },
  '/events/community-lunch': {
    title: 'Community Lunch',
    description:
      'Share a meal with us at the Ashburton Baptist Church community lunch — everyone is welcome at the table.',
  },
  '/events/kids-program': {
    title: 'Kids Program',
    description:
      'Fun, safe, and faith-filled childrenʼs ministry at Ashburton Baptist Church for kids of all ages.',
  },
  '/im-new': {
    title: 'Iʼm New',
    description:
      'New to Ashburton Baptist Church? Hereʼs what to expect on a Sunday and how to get connected. We canʼt wait to meet you.',
  },
  '/giving': {
    title: 'Giving',
    description:
      'Support the mission of Ashburton Baptist Church through generous giving. Find out how you can partner with us financially.',
  },
  '/need-prayer': {
    title: 'Need Prayer',
    description:
      'Request prayer from Ashburton Baptist Church. Our team would be honoured to pray with and for you.',
  },
  '/contact': {
    title: 'Contact Us',
    description:
      'Get in touch with Ashburton Baptist Church. Call 03-308 5409, email office@ashburtonbaptist.co.nz, or visit us at 284 Havelock Street, Ashburton.',
  },
  '/terms': {
    title: 'Terms of Use',
    description: 'Terms of use for the Ashburton Baptist Church website.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'How Ashburton Baptist Church collects, uses, and protects your personal information.',
  },
  '/login': {
    title: 'Member Login',
    description: 'Log in to your Ashburton Baptist Church member account.',
  },
};

/** Resolve metadata for a pathname, falling back to the site default. */
export function getRouteMeta(pathname: string): PageMeta {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return ROUTE_META[normalized] || DEFAULT_META;
}
