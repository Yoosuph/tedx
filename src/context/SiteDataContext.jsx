import { createContext, useContext, useState, useCallback } from 'react';
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
    // Seed localStorage with defaults on first load
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
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

  const updateSiteConfig = useCallback((newConfig) => {
    setSiteConfigState(newConfig);
    saveToStorage(STORAGE_KEYS.siteConfig, newConfig);
  }, []);

  const updateSpeakers = useCallback((newSpeakers) => {
    setSpeakersState(newSpeakers);
    saveToStorage(STORAGE_KEYS.speakers, newSpeakers);
  }, []);

  const updateSchedule = useCallback((newSchedule) => {
    setScheduleState(newSchedule);
    saveToStorage(STORAGE_KEYS.schedule, newSchedule);
  }, []);

  const updateTicketTiers = useCallback((newTiers) => {
    setTicketTiersState(newTiers);
    saveToStorage(STORAGE_KEYS.ticketTiers, newTiers);
  }, []);

  const updateGalleryImages = useCallback((newImages) => {
    setGalleryImagesState(newImages);
    saveToStorage(STORAGE_KEYS.galleryImages, newImages);
  }, []);

  const updateSponsors = useCallback((newSponsors) => {
    setSponsorsState(newSponsors);
    saveToStorage(STORAGE_KEYS.sponsors, newSponsors);
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
