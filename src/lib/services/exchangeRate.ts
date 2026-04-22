import { getSettings } from './settings';
import { RestaurantSettings } from '@/types';

const BCV_API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

let cachedRate: number | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

export async function getBCVRate(): Promise<number> {
  try {
    // 1. Obtener configuraciones del restaurante
    const settings = await getSettings<RestaurantSettings>('restaurant_info');
    
    // 2. Si está configurado para usar tasa manual, retornarla directamente
    if (settings?.useManualRate && settings.manualRate) {
      return settings.manualRate;
    }

    // 3. Verificar caché para tasa automática
    const now = Date.now();
    if (cachedRate && (now - lastFetch < CACHE_DURATION)) {
      return cachedRate;
    }

    // 4. Consultar API externa
    const response = await fetch(BCV_API_URL);
    if (!response.ok) throw new Error('API BCV falló');
    
    const data = await response.json();
    const rate = parseFloat(data.promedio);
    
    if (isNaN(rate)) throw new Error('Tasa inválida');

    // Actualizar caché
    cachedRate = rate;
    lastFetch = now;

    return rate;
  } catch (error) {
    console.error('Error obteniendo tasa BCV:', error);
    
    // Fallback: Si la API falla, intentar usar la manual o un valor por defecto seguro
    const settings = await getSettings<RestaurantSettings>('restaurant_info');
    return settings?.manualRate || 36.5; // Valor de respaldo
  }
}
