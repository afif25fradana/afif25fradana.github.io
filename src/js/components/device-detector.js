/**
 * Utility class for device detection
 */
export class DeviceDetector {
    /**
     * Detect if user is on a mobile device
     * @returns {boolean} - True if user is on mobile device
     */
    static isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}