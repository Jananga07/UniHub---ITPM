const publicImage = (fileName) => encodeURI(`/${fileName}`);

export const clubData = [
  {
    slug: "sports",
    title: "Sports Clubs",
    description: "Join competitive and recreational clubs that build teamwork, confidence, and campus spirit.",
    details:
      "Sports clubs bring students together through training, tournaments, fitness programs, and team events. They create a strong sense of community while helping students build discipline, resilience, and leadership beyond the classroom.",
    image: publicImage("Sport club.jpg"),
    overlayClass: "campus-card--blue",
  },
  {
    slug: "activity",
    title: "Activity Based Clubs",
    description: "Explore clubs focused on leadership, creativity, volunteering, and practical student experiences.",
    details:
      "Activity based clubs give students opportunities to participate in projects, events, volunteering programs, and leadership initiatives. These communities are ideal for building practical skills, confidence, and long-term campus connections.",
    image: publicImage("Activity Based Club.png"),
    overlayClass: "campus-card--green",
  },
  {
    slug: "cultural",
    title: "Cultural Clubs",
    description: "Celebrate traditions, performances, and diversity through vibrant student-led cultural communities.",
    details:
      "Cultural clubs celebrate heritage, language, art, and performance while encouraging inclusion across the university. They offer students a welcoming space to share traditions, host events, and experience diverse perspectives.",
    image: publicImage("Cultural Club.png"),
    overlayClass: "campus-card--gold",
  },
  {
    slug: "media",
    title: "Media Clubs",
    description: "Develop photography, design, broadcasting, and digital storytelling skills with peers on campus.",
    details:
      "Media clubs help students sharpen creative and technical skills in photography, videography, editing, broadcasting, and design. They often support university events and provide a practical environment for content creation and storytelling.",
    image: publicImage("Media Club.png"),
    overlayClass: "campus-card--teal",
  },
  {
    slug: "international",
    title: "International Clubs",
    description: "Build global exposure, friendships, and collaboration through internationally minded societies.",
    details:
      "International clubs connect students through global networking, exchange-minded activities, cultural events, and collaboration opportunities. They encourage openness, communication, and cross-border friendship within campus life.",
    image: publicImage("International Club.png"),
    overlayClass: "campus-card--red",
  },
  {
    slug: "religious",
    title: "Religious Clubs",
    description: "Find inclusive communities for reflection, service, and shared values across different faiths.",
    details:
      "Religious clubs provide space for reflection, service, fellowship, and respectful discussion. They support students in building value-based communities while promoting understanding and belonging across different faith traditions.",
    image: publicImage("Religious Culb.png"),
    overlayClass: "campus-card--purple",
  },
];

export const getClubBySlug = (slug) =>
  clubData.find((club) => club.slug.toLowerCase() === slug.toLowerCase());