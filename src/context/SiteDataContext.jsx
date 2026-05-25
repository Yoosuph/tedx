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
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
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
          subtitle: config.subtitle || '',
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

      // Load gallery images from localStorage (saved during admin save)
      const cachedGallery = loadFromStorage(STORAGE_KEYS.galleryImages, null);
      if (cachedGallery) {
        setGalleryImagesState(cachedGallery);
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

  // Load gallery images on demand (lazy)
  const fetchGalleryImages = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setGalleryLoading(true);
    try {
      const galleryData = await Promise.race([
        galleryAPI.getAll(),
        new Promise((_, reject) => setTimeout(
          () => reject(new Error('Gallery fetch timed out')), 12000
        )),
      ]);
      const existingState = loadFromStorage(STORAGE_KEYS.galleryImages, []);
      const existingMap = {};
      existingState.forEach(img => {
        existingMap[img.src] = img.showOnLanding;
        if (img.publicId) existingMap[img.publicId] = img.showOnLanding;
      });

      const formattedGallery = (galleryData || [])
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
          showOnLanding: existingMap[g.src] ?? existingMap[g.public_id] ?? true,
        }));
      setGalleryImagesState(formattedGallery);
      saveToStorage(STORAGE_KEYS.galleryImages, formattedGallery);
    } catch (error) {
      console.error('❌ Error loading gallery:', error);
      const cached = loadFromStorage(STORAGE_KEYS.galleryImages, defaultGalleryImages);
      if (cached) setGalleryImagesState(cached);
    } finally {
      setGalleryLoading(false);
      setGalleryLoaded(true);
    }
  }, []);

  // Load data and subscribe to real-time changes
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, using localStorage fallback');
      setLoading(false);
      return;
    }

    loadData();

    // Subscribe to real-time changes using a single consolidated WebSocket connection
    console.log('🔌 Initializing consolidated real-time database listener...');
    const dbChangesChannel = supabase
      .channel('realtime_db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_config' }, () => {
        console.log('🔄 Site config changed, reloading...');
        siteConfigAPI.get().then(config => {
          if (config) {
            const formattedConfig = {
              eventName: config.event_name,
              eventYear: config.event_year,
              theme: config.theme,
              tagline: config.tagline,
              subtitle: config.subtitle || '',
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
        }).catch(err => console.error('❌ Site config reload error:', err));
      })
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
        }).catch(err => console.error('❌ Speakers reload error:', err));
      })
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
        }).catch(err => console.error('❌ Schedule reload error:', err));
      })
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
        }).catch(err => console.error('❌ Ticket tiers reload error:', err));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_images' }, () => {
        console.log('🔄 Gallery changed, reloading...');
        galleryAPI.getAll().then(galleryData => {
          const existingState = loadFromStorage(STORAGE_KEYS.galleryImages, []);
          const existingMap = {};
          existingState.forEach(img => {
            existingMap[img.src] = img.showOnLanding;
            if (img.publicId) existingMap[img.publicId] = img.showOnLanding;
          });
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
              showOnLanding: existingMap[g.src] ?? existingMap[g.public_id] ?? true,
            }));
          setGalleryImagesState(formattedGallery);
          saveToStorage(STORAGE_KEYS.galleryImages, formattedGallery);
        }).catch(err => console.error('❌ Gallery reload error:', err));
      })
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
        }).catch(err => console.error('❌ Sponsors reload error:', err));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        console.log('🔄 Tickets changed, triggering refresh event...');
        window.dispatchEvent(new CustomEvent('tickets-changed'));
      })
      .subscribe((status) => {
        console.log('🔌 DB Changes subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Removing consolidated real-time database listener...');
      supabase.removeChannel(dbChangesChannel);
    };
  }, []);

  const updateSiteConfig = useCallback(async (newConfig) => {
    setSiteConfigState(newConfig);
    saveToStorage(STORAGE_KEYS.siteConfig, newConfig);

    if (isSupabaseConfigured()) {
      try {
        const payload = {
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
        };
        // Only include subtitle if column exists (added via migration)
        if (newConfig.subtitle !== undefined) {
          payload.subtitle = newConfig.subtitle;
        }
        await siteConfigAPI.update(payload);
        console.log('✅ Site config updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating site config in Supabase:', error);
      }
    }
  }, []);

  const updateSpeakers = useCallback(async (newSpeakers) => {
    // Capture current speaker IDs before updating state so we can detect deletions
    const previousSpeakers = speakers;
    setSpeakersState(newSpeakers);
    saveToStorage(STORAGE_KEYS.speakers, newSpeakers);

    if (isSupabaseConfigured()) {
      try {
        // Helper: a real DB id is a positive integer
        const isDbId = (id) => typeof id === 'number' && id > 0;

        // Detect deleted speakers (IDs in previous state but not in new state)
        const newIdSet = new Set(newSpeakers.map(s => s.id));
        const deletedSpeakers = previousSpeakers.filter(
          s => isDbId(s.id) && !newIdSet.has(s.id)
        );
        for (const deleted of deletedSpeakers) {
          await speakersAPI.delete(deleted.id);
          console.log(`🗑️ Speaker ${deleted.id} deleted from Supabase`);
        }

        // Create or update remaining speakers
        for (const speaker of newSpeakers) {
          const payload = {
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
          };

          if (isDbId(speaker.id)) {
            // Existing speaker — update
            await speakersAPI.update(speaker.id, payload);
          } else {
            // New speaker (temp string ID like "speaker-1716...") — create
            const created = await speakersAPI.create(payload);
            if (created) speaker.id = created.id;
          }
        }
        console.log('✅ Speakers updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating speakers in Supabase:', error);
      }
    }
  }, [speakers]);

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
    // Capture current schedule IDs before updating state so we can detect deletions
    const previousSchedule = schedule;
    setScheduleState(newSchedule);
    saveToStorage(STORAGE_KEYS.schedule, newSchedule);

    if (isSupabaseConfigured()) {
      try {
        // Helper: a real DB id is a positive integer
        const isDbId = (id) => typeof id === 'number' && id > 0;

        // Collect all current DB IDs from previous state
        const previousIds = new Set();
        for (const session of Object.values(previousSchedule)) {
          if (session?.items) {
            for (const item of session.items) {
              if (isDbId(item.id)) previousIds.add(item.id);
            }
          }
        }

        // Collect all DB IDs in the new state
        const newIds = new Set();
        for (const session of Object.values(newSchedule)) {
          if (session?.items) {
            for (const item of session.items) {
              if (isDbId(item.id)) newIds.add(item.id);
            }
          }
        }

        // Delete items that were removed
        for (const id of previousIds) {
          if (!newIds.has(id)) {
            await scheduleAPI.delete(id);
            console.log(`🗑️ Schedule item ${id} deleted from Supabase`);
          }
        }

        // Process each session block
        for (const [sessionKey, session] of Object.entries(newSchedule)) {
          if (!session?.items) continue;
          for (let i = 0; i < session.items.length; i++) {
            const item = session.items[i];
            const payload = {
              time: item.time,
              title: item.title,
              type: item.type,
              description: item.description,
              speaker_id: item.speakerId || null,
              order_index: i,
            };

            if (isDbId(item.id)) {
              // Existing item — update
              await scheduleAPI.update(item.id, {
                ...payload,
                session_type: sessionKey,
                session_label: session.label,
                session_time: session.time,
              });
            } else {
              // New item — create
              const created = await scheduleAPI.create({
                session_type: sessionKey,
                session_label: session.label,
                session_time: session.time,
                ...payload,
              });
              if (created) item.id = created.id;
            }
          }
        }

        console.log('✅ Schedule updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating schedule in Supabase:', error);
      }
    }
  }, [schedule]);

  const updateTicketTiers = useCallback(async (newTiers) => {
    // Capture current tier IDs before updating state so we can detect deletions
    const previousTiers = ticketTiers;
    setTicketTiersState(newTiers);
    saveToStorage(STORAGE_KEYS.ticketTiers, newTiers);

    if (isSupabaseConfigured()) {
      try {
        // ticket_tiers uses TEXT PKs (e.g. 'regular', 'vip', 'vvip')
        // Temp IDs from the UI look like 'tier-1716...'
        const isTempId = (id) => typeof id === 'string' && id.startsWith('tier-');

        // Detect deleted tiers
        const newIdSet = new Set(newTiers.map(t => t.id));
        const deletedTiers = previousTiers.filter(
          t => t.id && !isTempId(t.id) && !newIdSet.has(t.id)
        );
        for (const deleted of deletedTiers) {
          await ticketTiersAPI.delete(deleted.id);
          console.log(`🗑️ Ticket tier ${deleted.id} deleted from Supabase`);
        }

        // Create or update remaining tiers
        for (const tier of newTiers) {
          const payload = {
            name: tier.name,
            price: tier.price,
            currency: tier.currency,
            features: tier.features,
            popular: tier.popular,
          };

          if (isTempId(tier.id)) {
            // New tier — generate a proper slug ID and create
            const slugId = tier.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tier-${Date.now()}`;
            tier.id = slugId;
            payload.id = slugId;
            const created = await ticketTiersAPI.create({ id: slugId, ...payload });
            if (created) tier.id = created.id;
          } else {
            // Existing tier — update
            await ticketTiersAPI.update(tier.id, payload);
          }
        }
        console.log('✅ Ticket tiers updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating ticket tiers in Supabase:', error);
      }
    }
  }, [ticketTiers]);

  const updateGalleryImages = useCallback(async (newImages, deletedIds = []) => {
    setGalleryImagesState(newImages);
    saveToStorage(STORAGE_KEYS.galleryImages, newImages);

    if (isSupabaseConfigured()) {
      try {
        // Delete removed images first
        for (const id of deletedIds) {
          if (Number.isInteger(Number(id))) {
            await galleryAPI.delete(id);
          }
        }

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
        throw error;
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
    // Capture current sponsor IDs before updating state so we can detect deletions
    const previousSponsors = sponsors;
    setSponsorsState(newSponsors);
    saveToStorage(STORAGE_KEYS.sponsors, newSponsors);

    if (isSupabaseConfigured()) {
      try {
        // Helper: a real DB id is a positive integer
        const isDbId = (id) => typeof id === 'number' && id > 0;

        // Collect all current DB IDs from previous state
        const previousIds = new Set();
        for (const tierSponsors of Object.values(previousSponsors)) {
          if (Array.isArray(tierSponsors)) {
            for (const s of tierSponsors) {
              if (isDbId(s.id)) previousIds.add(s.id);
            }
          }
        }

        // Collect all DB IDs from new state
        const newIds = new Set();
        for (const tierSponsors of Object.values(newSponsors)) {
          if (Array.isArray(tierSponsors)) {
            for (const s of tierSponsors) {
              if (isDbId(s.id)) newIds.add(s.id);
            }
          }
        }

        // Delete removed sponsors
        for (const id of previousIds) {
          if (!newIds.has(id)) {
            await sponsorsAPI.delete(id);
            console.log(`🗑️ Sponsor ${id} deleted from Supabase`);
          }
        }

        // Create or update remaining sponsors
        let orderIndex = 0;
        for (const tier of ['presenting', 'platinum', 'gold', 'community']) {
          if (newSponsors[tier]) {
            for (const sponsor of newSponsors[tier]) {
              const payload = {
                name: sponsor.name,
                logo: sponsor.logo,
                tier: tier,
                order_index: orderIndex++,
              };

              if (isDbId(sponsor.id)) {
                // Existing sponsor — update
                await sponsorsAPI.update(sponsor.id, payload);
              } else {
                // New sponsor — create
                const created = await sponsorsAPI.create(payload);
                if (created) sponsor.id = created.id;
              }
            }
          }
        }
        console.log('✅ Sponsors updated in Supabase');
      } catch (error) {
        console.error('❌ Error updating sponsors in Supabase:', error);
      }
    }
  }, [sponsors]);

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
    galleryLoading,
    galleryLoaded,
    fetchGalleryImages,
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
