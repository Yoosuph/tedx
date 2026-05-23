import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

// Validate environment variables
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local file');
  console.error('Please add:');
  console.error('  VITE_SUPABASE_URL=your-project-url');
  console.error('  VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Import site data
import { 
  siteConfig, 
  speakers, 
  schedule, 
  ticketTiers, 
  galleryImages, 
  sponsors 
} from './src/data/siteData.js';

async function seedDatabase() {
  console.log('🚀 Starting database seeding...\n');

  // 1. Seed site configuration
  console.log('📝 Seeding site configuration...');
  const { error: configError } = await supabase
    .from('site_config')
    .upsert([
      {
        event_name: siteConfig.eventName,
        event_year: siteConfig.eventYear,
        theme: siteConfig.theme,
        tagline: siteConfig.tagline,
        date: siteConfig.date,
        time: siteConfig.time,
        venue: siteConfig.venue,
        venue_short: siteConfig.venueShort,
        dress_code: siteConfig.dressCode,
        contact_email: siteConfig.contact.email,
        contact_phone: siteConfig.contact.phone,
        contact_whatsapp: siteConfig.contact.whatsapp,
        social_instagram: siteConfig.social.instagram,
        social_twitter: siteConfig.social.twitter,
        social_facebook: siteConfig.social.facebook,
        social_linkedin: siteConfig.social.linkedin
      }
    ]);

  if (configError) {
    console.error('❌ Error seeding site config:', configError.message);
  } else {
    console.log('✅ Site configuration seeded\n');
  }

  // 2. Seed speakers
  console.log('👥 Seeding speakers...');
  const speakersData = speakers.map(speaker => ({
    name: speaker.name,
    role: speaker.role,
    title: speaker.title,
    bio: speaker.bio,
    story: speaker.story,
    duration: speaker.duration,
    image: speaker.image,
    social_facebook: speaker.social?.facebook || null,
    social_instagram: speaker.social?.instagram || null,
    social_linkedin: speaker.social?.linkedin || null
  }));

  const { error: speakersError, data: insertedSpeakers } = await supabase
    .from('speakers')
    .upsert(speakersData)
    .select();

  if (speakersError) {
    console.error('❌ Error seeding speakers:', speakersError.message);
  } else {
    console.log(`✅ ${insertedSpeakers.length} speakers seeded\n`);
  }

  // 3. Seed schedule
  console.log('📅 Seeding schedule...');
  const scheduleData = [];
  
  // Morning session
  schedule.morning.items.forEach((item, index) => {
    scheduleData.push({
      session_type: 'morning',
      session_label: schedule.morning.label,
      session_time: schedule.morning.time,
      time: item.time,
      title: item.title,
      type: item.type,
      description: item.description,
      speaker_id: item.speakerId || null,
      order_index: index
    });
  });

  // Afternoon session
  schedule.afternoon.items.forEach((item, index) => {
    scheduleData.push({
      session_type: 'afternoon',
      session_label: schedule.afternoon.label,
      session_time: schedule.afternoon.time,
      time: item.time,
      title: item.title,
      type: item.type,
      description: item.description,
      speaker_id: item.speakerId || null,
      order_index: index
    });
  });

  const { error: scheduleError } = await supabase
    .from('schedule')
    .upsert(scheduleData);

  if (scheduleError) {
    console.error('❌ Error seeding schedule:', scheduleError.message);
  } else {
    console.log(`✅ ${scheduleData.length} schedule items seeded\n`);
  }

  // 4. Seed ticket tiers
  console.log('🎫 Seeding ticket tiers...');
  const tiersData = ticketTiers.map(tier => ({
    id: tier.id,
    name: tier.name,
    price: tier.price,
    currency: tier.currency,
    features: tier.features,
    popular: tier.popular || false
  }));

  const { error: tiersError } = await supabase
    .from('ticket_tiers')
    .upsert(tiersData);

  if (tiersError) {
    console.error('❌ Error seeding ticket tiers:', tiersError.message);
  } else {
    console.log(`✅ ${tiersData.length} ticket tiers seeded\n`);
  }

  // 5. Seed gallery images
  console.log('🖼️  Seeding gallery images...');
  const galleryData = galleryImages.map((img, index) => ({
    src: img.src,
    alt: img.alt,
    orientation: img.orientation,
    order_index: index
  }));

  const { error: galleryError } = await supabase
    .from('gallery_images')
    .upsert(galleryData);

  if (galleryError) {
    console.error('❌ Error seeding gallery images:', galleryError.message);
  } else {
    console.log(`✅ ${galleryData.length} gallery images seeded\n`);
  }

  // 6. Seed sponsors
  console.log('🤝 Seeding sponsors...');
  const sponsorsData = [];
  let orderIndex = 0;

  Object.entries(sponsors).forEach(([tier, sponsorList]) => {
    sponsorList.forEach(sponsor => {
      sponsorsData.push({
        tier: tier,
        name: sponsor.name,
        logo: sponsor.logo,
        order_index: orderIndex++
      });
    });
  });

  const { error: sponsorsError } = await supabase
    .from('sponsors')
    .upsert(sponsorsData);

  if (sponsorsError) {
    console.error('❌ Error seeding sponsors:', sponsorsError.message);
  } else {
    console.log(`✅ ${sponsorsData.length} sponsors seeded\n`);
  }

  console.log('🎉 Database seeding complete!');
}

// Run the seeding
seedDatabase().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
