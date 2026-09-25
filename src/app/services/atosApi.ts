import { Ato } from '../types/ato';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-cea7216a`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// Check if server is available
let serverAvailable: boolean | null = null;
let checkInProgress = false;

async function checkServerHealth(): Promise<boolean> {
  if (serverAvailable !== null) {
    return serverAvailable;
  }
  
  if (checkInProgress) {
    // Wait for ongoing check
    await new Promise(resolve => setTimeout(resolve, 100));
    return serverAvailable ?? false;
  }
  
  checkInProgress = true;
  
  try {
    const response = await fetch(`${API_URL}/health`, { 
      headers,
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    serverAvailable = response.ok;
    return serverAvailable;
  } catch (error) {
    // Silently work in offline mode
    serverAvailable = false;
    return false;
  } finally {
    checkInProgress = false;
  }
}

export function getServerStatus(): boolean | null {
  return serverAvailable;
}

export async function initializeDatabase(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/init`, {
      method: 'POST',
      headers
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Database initialized successfully!');
      serverAvailable = true;
      return true;
    } else {
      console.error('Failed to initialize database:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

export const atosApi = {
  // Get all atos
  async getAll(): Promise<Ato[]> {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      // Fallback to localStorage
      const saved = localStorage.getItem('atos');
      return saved ? JSON.parse(saved) : [];
    }
    
    try {
      const response = await fetch(`${API_URL}/atos`, { headers });
      
      if (!response.ok) {
        console.log(`Server returned ${response.status}, using localStorage`);
        const saved = localStorage.getItem('atos');
        return saved ? JSON.parse(saved) : [];
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.log('Server returned error, using localStorage:', data.error);
        const saved = localStorage.getItem('atos');
        return saved ? JSON.parse(saved) : [];
      }
      
      return data.data || [];
    } catch (error) {
      console.log('Error fetching atos from server, using localStorage:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('atos');
      return saved ? JSON.parse(saved) : [];
    }
  },

  // Get single ato by ID
  async getById(id: string): Promise<Ato> {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      const saved = localStorage.getItem('atos');
      const atos = saved ? JSON.parse(saved) : [];
      const ato = atos.find((a: Ato) => a.id === id);
      if (!ato) throw new Error('Ato não encontrado');
      return ato;
    }
    
    try {
      const response = await fetch(`${API_URL}/atos/${id}`, { headers });
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error fetching ato:', data.error);
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching ato from server:', error);
      throw error;
    }
  },

  // Create new ato
  async create(ato: Ato): Promise<Ato> {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      // Save to localStorage only
      console.log('Server offline, saving to localStorage only');
      const saved = localStorage.getItem('atos');
      const atos = saved ? JSON.parse(saved) : [];
      atos.unshift(ato);
      localStorage.setItem('atos', JSON.stringify(atos));
      console.log('Ato saved to localStorage:', ato);
      return ato;
    }
    
    try {
      console.log('Creating ato on server:', ato);
      const response = await fetch(`${API_URL}/atos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ato)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error creating ato:', data.error);
        throw new Error(data.error);
      }
      
      console.log('Ato created successfully on server:', data.data);
      return data.data;
    } catch (error) {
      console.error('Error creating ato on server:', error);
      // Fallback: save to localStorage
      console.log('Fallback: saving to localStorage');
      const saved = localStorage.getItem('atos');
      const atos = saved ? JSON.parse(saved) : [];
      atos.unshift(ato);
      localStorage.setItem('atos', JSON.stringify(atos));
      return ato;
    }
  },

  // Update ato
  async update(id: string, ato: Ato): Promise<Ato> {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      const saved = localStorage.getItem('atos');
      const atos = saved ? JSON.parse(saved) : [];
      const index = atos.findIndex((a: Ato) => a.id === id);
      if (index !== -1) {
        atos[index] = ato;
        localStorage.setItem('atos', JSON.stringify(atos));
      }
      return ato;
    }
    
    try {
      const response = await fetch(`${API_URL}/atos/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(ato)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error updating ato:', data.error);
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error updating ato on server:', error);
      throw error;
    }
  },

  // Delete ato
  async delete(id: string): Promise<void> {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      const saved = localStorage.getItem('atos');
      const atos = saved ? JSON.parse(saved) : [];
      const filtered = atos.filter((a: Ato) => a.id !== id);
      localStorage.setItem('atos', JSON.stringify(filtered));
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/atos/${id}`, {
        method: 'DELETE',
        headers
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error deleting ato:', data.error);
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting ato on server:', error);
      throw error;
    }
  }
};