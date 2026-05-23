import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, siteConfigAPI, speakersAPI, scheduleAPI, ticketTiersAPI, galleryAPI, sponsorsAPI } from '../lib/supabase';
import {
  siteConfig as defaultSiteConfig,
  speakers as defaultSpeakers,
  schedule as defaultSchedule,
  ticketTiers as defaultTicketTiers,
  galleryImages as defaultGalleryImages,
  sponsors as defaultSponsors,
  tedxBoilerplate,
} from '../data/siteData';

const STORAGE_KEYS = {
  siteConfig: 'tedx_site_config',
  speakers: 'tedx_speakers',
  schedule: 'tedx_schedule',
  ticketTiers: 'tedx_ticket_tiers',
  galleryImages: 'tedx_gallery_images',
  sponsors: 'tedx_sponsors',
};

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
};

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfigState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.siteConfig, defaultSiteConfig)
  );
  const [speakers, setSpeakersState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.speakers, defaultSpeakers)
  );
  const [schedule, setScheduleState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.schedule, defaultSchedule)
  );
  const [ticketTiers, setTicketTiersState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.ticketTiers, defaultTicketTiers)
  );
  const [galleryImages, setGalleryImagesState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.galleryImages, defaultGalleryImages)
  );
  const [sponsors, setSponsorsState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.sponsors, defaultSponsors)
  );

  // Load data from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured. Using localStorage fallback.');
      setLoading(false);
      return;
    }

    async function loadFromSupabase() {
      try {
        console.log('🔄 Loading data from Supabase...');

        // Load site config
        const config = await siteConfigAPI.get();
        if (config) {
          const formattedConfig = {
            eventName: config.event_name,
            eventYear: config.event_year,
            theme: config.theme,
            tagline: config.tagline,
            date: config.date,
            time: config.time,
            venue: config.venue,
            venueShort: config.venue_short,
            dressCode: config.dress_code,
            contact: {
              email: config.contact_email,
              phone: config.contact_phone,
              whatsapp: config.contact_whatsapp,
            },
            social: {
              instagram: config.social_instagram,
              twitter: config.social_twitter,
              facebook: config.social_facebook,
              linkedin: config.social_linkedin,
            },
          };
          setSiteConfigState(formattedConfig);
          saveToStorage(STORAGE_KEYS.siteConfig, formattedConfig);
        }

        // Load speakers
        const speakersData = await speakersAPI.getAll();
        if (speakersData && speakersData.length > 0) {
          const formattedSpeakers = speakersData.map(s => ({
            id: s.id,
            name: s.name,
            role: s.role,
            title: s.title,
            bio: s.bio,
            story: s.story,
            duration: s.duration,
            image: s.image,
            social: {
              facebook: s.social_facebook,
              instagram: s.social_instagram,
              linkedin: s.social_linkedin,
            },
          }));
          setSpeakersState(formattedSpeakers);
          saveToStorage(STORAGE_KEYS.speakers, formattedSpeakers);
        }

        // Load schedule
        const scheduleData = await scheduleAPI.getAll();
        if (scheduleData && scheduleData.length > 0) {
          const morning = {
            label: scheduleData.find(s => s.session_type === 'morning')?.session_label || 'Morning Session',
            time: scheduleData.find(s => s.session_type === 'morning')?.session_time || '',
            items: scheduleData
              .filter(s => s.session_type === 'morning')
              .map(s => ({
                time: s.time,
                title: s.title,
                type: s.type,
                description: s.description,
                speakerId: s.speaker_id,
              })),
          };

          const afternoon = {
            label: scheduleData.find(s => s.session_type === 'afternoon')?.session_label || 'Afternoon Session',
            time: scheduleData.find(s => s.session_type === 'afternoon')?.session_time || '',
            items: scheduleData
              .filter(s => s.session_type === 'afternoon')
              .map(s => ({
                time: s.time,
                title: s.title,
                type: s.type,
                description: s.description,
                speakerId: s.speaker_id,
              })),
          };

          const formattedSchedule = { morning, afternoon };
          setScheduleState(formattedSchedule);
          saveToStorage(STORAGE_KEYS.schedule, formattedSchedule);
        }

        // Load ticket tiers
        const tiersData = await ticketTiersAPI.getAll();
        if (tiersData && tiersData.length > 0) {
          const formattedTiers = tiersData.map(t => ({
            id: t.id,
            name: t.name,
            price: t.price,
            currency: t.currency,
            features: t.features,
            popular: t.popular,
          }));
          setTicketTiersState(formattedTiers);
          saveToStorage(STORAGE_KEYS.ticketTiers, formattedTiers);
        }

        // Load gallery images
        const galleryData = await galleryAPI.getAll();
        if (galleryData && galleryData.length > 0) {
          const formattedGallery = galleryData.map(g => ({
            id: g.id,
            src: g.src,
            alt: g.alt,
            orientation: g.orientation,
          }));
          setGalleryImagesState(formattedGallery);
          saveToStorage(STORAGE_KEYS.galleryImages, formattedGallery);
        }

        // Load sponsors
        const sponsorsData = await sponsorsAPI.getAll();
        if (sponsorsData && sponsorsData.length > 0) {
          const groupedSponsors = {
            presenting: [],
            platinum: [],
            gold: [],
            community: [],
          };

          sponsorsData.forEach(s => {
            if (groupedSponsors[s.tier]) {
              groupedSponsors[s.tier].push({
                name: s.name,
                logo: s.logo,
              });
            }
          });

          setSponsorsState(groupedSponsors);
          saveToStorage(STORAGE_KEYS.sponsors, groupedSponsors);
        }

        console.log('✅ Data loaded from Supabase');
      } catch (error) {
        console.error('❌ Error loading from Supabase:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFromSupabase();
  }, []);

  const updateSiteConfig = useCallback(async (newConfig) => {
    setSiteConfigState(newConfig);
    saveToStorage(STORAGE_KEYS.siteConfig, newConfig);

    if (isSupabaseConfigured()) {
      try {
        await siteConfigAPI.update({
          event_name: newConfig.eventName,
          event_year: newConfig.eventYear,
          theme: newConfig.theme,
          tagline: newConfig.tagline,
          date: newConfig.date,
          time: newConfig.time,
          venue: newConfig.venue,
          venue_short: newConfig.venueShort,
          dress_code: newConfig.dressCode,
          contact_email: newConfig.contact.email,
          contact_phone: newConfig.contact.phone,
          contact_whatsapp: newConfig.contact.whatsapp,
          social_instagram: newConfig.social.instagram,
          social_twitter: newConfig.social.twitter,
          social_facebook: newConfig.social.facebook,
          social_linkedin: newConfig.social.linkedin,
        });
        console.log('✅ Site config updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating site config in Supabase:', error);
      }
    }
  }, []);

  const updateSpeakers = useCallback(async (newSpeakers) => {
    setSpeakersState(newSpeakers);
    saveToStorage(STORAGE_KEYS.speakers, newSpeakers);

    if (isSupabaseConfigured()) {
      try {
        // This is a simplified update - in production you'd want to handle creates, updates, and deletes separately
        for (const speaker of newSpeakers) {
          await speakersAPI.update(speaker.id, {
            name: speaker.name,
            role: speaker.role,
            title: speaker.title,
            bio: speaker.bio,
            story: speaker.story,
            duration: speaker.duration,
            image: speaker.image,
            social_facebook: speaker.social?.facebook,
            social_instagram: speaker.social?.instagram,
            social_linkedin: speaker.social?.linkedin,
          });
        }
        console.log('✅ Speakers updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating speakers in Supabase:', error);
      }
    }
  }, []);

  const updateSchedule = useCallback(async (newSchedule) => {
    setScheduleState(newSchedule);
    saveToStorage(STORAGE_KEYS.schedule, newSchedule);

    // Note: Schedule updates would need more complex logic to handle session-level changes
    // For now, we're just updating localStorage
    console.warn('⚠️ Schedule updates to Supabase not yet implemented');
  }, []);

  const updateTicketTiers = useCallback(async (newTiers) => {
    setTicketTiersState(newTiers);
    saveToStorage(STORAGE_KEYS.ticketTiers, newTiers);

    if (isSupabaseConfigured()) {
      try {
        for (const tier of newTiers) {
          await ticketTiersAPI.update(tier.id, {
            name: tier.name,
            price: tier.price,
            currency: tier.currency,
            features: tier.features,
            popular: tier.popular,
          });
        }
        console.log('✅ Ticket tiers updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating ticket tiers in Supabase:', error);
      }
    }
  }, []);

  const updateGalleryImages = useCallback(async (newImages) => {
    setGalleryImagesState(newImages);
    saveToStorage(STORAGE_KEYS.galleryImages, newImages);

    if (isSupabaseConfigured()) {
      try {
        for (const img of newImages) {
          await galleryAPI.update(img.id, {
            src: img.src,
            alt: img.alt,
            orientation: img.orientation,
          });
        }
        console.log('✅ Gallery images updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating gallery images in Supabase:', error);
      }
    }
  }, []);

  const updateSponsors = useCallback(async (newSponsors) => {
    setSponsorsState(newSponsors);
    saveToStorage(STORAGE_KEYS.sponsors, newSponsors);

    // Note: Sponsor updates would need more complex logic to handle tier-level changes
    // For now, we're just updating localStorage
    console.warn('⚠️ Sponsor updates to Supabase not yet implemented');
  }, []);

  const resetToDefaults = useCallback(() => {
    updateSiteConfig(defaultSiteConfig);
    updateSpeakers(defaultSpeakers);
    updateSchedule(defaultSchedule);
    updateTicketTiers(defaultTicketTiers);
    updateGalleryImages(defaultGalleryImages);
    updateSponsors(defaultSponsors);
  }, [updateSiteConfig, updateSpeakers, updateSchedule, updateTicketTiers, updateGalleryImages, updateSponsors]);

  const value = {
    loading,
    siteConfig,
    updateSiteConfig,
    speakers,
    updateSpeakers,
    schedule,
    updateSchedule,
    ticketTiers,
    updateTicketTiers,
    galleryImages,
    updateGalleryImages,
    sponsors,
    updateSponsors,
    tedxBoilerplate,
    resetToDefaults,
    isSupabaseConfigured: isSupabaseConfigured(),
  };

  return (
    <SiteDataContext.Provider value={value}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider');
  return ctx;
}
