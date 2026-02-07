export interface MotionData {
  heading: number; // Compass heading in degrees (0-360)
  pitch: number; // Device pitch in degrees
  roll: number; // Device roll in degrees
  gForce: number; // G-force magnitude
  timestamp: number;
}

class MotionService {
  private orientationListeners: ((data: MotionData) => void)[] = [];
  private motionListeners: ((data: MotionData) => void)[] = [];
  private isActive = false;
  private currentHeading = 0;
  private currentPitch = 0;
  private currentRoll = 0;
  private currentGForce = 1;

  start(): void {
    if (this.isActive) {
      console.warn('Motion service already started');
      return;
    }

    // Check if DeviceOrientation is supported
    if (typeof DeviceOrientationEvent === 'undefined') {
      console.warn('DeviceOrientation is not supported by this browser');
      return;
    }

    this.isActive = true;

    // Request permission for iOS 13+
    const orientationEvent = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    
    if (typeof orientationEvent.requestPermission === 'function') {
      orientationEvent
        .requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            this.attachOrientationListener();
          } else {
            console.warn('Device orientation permission denied');
          }
        })
        .catch((err) => {
          console.error('Error requesting device orientation permission:', err);
        });
    } else {
      this.attachOrientationListener();
    }

    // Request permission for motion on iOS 13+
    if (typeof DeviceMotionEvent === 'undefined') {
      console.warn('DeviceMotion is not supported by this browser');
      return;
    }

    const motionEvent = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    
    if (typeof motionEvent.requestPermission === 'function') {
      motionEvent
        .requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            this.attachMotionListener();
          } else {
            console.warn('Device motion permission denied');
          }
        })
        .catch((err) => {
          console.error('Error requesting device motion permission:', err);
        });
    } else {
      this.attachMotionListener();
    }
  }

  stop(): void {
    this.isActive = false;
    window.removeEventListener(
      'deviceorientation',
      this.handleOrientation as EventListener
    );
    window.removeEventListener('devicemotion', this.handleMotion as EventListener);
  }

  onMotion(listener: (data: MotionData) => void): () => void {
    this.motionListeners.push(listener);
    return () => {
      this.motionListeners = this.motionListeners.filter((l) => l !== listener);
    };
  }

  getHeading(): number {
    return this.currentHeading;
  }

  getPitch(): number {
    return this.currentPitch;
  }

  getRoll(): number {
    return this.currentRoll;
  }

  getGForce(): number {
    return this.currentGForce;
  }

  private attachOrientationListener(): void {
    window.addEventListener(
      'deviceorientation',
      this.handleOrientation as EventListener,
      true
    );
  }

  private attachMotionListener(): void {
    window.addEventListener('devicemotion', this.handleMotion as EventListener, true);
  }

  private handleOrientation = (event: DeviceOrientationEvent): void => {
    if (!this.isActive) return;

    // Get compass heading
    // alpha: rotation around z-axis (0-360)
    // beta: rotation around x-axis (-180 to 180) - pitch
    // gamma: rotation around y-axis (-90 to 90) - roll

    let heading = event.alpha || 0;
    
    // Adjust for webkitCompassHeading on iOS
    const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
    if (webkitEvent.webkitCompassHeading) {
      heading = webkitEvent.webkitCompassHeading;
    }

    this.currentHeading = heading;
    this.currentPitch = event.beta || 0;
    this.currentRoll = event.gamma || 0;

    this.notifyListeners();
  };

  private handleMotion = (event: DeviceMotionEvent): void => {
    if (!this.isActive) return;

    // Calculate G-force from acceleration
    const acc = event.accelerationIncludingGravity;
    if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
      // Calculate magnitude of acceleration vector
      const gForce = Math.sqrt(
        acc.x * acc.x + acc.y * acc.y + acc.z * acc.z
      ) / 9.81;
      this.currentGForce = gForce;
    }

    this.notifyListeners();
  };

  private notifyListeners(): void {
    const data: MotionData = {
      heading: this.currentHeading,
      pitch: this.currentPitch,
      roll: this.currentRoll,
      gForce: this.currentGForce,
      timestamp: Date.now(),
    };

    this.motionListeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in motion listener:', error);
      }
    });
  }

  /**
   * Combine GPS heading with compass heading for better accuracy
   * GPS heading is more accurate when moving, compass when stationary
   */
  getCombinedHeading(gpsHeading: number, gpsSpeed: number): number {
    // Use GPS heading when speed > 5 m/s (~10 knots)
    // Blend between GPS and compass for speeds 2-5 m/s
    // Use compass heading when speed < 2 m/s
    
    if (gpsSpeed > 5) {
      return gpsHeading;
    } else if (gpsSpeed > 2) {
      const weight = (gpsSpeed - 2) / 3; // 0 to 1
      return this.averageHeadings(
        this.currentHeading,
        gpsHeading,
        1 - weight,
        weight
      );
    } else {
      return this.currentHeading;
    }
  }

  private averageHeadings(
    h1: number,
    h2: number,
    w1: number,
    w2: number
  ): number {
    // Convert to unit vectors to handle 360/0 wraparound
    const x = w1 * Math.cos(this.toRadians(h1)) + w2 * Math.cos(this.toRadians(h2));
    const y = w1 * Math.sin(this.toRadians(h1)) + w2 * Math.sin(this.toRadians(h2));
    
    let avg = this.toDegrees(Math.atan2(y, x));
    if (avg < 0) avg += 360;
    
    return avg;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
}

export const motionService = new MotionService();
