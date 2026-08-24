export interface HealthStatus {
  status: string;
  service: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
