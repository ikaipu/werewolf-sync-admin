import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  updatedAt: Date;
  updatedBy: string;
}

export function useMaintenance() {
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const maintenanceRef = doc(db, 'settings', 'maintenance');

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      maintenanceRef,
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as MaintenanceSettings);
        } else {
          // Initialize with default values if document doesn't exist
          setSettings({
            enabled: false,
            message: '',
            updatedAt: new Date(),
            updatedBy: '',
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching maintenance settings:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const updateMaintenanceSettings = async (
    enabled: boolean,
    message: string,
    userId: string
  ) => {
    try {
      const maintenanceRef = doc(db, 'settings', 'maintenance');
      await setDoc(maintenanceRef, {
        enabled,
        message,
        updatedAt: new Date(),
        updatedBy: userId,
      });
      return true;
    } catch (error) {
      console.error('Error updating maintenance settings:', error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    error,
    updateMaintenanceSettings,
  };
}