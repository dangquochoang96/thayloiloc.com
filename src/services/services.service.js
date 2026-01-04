import { api } from './api.js';

export const servicesService = {
    getListService() {
        return api.get('/service/listService');
    },

    async bookingService(bookingData) {
        try {
            const response = await api.post('/tasks/them', bookingData);
            
            if (response.code === 1) {
                return response;
            } else {
                throw new Error(response.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Error booking service:', error);
            throw error;
        }
    }
};