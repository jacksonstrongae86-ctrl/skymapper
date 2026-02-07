import { FlightRules } from '@/src/utils/types';

export interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude: number; // meters MSL
  speed: number; // m/s
  heading: number; // degrees
  accuracy: number; // meters
  timestamp: number;
}

export interface FlightRecording {
  id: string;
  startTime: number;
  positions: GPSPosition[];
  maxAltitude: number;
  maxSpeed: number;
  totalDistance: number; // meters
  flightRules: FlightRules;
}

class GPSService {
  private watchId: number | null = null;
  private positions: GPSPosition[] = [];
  private listeners: ((pos: GPSPosition) => void)[] = [];
  private isTracking = false;
  private startTime: number = 0;
  private flightRules: FlightRules = 'VFR';

  start(flightRules: FlightRules = 'VFR'): void {
    if (this.isTracking) {
      console.warn('GPS tracking already started');
      return;
    }

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    this.flightRules = flightRules;
    this.positions = [];
    this.startTime = Date.now();
    this.isTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const gpsPosition: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || 0,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        this.positions.push(gpsPosition);
        this.notifyListeners(gpsPosition);
      },
      (error) => {
        console.error('GPS Error:', error);
        this.isTracking = false;
        
        // Provide user-friendly error messages
        if (error.code === error.PERMISSION_DENIED) {
          throw new Error('Permiso GPS denegado. Por favor, habilita la ubicación en la configuración del navegador.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          throw new Error('Posición GPS no disponible. Verifica que tengas señal GPS.');
        } else if (error.code === error.TIMEOUT) {
          console.warn('GPS timeout - retrying...');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  stop(): FlightRecording {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;

    const recording: FlightRecording = {
      id: `flight-${this.startTime}`,
      startTime: this.startTime,
      positions: [...this.positions],
      maxAltitude: this.calculateMaxAltitude(),
      maxSpeed: this.calculateMaxSpeed(),
      totalDistance: this.calculateTotalDistance(),
      flightRules: this.flightRules,
    };

    return recording;
  }

  onPosition(listener: (pos: GPSPosition) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getCurrentPosition(): Promise<GPSPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || 0,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  isActive(): boolean {
    return this.isTracking;
  }

  getPositions(): GPSPosition[] {
    return [...this.positions];
  }

  private notifyListeners(position: GPSPosition): void {
    this.listeners.forEach((listener) => {
      try {
        listener(position);
      } catch (error) {
        console.error('Error in GPS listener:', error);
      }
    });
  }

  private calculateMaxAltitude(): number {
    if (this.positions.length === 0) return 0;
    return Math.max(...this.positions.map((p) => p.altitude));
  }

  private calculateMaxSpeed(): number {
    if (this.positions.length === 0) return 0;
    return Math.max(...this.positions.map((p) => p.speed));
  }

  private calculateTotalDistance(): number {
    if (this.positions.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < this.positions.length; i++) {
      const prev = this.positions[i - 1];
      const curr = this.positions[i];
      totalDistance += this.haversineDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }

    return totalDistance;
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const gpsService = new GPSService();
