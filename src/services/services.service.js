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
    },

    async bookingRentService(bookingData) {
        try {
            const response = await api.post('/rent-tasks/them', bookingData);
            
            if (response.code === 1) {
                return response;
            } else {
                throw new Error(response.message || 'Booking rent failed');
            }
        } catch (error) {
            console.error('Error booking rent service:', error);
            throw error;
        }
    }
};