import axios from '@/lib/axios';
import { MOCK_CITIES } from '@/lib/mock-data';
import { City, CityFilters } from '@/types';

export const citiesService = {
  async getAll(filters?: CityFilters): Promise<City[]> {
    try {
      const { data } = await axios.get('/cities', { params: filters });
      return data;
    } catch (error) {
      return MOCK_CITIES;
    }
  },
};
