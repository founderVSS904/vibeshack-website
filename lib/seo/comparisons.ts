import { absoluteUrl } from './site'

export const comparisons = [
  {
    slug: 'green-screen-vs-white-cyc',
    title: 'Green Screen vs White Cyc Studio',
    shortTitle: 'Green Screen vs White Cyc',
    keyword: 'green screen vs white cyc studio',
    description: 'A practical comparison for deciding whether your San Francisco shoot needs a green screen studio or a clean white cyc studio.',
    image: '/studio-images/inside-green-screen-v20260509.jpg',
    imageAlt: 'Full green screen studio at VibeShack Studios San Francisco',
    primaryPage: '/green-screen-studio-sf/',
    secondaryPage: '/canvas-rental/',
    winner: 'Use green screen for compositing. Use white cyc for clean finished visuals.',
    primaryReason: 'Book green screen when the background gets built in post.',
    secondaryReason: 'Book the white cyc when the clean room is already the final look.',
    sections: [
      { heading: 'Choose green screen when the background changes later', body: 'Green screen is built for replacement: virtual sets, motion graphics, training modules, explainers, and backgrounds that do not exist in the physical room.' },
      { heading: 'Choose white cyc when the clean space is the look', body: 'White cyc keeps the subject in a real, minimal environment. It works beautifully for product launches, portraits, music videos, social ads, tutorials, and campaign visuals.' },
      { heading: 'The post-production difference matters', body: 'Green screen usually needs keying and compositing. White cyc can often move faster because the background is already the final look, though cleanup and retouching may still happen.' },
    ],
    faqs: [
      { question: 'Is green screen better than white cyc?', answer: 'Not universally. Green screen is better for compositing; white cyc is better for clean in-camera backgrounds.' },
      { question: 'Can VibeShack help me choose?', answer: 'Yes. If the final deliverable is unclear, start with the studio guide or contact the team before booking.' },
    ],
  },
  {
    slug: 'podcast-studio-vs-office-recording',
    title: 'Podcast Studio vs Office Recording',
    shortTitle: 'Podcast Studio vs Office',
    keyword: 'podcast studio vs office recording',
    description: 'Why a dedicated podcast studio usually beats a conference room for interviews, founder content, and brand shows.',
    image: '/studio-images/enhanced-executive-podcast-table-two-hosts-v20260510.jpg',
    imageAlt: 'Podcast studio compared with office recording at VibeShack Studios',
    primaryPage: '/podcast-studio-san-francisco/',
    secondaryPage: '/book/',
    winner: 'Use a podcast studio when the content needs to look and sound like a real brand asset.',
    primaryReason: 'Book a podcast set when the show needs clean audio and a look that stays consistent across episodes.',
    secondaryReason: 'Start a custom booking when the session mixes formats or needs a plan built around your team and gear.',
    sections: [
      { heading: 'Audio is the first quality signal', body: 'Offices have HVAC noise, glass reflections, hard walls, and interruptions. Podcast sets are built around microphones, controlled sound, and camera-ready conversations.' },
      { heading: 'Visual consistency is hard to fake', body: 'A dedicated studio keeps lighting, seating, camera positions, and background choices consistent across episodes and clips.' },
      { heading: 'Your team moves faster', body: 'When cameras, mics, and lighting are ready, the session becomes about content instead of troubleshooting gear.' },
    ],
    faqs: [
      { question: 'Can I record a podcast in an office?', answer: 'Yes, but it usually takes more setup and produces less consistent audio and visuals than a dedicated podcast studio.' },
      { question: 'When is an office good enough?', answer: 'An office can work for quick internal content. Use a studio when the asset is public-facing, sales-facing, or part of an ongoing show.' },
    ],
  },
  {
    slug: 'photography-studio-vs-location-shoot',
    title: 'Studio Photography vs Location Shoot',
    shortTitle: 'Studio vs Location Shoot',
    keyword: 'photography studio vs location shoot',
    description: 'A decision guide for choosing a controlled studio photo shoot or an on-location shoot for San Francisco campaigns.',
    image: '/studio-images/enhanced-photography-cyc-fashion-black-curtain-v20260716.jpg',
    imageAlt: 'Campaign photography created at VibeShack Studios San Francisco',
    primaryPage: '/canvas-rental/',
    secondaryPage: '/photo-services/',
    winner: 'Use the studio for control and repeatability. Use location when the place itself is part of the story.',
    primaryReason: 'Book Canvas Rental when lighting, timing, and repeatable results decide the campaign.',
    secondaryReason: 'Start with Photo Services when you want VibeShack to scope the shot list, lighting, and crew.',
    sections: [
      { heading: 'The studio creates control', body: 'Lighting, background, sound, weather, privacy, load-in, and timing are all easier to control indoors. Canvas Rental is a seamless white cyc wall with an overhead lighting grid, so the background stays clean and every setup can be repeated.' },
      { heading: 'Locations create context', body: 'A real office, store, street, or home can add authenticity when the place matters to the story. The trade is time: permits, travel, weather, and light that keeps moving.' },
      { heading: 'Campaigns often need both', body: 'Shoot hero portraits, products, and clean social crops on the cyc, then add a smaller set of location images for context.' },
    ],
    faqs: [
      { question: 'Is a studio better for product photography?', answer: 'Usually yes. Products benefit from controlled lighting, clean surfaces, repeatable angles, and fewer interruptions. The white cyc also gives you negative space for ads and packshots.' },
      { question: 'Can I shoot campaign photos and video in one studio booking?', answer: 'Yes. Canvas Rental works for both, so plan the shot list around lighting setups and capture stills and video in the same block. Booking is by the hour with a one hour minimum.' },
    ],
  },
]

export type Comparison = (typeof comparisons)[number]

export function getComparisonBySlug(slug: string) {
  return comparisons.find((comparison) => comparison.slug === slug)
}

export function comparisonUrl(slug: string) {
  return absoluteUrl(`/compare/${slug}/`)
}
