export const clubTypeOptions = [
  { slug: "sports",        value: "Sports",        label: "Sports" },
  { slug: "activity",      value: "Activity",      label: "Activity" },
  { slug: "cultural",      value: "Cultural",      label: "Cultural" },
  { slug: "media",         value: "Media",         label: "Media" },
  { slug: "international", value: "International", label: "International" },
  { slug: "religious",     value: "Religious",     label: "Religious" },
];

export const clubData = [
  {
    slug: "sports",
    title: "Sports Clubs",
    description: "Join competitive and recreational clubs that build teamwork, confidence, and campus spirit.",
    details:
      "Sports clubs bring students together through training, tournaments, fitness programs, and team events. They create a strong sense of community while helping students build discipline, resilience, and leadership beyond the classroom.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=85",
    overlayClass: "campus-card--blue",
  },
  {
    slug: "activity",
    title: "Activity Based Clubs",
    description: "Explore clubs focused on leadership, creativity, volunteering, and practical student experiences.",
    details:
      "Activity based clubs give students opportunities to participate in projects, events, volunteering programs, and leadership initiatives. These communities are ideal for building practical skills, confidence, and long-term campus connections.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=85",
    overlayClass: "campus-card--green",
  },
  {
    slug: "cultural",
    title: "Cultural Clubs",
    description: "Celebrate traditions, performances, and diversity through vibrant student-led cultural communities.",
    details:
      "Cultural clubs celebrate heritage, language, art, and performance while encouraging inclusion across the university. They offer students a welcoming space to share traditions, host events, and experience diverse perspectives.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=85",
    overlayClass: "campus-card--gold",
  },
  {
    slug: "media",
    title: "Media Clubs",
    description: "Develop photography, design, broadcasting, and digital storytelling skills with peers on campus.",
    details:
      "Media clubs help students sharpen creative and technical skills in photography, videography, editing, broadcasting, and design. They often support university events and provide a practical environment for content creation and storytelling.",
    image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800&q=85",
    overlayClass: "campus-card--teal",
  },
  {
    slug: "international",
    title: "International Clubs",
    description: "Build global exposure, friendships, and collaboration through internationally minded societies.",
    details:
      "International clubs connect students through global networking, exchange-minded activities, cultural events, and collaboration opportunities. They encourage openness, communication, and cross-border friendship within campus life.",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=85",
    overlayClass: "campus-card--red",
  },
  {
    slug: "religious",
    title: "Religious Clubs",
    description: "Find inclusive communities for reflection, service, and shared values across different faiths.",
    details:
      "Religious clubs provide space for reflection, service, fellowship, and respectful discussion. They support students in building value-based communities while promoting understanding and belonging across different faith traditions.",
    image: "https://images.unsplash.com/photo-1438232992991-995b671e4668?w=800&q=85",
    overlayClass: "campus-card--purple",
  },
];

export const getClubBySlug = (slug) =>
  clubData.find((club) => club.slug.toLowerCase() === slug.toLowerCase());
