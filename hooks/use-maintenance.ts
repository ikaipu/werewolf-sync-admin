import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MaintenanceSettings {
  enabled: boolean;
  message: string;           // Japanese message (required)
  messageEn: string;         // English message (optional)
  bypassToken: string;
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
            messageEn: '',
            bypassToken: '',
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
    messageEn: string,
    bypassToken: string,
    userId: string
  ) => {
    try {
      const maintenanceRef = doc(db, 'settings', 'maintenance');
      await setDoc(maintenanceRef, {
        enabled,
        message,
        messageEn,
        bypassToken,
        updatedAt: new Date(),
        updatedBy: userId,
      });
      return true;
    } catch (error) {
      console.error('Error updating maintenance settings:', error);
      throw error;
    }
  };

  // Get message based on language
  const getMessage = (lang: string = 'ja') => {
    if (!settings) return '';
    if (lang === 'en' && settings.messageEn) {
      return settings.messageEn;
    }
    return settings.message;
  };

  return {
    settings,
    loading,
    error,
    updateMaintenanceSettings,
    getMessage,
  };
}