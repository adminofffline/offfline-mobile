export interface LocalityProfile {
  name: string;
  pincode: string;
  latitude: number;
  longitude: number;
  ip: string;
}

export const CHENNAI_LOCALITY_PROFILES: Record<string, LocalityProfile> = {
  '600001': { name: 'Chennai GPO', pincode: '600001', latitude: 13.0886, longitude: 80.2882, ip: '192.168.1.101' },
  '600002': { name: 'Anna Road', pincode: '600002', latitude: 13.0674, longitude: 80.2662, ip: '192.168.1.102' },
  '600003': { name: 'Park Town', pincode: '600003', latitude: 13.0827, longitude: 80.2757, ip: '192.168.1.103' },
  '600004': { name: 'Mylapore', pincode: '600004', latitude: 13.0368, longitude: 80.2676, ip: '192.168.1.104' },
  '600005': { name: 'Chepauk', pincode: '600005', latitude: 13.0628, longitude: 80.2796, ip: '192.168.1.105' },
  '600006': { name: 'DPI', pincode: '600006', latitude: 13.0583, longitude: 80.2458, ip: '192.168.1.106' },
  '600007': { name: 'Vepery', pincode: '600007', latitude: 13.0894, longitude: 80.2612, ip: '192.168.1.107' },
  '600008': { name: 'Egmore', pincode: '600008', latitude: 13.0826, longitude: 80.2588, ip: '192.168.1.108' },
  '600011': { name: 'Perambur', pincode: '600011', latitude: 13.1118, longitude: 80.2372, ip: '192.168.1.111' },
  '600017': { name: 'T. Nagar', pincode: '600017', latitude: 13.0418, longitude: 80.2341, ip: '192.168.1.117' },
  '600020': { name: 'Adyar', pincode: '600020', latitude: 13.0067, longitude: 80.2575, ip: '192.168.1.120' },
  '600032': { name: 'Guindy', pincode: '600032', latitude: 13.0067, longitude: 80.2023, ip: '192.168.1.132' },
  '600040': { name: 'Anna Nagar', pincode: '600040', latitude: 13.0850, longitude: 80.2100, ip: '192.168.1.140' },
  '600042': { name: 'Velachery', pincode: '600042', latitude: 12.9815, longitude: 80.2180, ip: '192.168.1.142' },
};

export function resolveLocationGps(locationStr?: string): { lat: number; lng: number; latitude: number; longitude: number; accuracy: number } {
  if (!locationStr) return { lat: 13.0827, lng: 80.2707, latitude: 13.0827, longitude: 80.2707, accuracy: 5.0 };
  const pinMatch = locationStr.match(/\b\d{6}\b/);
  if (pinMatch && CHENNAI_LOCALITY_PROFILES[pinMatch[0]]) {
    const prof = CHENNAI_LOCALITY_PROFILES[pinMatch[0]];
    return { lat: prof.latitude, lng: prof.longitude, latitude: prof.latitude, longitude: prof.longitude, accuracy: 5.0 };
  }
  const clean = locationStr.toLowerCase();
  for (const prof of Object.values(CHENNAI_LOCALITY_PROFILES)) {
    if (clean.includes(prof.name.toLowerCase())) {
      return { lat: prof.latitude, lng: prof.longitude, latitude: prof.latitude, longitude: prof.longitude, accuracy: 5.0 };
    }
  }
  return { lat: 13.0827, lng: 80.2707, latitude: 13.0827, longitude: 80.2707, accuracy: 5.0 };
}

export function resolveLocationIp(locationStr?: string): string {
  if (!locationStr) return '192.168.1.100';
  const pinMatch = locationStr.match(/\b\d{6}\b/);
  if (pinMatch && CHENNAI_LOCALITY_PROFILES[pinMatch[0]]) {
    return CHENNAI_LOCALITY_PROFILES[pinMatch[0]].ip;
  }
  return '192.168.1.100';
}

export function resolveDistributorIp(locationStr?: string): string {
  if (!locationStr) return '122.164.240.52';
  const pinMatch = locationStr.match(/\b\d{6}\b/);
  if (pinMatch && CHENNAI_LOCALITY_PROFILES[pinMatch[0]]) {
    const prof = CHENNAI_LOCALITY_PROFILES[pinMatch[0]];
    const octet4 = 50 + (parseInt(prof.pincode.slice(-2), 10) % 150);
    return `122.164.240.${octet4}`;
  }
  return '122.164.240.52';
}

/**
 * Universal QR code cleaner & identifier extractor.
 * Matches web extractCleanQrId and backend controller parser.
 * Handles:
 *  - URL-encoded strings
 *  - Full URLs (e.g., https://offfline.in/q/WA-TEST-001, /qr/CAN-1234, /track/...)
 *  - Query parameters (e.g., ?qr_token=..., ?qr_id=..., ?code=...)
 *  - Batch CSV rows (e.g., "campId,orderId,batchId,plantId,serial,WA-TOKEN,url")
 *  - Raw codes (e.g., WA-123456, CAN-600001-99999)
 */
export function extractCleanQrId(raw: string): string {
  if (!raw) return '';
  let trimmed = String(raw).trim();
  try {
    trimmed = decodeURIComponent(trimmed);
  } catch (e) {}

  // Handle whole CSV rows
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim());
    const matched = parts.find((p) => p.startsWith('WA-') || p.startsWith('CAN-') || p.includes('/q/'));
    if (matched) trimmed = matched;
  }

  if (trimmed.includes('/q/')) {
    const parts = trimmed.split('/q/');
    trimmed = parts[parts.length - 1];
  } else if (trimmed.includes('/qr/')) {
    const parts = trimmed.split('/qr/');
    trimmed = parts[parts.length - 1];
  } else if (trimmed.includes('/track/')) {
    const parts = trimmed.split('/track/');
    trimmed = parts[parts.length - 1];
  } else if (trimmed.includes('/c/')) {
    const parts = trimmed.split('/c/');
    trimmed = parts[parts.length - 1];
  } else if (trimmed.includes('qr_token=')) {
    const match = trimmed.match(/qr_token=([^&]+)/);
    if (match) trimmed = match[1];
  } else if (trimmed.includes('qr_id=')) {
    const match = trimmed.match(/qr_id=([^&]+)/);
    if (match) trimmed = match[1];
  } else if (trimmed.includes('code=')) {
    const match = trimmed.match(/code=([^&]+)/);
    if (match) trimmed = match[1];
  }

  return trimmed.split('?')[0].split('#')[0].replace(/^[/#?]+/, '').replace(/[/#?]+$/, '').trim();
}

