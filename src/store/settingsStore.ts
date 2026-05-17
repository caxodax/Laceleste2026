import { create } from 'zustand';
import { getAllSettings } from '@/lib/services/settings';
import { RestaurantSettings, HeroSettings, AboutSettings, LoyaltySettings } from '@/types';

interface SettingsState {
  info: RestaurantSettings | null;
  hero: HeroSettings | null;
  about: AboutSettings | null;
  loyalty: LoyaltySettings | null;
  bcvRate: number | null;
  loading: boolean;
  initialized: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  info: null,
  hero: null,
  about: null,
  loyalty: null,
  bcvRate: null,
  loading: false,
  initialized: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const [data, rate] = await Promise.all([
        getAllSettings(),
        import('@/lib/services/exchangeRate').then(m => m.getBCVRate())
      ]);
      
      const defaultLoyalty: LoyaltySettings = {
        active: true,
        pointsPerOrder: 1,
        pointsToReward: 10,
        rewardDescription: 'Hamburguesa Gratis'
      };

      set({
        info: data.restaurant_info || null,
        hero: data.hero_settings || null,
        about: data.about_settings || null,
        loyalty: data.loyalty_settings || defaultLoyalty,
        bcvRate: rate,
        initialized: true,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
