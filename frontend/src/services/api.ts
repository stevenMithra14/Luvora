import { HealthStatus } from '../types';
import { API_BASE_URL } from '../utils/constants';

export async function fetchHealthStatus(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch health status:', error);
    return {
      status: 'error',
      service: 'Luvora API (Disconnected)'
    };
  }
}
