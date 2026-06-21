import axiosInstance from './axios';
import { Coupon, CouponFilters, PaginatedResponse } from '@/types';

export const couponsApi = {
  getCoupons: async (params?: CouponFilters) => {
    const response = await axiosInstance.get<PaginatedResponse<Coupon>>('/cupones', { params });
    return response.data;
  },

  getCouponByCode: async (code: string) => {
    const response = await axiosInstance.get<Coupon>(`/cupones/codigo/${code}`);
    return response.data;
  },

  createCoupon: async (coupon: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await axiosInstance.post<Coupon>('/cupones', coupon);
    return response.data;
  },

  updateCoupon: async (id: number, coupon: Partial<Coupon>) => {
    const response = await axiosInstance.put<Coupon>(`/cupones/${id}`, coupon);
    return response.data;
  },

  deleteCoupon: async (id: number) => {
    const response = await axiosInstance.delete(`/cupones/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number) => {
    const response = await axiosInstance.patch<Coupon>(`/cupones/${id}/toggle`);
    return response.data;
  }
};
