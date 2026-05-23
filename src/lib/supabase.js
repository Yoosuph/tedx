import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found. Please check your .env file.');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Helper functions for database operations

/**
 * Site Configuration
 */
export const siteConfigAPI = {
  async get() {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching site config:', error);
      return null;
    }
    return data;
  },

  async update(updates) {
    const { data, error } = await supabase
      .from('site_config')
      .update(updates)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating site config:', error);
      return null;
    }
    return data;
  },

  async create(config) {
    const { data, error } = await supabase
      .from('site_config')
      .insert([config])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating site config:', error);
      return null;
    }
    return data;
  }
};

/**
 * Speakers
 */
export const speakersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching speakers:', error);
      return [];
    }
    return data;
  },

  async create(speaker) {
    const { data, error } = await supabase
      .from('speakers')
      .insert([speaker])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating speaker:', error);
      return null;
    }
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('speakers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating speaker:', error);
      return null;
    }
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('speakers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting speaker:', error);
      return false;
    }
    return true;
  }
};

/**
 * Schedule
 */
export const scheduleAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('schedule')
      .select(`
        *,
        speakers (id, name, role, image)
      `)
      .order('session_type', { ascending: true })
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }
    return data;
  },

  async create(item) {
    const { data, error } = await supabase
      .from('schedule')
      .insert([item])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating schedule item:', error);
      return null;
    }
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('schedule')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating schedule item:', error);
      return null;
    }
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting schedule item:', error);
      return false;
    }
    return true;
  }
};

/**
 * Ticket Tiers
 */
export const ticketTiersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('ticket_tiers')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) {
      console.error('Error fetching ticket tiers:', error);
      return [];
    }
    return data;
  },

  async create(tier) {
    const { data, error } = await supabase
      .from('ticket_tiers')
      .insert([tier])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating ticket tier:', error);
      return null;
    }
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('ticket_tiers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating ticket tier:', error);
      return null;
    }
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('ticket_tiers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting ticket tier:', error);
      return false;
    }
    return true;
  }
};

/**
 * Gallery Images
 */
export const galleryAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching gallery images:', error);
      return [];
    }
    return data;
  },

  async create(image) {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert([image])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating gallery image:', error);
      return null;
    }
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('gallery_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating gallery image:', error);
      return null;
    }
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting gallery image:', error);
      return false;
    }
    return true;
  }
};

/**
 * Sponsors
 */
export const sponsorsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('tier', { ascending: true })
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching sponsors:', error);
      return [];
    }
    return data;
  },

  async create(sponsor) {
    const { data, error } = await supabase
      .from('sponsors')
      .insert([sponsor])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating sponsor:', error);
      return null;
    }
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('sponsors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating sponsor:', error);
      return null;
    }
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('sponsors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting sponsor:', error);
      return false;
    }
    return true;
  }
};

/**
 * Tickets
 */
export const ticketsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
    return data;
  },

  async getByReference(reference) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('reference', reference)
      .single();
    
    if (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
    return data;
  },

  async create(ticket) {
    const { data, error } = await supabase
      .from('tickets')
      .insert([ticket])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating ticket:', error);
      return null;
    }
    return data;
  },

  async update(reference, updates) {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('reference', reference)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating ticket:', error);
      return null;
    }
    return data;
  }
};

export default supabase;
