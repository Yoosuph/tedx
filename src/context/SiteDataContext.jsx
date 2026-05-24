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
  const [siteConfig, setSiteConfigState] = useState(defaultSiteConfig);
  const [speakers, setSpeakersState] = useState(defaultSpeakers);
  const [schedule, setScheduleState] = useState(defaultSchedule);
  const [ticketTiers, setTicketTiersState] = useState(defaultTicketTiers);
  const [galleryImages, setGalleryImagesState] = useState(defaultGalleryImages);
  const [sponsors, setSponsorsState] = useState(defaultSponsors);

  // Load data from Supabase
  const loadData = async () => {
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
            .sort((a, b) => a.order_index - b.order_index)
            .map(s => ({
              id: s.id,
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
            .sort((a, b) => a.order_index - b.order_index)
            .map(s => ({
              id: s.id,
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
        const formattedGallery = galleryData
          .sort((a, b) => a.order_index - b.order_index)
          .map(g => ({
            id: g.id,
            src: g.src,
            alt: g.alt,
            orientation: g.orientation,
            publicId: g.public_id,
            resourceType: g.resource_type,
            format: g.format,
            width: g.width,
            height: g.height,
            bytes: g.bytes,
            duration: g.duration,
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

        sponsorsData
          .sort((a, b) => a.order_index - b.order_index)
          .forEach(s => {
            if (groupedSponsors[s.tier]) {
              groupedSponsors[s.tier].push({
                id: s.id,
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
      // On error, fall back to localStorage cache
      console.log('🔄 Falling back to localStorage cache...');
      setSiteConfigState(loadFromStorage(STORAGE_KEYS.siteConfig, defaultSiteConfig));
      setSpeakersState(loadFromStorage(STORAGE_KEYS.speakers, defaultSpeakers));
      setScheduleState(loadFromStorage(STORAGE_KEYS.schedule, defaultSchedule));
      setTicketTiersState(loadFromStorage(STORAGE_KEYS.ticketTiers, defaultTicketTiers));
      setGalleryImagesState(loadFromStorage(STORAGE_KEYS.galleryImages, defaultGalleryImages));
      setSponsorsState(loadFromStorage(STORAGE_KEYS.sponsors, defaultSponsors));
    } finally {
      setLoading(false);
    }
  };

  // Load data and subscribe to real-time changes
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, using localStorage fallback');
      setLoading(false);
      return;
    }

    loadData();

    // Subscribe to real-time changes
    const subscriptions = [];

    // Site config changes
    const siteConfigSub = supabase
      .channel('site_config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_config' }, () => {
        console.log('🔄 Site config changed, reloading...');
        siteConfigAPI.get().then(config => {
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
        });
      })
      .subscribe();
    subscriptions.push(siteConfigSub);

    // Speakers changes
    const speakersSub = supabase
      .channel('speakers_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'speakers' }, () => {
        console.log('🔄 Speakers changed, reloading...');
        speakersAPI.getAll().then(speakersData => {
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
        });
      })
      .subscribe();
    subscriptions.push(speakersSub);

    // Schedule changes
    const scheduleSub = supabase
      .channel('schedule_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' }, () => {
        console.log('🔄 Schedule changed, reloading...');
        scheduleAPI.getAll().then(scheduleData => {
          const morning = {
            label: scheduleData.find(s => s.session_type === 'morning')?.session_label || 'Morning Session',
            time: scheduleData.find(s => s.session_type === 'morning')?.session_time || '',
            items: scheduleData
              .filter(s => s.session_type === 'morning')
              .sort((a, b) => a.order_index - b.order_index)
              .map(s => ({
                id: s.id,
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
              .sort((a, b) => a.order_index - b.order_index)
              .map(s => ({
                id: s.id,
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
        });
      })
      .subscribe();
    subscriptions.push(scheduleSub);

    // Ticket tiers changes
    const tiersSub = supabase
      .channel('ticket_tiers_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_tiers' }, () => {
        console.log('🔄 Ticket tiers changed, reloading...');
        ticketTiersAPI.getAll().then(tiersData => {
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
        });
      })
      .subscribe();
    subscriptions.push(tiersSub);

    // Gallery changes
    const gallerySub = supabase
      .channel('gallery_images_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_images' }, () => {
        console.log('🔄 Gallery changed, reloading...');
        galleryAPI.getAll().then(galleryData => {
          const formattedGallery = galleryData
            .sort((a, b) => a.order_index - b.order_index)
            .map(g => ({
              id: g.id,
              src: g.src,
              alt: g.alt,
              orientation: g.orientation,
              publicId: g.public_id,
              resourceType: g.resource_type,
              format: g.format,
              width: g.width,
              height: g.height,
              bytes: g.bytes,
              duration: g.duration,
            }));
          setGalleryImagesState(formattedGallery);
          saveToStorage(STORAGE_KEYS.galleryImages, formattedGallery);
        });
      })
      .subscribe();
    subscriptions.push(gallerySub);

    // Sponsors changes
    const sponsorsSub = supabase
      .channel('sponsors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsors' }, () => {
        console.log('🔄 Sponsors changed, reloading...');
        sponsorsAPI.getAll().then(sponsorsData => {
          const groupedSponsors = {
            presenting: [],
            platinum: [],
            gold: [],
            community: [],
          };

          sponsorsData
            .sort((a, b) => a.order_index - b.order_index)
            .forEach(s => {
              if (groupedSponsors[s.tier]) {
                groupedSponsors[s.tier].push({
                  id: s.id,
                  name: s.name,
                  logo: s.logo,
                });
              }
            });

          setSponsorsState(groupedSponsors);
          saveToStorage(STORAGE_KEYS.sponsors, groupedSponsors);
        });
      })
      .subscribe();
    subscriptions.push(sponsorsSub);

    // Tickets changes (for admin dashboard)
    const ticketsSub = supabase
      .channel('tickets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        console.log('🔄 Tickets changed, triggering refresh event...');
        window.dispatchEvent(new CustomEvent('tickets-changed'));
      })
      .subscribe();
    subscriptions.push(ticketsSub);

    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.forEach(sub => supabase.removeChannel(sub));
    };
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
        for (const speaker of newSpeakers) {
          if (speaker.id) {
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
          } else {
            const created = await speakersAPI.create({
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
            speaker.id = created.id;
          }
        }
        console.log('✅ Speakers updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating speakers in Supabase:', error);
      }
    }
  }, []);

  const deleteSpeaker = useCallback(async (speakerId) => {
    if (!isSupabaseConfigured()) return;

    try {
      await speakersAPI.delete(speakerId);
      console.log('✅ Speaker deleted from Supabase');
    } catch (error) {
      console.error('❌ Error deleting speaker from Supabase:', error);
    }
  }, []);

  const updateSchedule = useCallback(async (newSchedule) => {
    setScheduleState(newSchedule);
    saveToStorage(STORAGE_KEYS.schedule, newSchedule);

    if (isSupabaseConfigured()) {
      try {
        for (let i = 0; i < newSchedule.morning.items.length; i++) {
          const item = newSchedule.morning.items[i];
          if (item.id) {
            await scheduleAPI.update(item.id, {
              time: item.time,
              title: item.title,
              type: item.type,
              description: item.description,
              speaker_id: item.speakerId,
              order_index: i,
            });
          } else {
            const created = await scheduleAPI.create({
              session_type: 'morning',
              session_label: newSchedule.morning.label,
              session_time: newSchedule.morning.time,
              time: item.time,
              title: item.title,
              type: item.type,
              description: item.description,
              speaker_id: item.speakerId,
              order_index: i,
            });
            item.id = created.id;
          }
        }

        for (let i = 0; i < newSchedule.afternoon.items.length; i++) {
          const item = newSchedule.afternoon.items[i];
          if (item.id) {
            await scheduleAPI.update(item.id, {
              time: item.time,
              title: item.title,
              type: item.type,
              description: item.description,
              speaker_id: item.speakerId,
              order_index: i,
            });
          } else {
            const created = await scheduleAPI.create({
              session_type: 'afternoon',
              session_label: newSchedule.afternoon.label,
              session_time: newSchedule.afternoon.time,
              time: item.time,
              title: item.title,
              type: item.type,
              description: item.description,
              speaker_id: item.speakerId,
              order_index: i,
            });
            item.id = created.id;
          }
        }

        console.log('✅ Schedule updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating schedule in Supabase:', error);
      }
    }
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
        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i];
          const payload = {
            src: img.src,
            alt: img.alt,
            orientation: img.orientation,
            order_index: i,
            public_id: img.publicId ?? null,
            resource_type: img.resourceType ?? null,
            format: img.format ?? null,
            width: img.width ?? null,
            height: img.height ?? null,
            bytes: img.bytes ?? null,
            duration: img.duration ?? null,
          };
          // Only update if the id is a proper integer from the database
          // (client-generated temp IDs like 'img-...' mean it's a new record)
          if (img.id && Number.isInteger(Number(img.id))) {
            await galleryAPI.update(img.id, payload);
          } else {
            const created = await galleryAPI.create(payload);
            img.id = created.id;
          }
        }
        console.log('✅ Gallery images updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating gallery images in Supabase:', error);
        throw error; // Re-throw so AdminGallery's handleSave can react
      }
    }
  }, []);

  const deleteGalleryImage = useCallback(async (imageId) => {
    if (!isSupabaseConfigured()) return;

    try {
      await galleryAPI.delete(imageId);
      console.log('✅ Gallery image deleted from Supabase');
    } catch (error) {
      console.error('❌ Error deleting gallery image from Supabase:', error);
    }
  }, []);

  const updateSponsors = useCallback(async (newSponsors) => {
    setSponsorsState(newSponsors);
    saveToStorage(STORAGE_KEYS.sponsors, newSponsors);

    if (isSupabaseConfigured()) {
      try {
        let orderIndex = 0;
        for (const tier of ['presenting', 'platinum', 'gold', 'community']) {
          if (newSponsors[tier]) {
            for (const sponsor of newSponsors[tier]) {
              if (sponsor.id) {
                await sponsorsAPI.update(sponsor.id, {
                  name: sponsor.name,
                  logo: sponsor.logo,
                  tier: tier,
                  order_index: orderIndex++,
                });
              } else {
                const created = await sponsorsAPI.create({
                  name: sponsor.name,
                  logo: sponsor.logo,
                  tier: tier,
                  order_index: orderIndex++,
                });
                sponsor.id = created.id;
              }
            }
          }
        }
        console.log('✅ Sponsors updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating sponsors in Supabase:', error);
      }
    }
  }, []);

  const deleteSponsor = useCallback(async (sponsorId) => {
    if (!isSupabaseConfigured()) return;

    try {
      await sponsorsAPI.delete(sponsorId);
      console.log('✅ Sponsor deleted from Supabase');
    } catch (error) {
      console.error('❌ Error deleting sponsor from Supabase:', error);
    }
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
    deleteSpeaker,
    schedule,
    updateSchedule,
    ticketTiers,
    updateTicketTiers,
    galleryImages,
    updateGalleryImages,
    deleteGalleryImage,
    sponsors,
    updateSponsors,
    deleteSponsor,
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
