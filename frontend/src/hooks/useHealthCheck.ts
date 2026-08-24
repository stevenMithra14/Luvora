import { useState, useEffect } from 'react';
import { HealthStatus } from '../types';
import { fetchHealthStatus } from '../services/api';

export function useHealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    fetchHealthStatus().then((data) => {
      if (mounted) {
        setHealth(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { health, loading };
}
