export type UserRole =
  | 'WATER_PLANT'
  | 'DISTRIBUTOR'
  | 'MANUFACTURER'
  | 'ADMIN'
  | 'BRAND'
  | 'AD_AGENCY'
  | 'PRINTING_PRESS';

export interface User {
  _id: string;
  fullName: string;
  email?: string;
  role: UserRole;
  phone?: string;
  whatsapp_number?: string;
  companyName?: string;
  plantName?: string;
  organization?: string;
  ownerName?: string;
  address?: string;
  city?: string;
  location?: string;
  pincode?: string;
  isiNumber?: string;
  isi_registration_number?: string;
  isi_certificate_url?: string;
  plant_brand_design_url?: string;
  dailyCapacity?: string;
  dailyOutput?: string;
  logoUrl?: string;
  avatar?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  plant_profile?: {
    plant_name?: string;
    water_brand_name?: string;
    plant_logo_url?: string;
    isi_code?: string;
    isi_licence_number?: string;
    isi_certificate_url?: string;
    plant_brand_design_url?: string;
    address?: string;
    city?: string;
    can_distribution_capacity?: number;
    distributor_capacity?: number;
    is_profile_complete?: boolean;
    min_capacity?: number;
    max_capacity?: number;
    has_inhouse_printer?: boolean;
  };
  distributor_profile?: {
    delivery_capacity?: string;
    warehouse_address?: string;
    account_no?: string;
    ifsc_code?: string;
    bank_name?: string;
    license_id?: string;
    gstin?: string;
  };
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface PlantBottlingOrder {
  id: string;
  campaign: string;
  brand: string;
  location: string;
  locality?: string;
  sub_area?: string;
  target_locations?: any[];
  plant_id?: string;
  plant_name?: string;
  plant_email?: string;
  startDate: string;
  endDate: string;
  quantity: string;
  quantityNum: number;
  printedNum?: number;
  receivedNum?: number;
  bottledNum: number;
  status: 'TODO' | 'BOTTLING' | 'COMPLETED' | 'CANCELLED';
  bottlingFee: string;
  bottlingCommission?: string;
  press?: string;
  rawCampaignStatus?: string;
  labelApprovalStatus?: string;
  qrCodeId?: string;
  trend?: string;
  designSpecs: {
    fileName: string;
    fileSize: string;
    dimensions: string;
    colorProfile: string;
    windingDirection: string;
    embeddedQr: string;
    bleedMargin: string;
    artworkUrl?: string;
    plantName?: string;
    isiNumber?: string;
    isiCertificateUrl?: string;
  };
}

export interface PlantBatchItem {
  _id?: string;
  id?: string;
  title: string;
  status: string;
  target_sticker_count?: number;
}

export interface PlantDailyOutputEntry {
  id: string;
  date: string;
  cans_filled: number;
  stickers_applied: number;
  batch_notes: string | null;
  status?: string;
}

export interface DistributorScanRecord {
  id: string;
  scan_id: string;
  qr_id: string;
  can_id: string;
  serial_number?: string;
  campaign_id: string;
  campaignTitle: string;
  campaignReference?: string;
  brandName: string;
  water_plant_id?: string;
  outletName: string;
  printing_press_name?: string;
  locationTitle: string;
  locality: string;
  locationPincode?: string;
  targetCity?: string;
  ip_address: string;
  gpsCoords: string;
  latitude?: number;
  longitude?: number;
  deliveryDate: string;
  deliveryTime: string;
  scannedAt: string;
  bottlesCount: number;
  commission: number;
  payout_amount?: number;
  plantName?: string;
  plant_name?: string;
  settlementStatus: 'PENDING_SETTLEMENT' | 'PROCESSING' | 'SETTLED';
  status?: string;
}

export interface SettlementLedgerRecord {
  id: string;
  settlement_id: string;
  payee_role: 'PLANT' | 'DISTRIBUTOR' | 'PRESS';
  payee_id: string;
  payee_name: string;
  campaign_id: string;
  campaign_title: string;
  location_name?: string;
  completed_quantity: number;
  rate_per_unit: number;
  gross_amount: number;
  tax_gst_amount: number;
  tds_amount: number;
  net_amount: number;
  status: 'Paid' | 'Pending' | 'Payment Requested' | 'Processing' | 'Approved' | 'Rejected';
  settlement_status: string;
  payment_request_status?: string;
  date_key: string;
  settlement_date: string;
  bank_reference?: string;
  settled_at?: string;
  is24HoursComplete?: boolean;
  remainingTimeFormatted?: string;
}

export interface InAppNotification {
  id: string;
  notification_id?: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  campaign_id?: string;
  campaign_title?: string;
  location_name?: string;
  is_read: boolean;
  created_at: string;
}

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}
