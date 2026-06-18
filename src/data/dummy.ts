import type {
  Branch,
  NotificationItem,
  OwnedVehicle,
  Quotation,
  RecallNotice,
  Reservation,
  ServiceAppointment,
  ServiceHistoryItem,
  ServiceJob,
  SupportTicket,
  TestDriveBooking,
  TradeInRequest,
  UserProfile,
  Vehicle,
  WarrantyCertificate,
  WarrantyClaim,
  WatchlistItem,
} from '@/types'
import { avatarUrl, getVehicleImages } from '@/lib/images'

export const ADMIN_PHONE_NORMALIZED = '8107891549'

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('234')) return digits.slice(3)
  if (digits.startsWith('0')) return digits.slice(1)
  return digits
}

export const branches: Branch[] = [
  { id: 'br-1', name: 'Elizade Victoria Island', type: 'both', city: 'Lagos', state: 'Lagos', address: '141 Ahmadu Bello Way, VI' },
  { id: 'br-2', name: 'Elizade Ikeja', type: 'both', city: 'Lagos', state: 'Lagos', address: '12 Obafemi Awolowo Way, Ikeja' },
  { id: 'br-3', name: 'Elizade Abuja', type: 'both', city: 'Abuja', state: 'FCT', address: 'Plot 1234, Central Business District' },
  { id: 'br-4', name: 'Elizade Port Harcourt', type: 'service_centre', city: 'Port Harcourt', state: 'Rivers', address: '45 Aba Road, PH' },
]

const vehicleImages = {
  corolla: getVehicleImages('corolla'),
  camry: getVehicleImages('camry'),
  rav4: getVehicleImages('rav4'),
  hilux: getVehicleImages('hilux'),
  landcruiser: getVehicleImages('landcruiser'),
}

export const vehicles: Vehicle[] = [
  {
    id: 'v-1',
    make: 'Toyota',
    model: 'Corolla',
    trim: 'XLE',
    year: 2025,
    color: 'Pearl White',
    colorHex: '#f5f5f5',
    price: 38500000,
    promotionalPrice: 36800000,
    isPromotional: true,
    promotionLabel: 'Year-End Offer',
    fuelType: 'Petrol',
    transmission: 'CVT',
    engine: '1.8L 4-Cylinder',
    availability: 'available',
    branchId: 'br-1',
    images: vehicleImages.corolla,
    specs: {
      'Seating': '5',
      'Fuel Economy': '14.5 km/L',
      'Safety': 'Toyota Safety Sense 3.0',
      'Infotainment': '9" Touchscreen',
      'Warranty': '3 Years / 100,000 km',
    },
    vin: 'JTDBT9234050123456',
  },
  {
    id: 'v-2',
    make: 'Toyota',
    model: 'Camry',
    trim: 'XSE',
    year: 2025,
    color: 'Midnight Black',
    colorHex: '#1a1a1a',
    price: 52000000,
    fuelType: 'Petrol',
    transmission: '8-Speed Auto',
    engine: '2.5L Turbo',
    availability: 'available',
    branchId: 'br-1',
    images: vehicleImages.camry,
    specs: {
      'Seating': '5',
      'Fuel Economy': '12.8 km/L',
      'Safety': 'Toyota Safety Sense 3.0',
      'Infotainment': '12.3" Digital Cockpit',
      'Warranty': '3 Years / 100,000 km',
    },
    vin: 'JTDBT9234050123457',
  },
  {
    id: 'v-3',
    make: 'Toyota',
    model: 'RAV4',
    trim: 'Adventure',
    year: 2025,
    color: 'Blueprint',
    colorHex: '#2c4a6e',
    price: 48500000,
    fuelType: 'Hybrid',
    transmission: 'CVT',
    engine: '2.5L Hybrid',
    availability: 'available',
    branchId: 'br-2',
    images: vehicleImages.rav4,
    specs: {
      'Seating': '5',
      'Fuel Economy': '18.2 km/L',
      'Safety': 'Toyota Safety Sense 3.0',
      'Infotainment': '10.5" Touchscreen',
      'Warranty': '3 Years / 100,000 km',
    },
    vin: 'JTDBT9234050123458',
  },
  {
    id: 'v-4',
    make: 'Toyota',
    model: 'Hilux',
    trim: 'GR-S',
    year: 2025,
    color: 'Emotional Red',
    colorHex: '#c41e3a',
    price: 45000000,
    fuelType: 'Diesel',
    transmission: '6-Speed Auto',
    engine: '2.8L Turbo Diesel',
    availability: 'reserved',
    branchId: 'br-3',
    images: vehicleImages.hilux,
    specs: {
      'Seating': '5',
      'Towing Capacity': '3,500 kg',
      'Safety': 'Toyota Safety Sense',
      'Infotainment': '8" Touchscreen',
      'Warranty': '3 Years / 100,000 km',
    },
    vin: 'JTDBT9234050123459',
  },
  {
    id: 'v-5',
    make: 'Toyota',
    model: 'Land Cruiser',
    trim: 'VX',
    year: 2025,
    color: 'Precious White',
    colorHex: '#e8e8e8',
    price: 125000000,
    fuelType: 'Diesel',
    transmission: '10-Speed Auto',
    engine: '3.3L Twin-Turbo V6',
    availability: 'available',
    branchId: 'br-1',
    images: vehicleImages.landcruiser,
    specs: {
      'Seating': '7',
      'Fuel Economy': '9.5 km/L',
      'Safety': 'Toyota Safety Sense 3.0',
      'Infotainment': '12.3" Touchscreen',
      'Warranty': '3 Years / 100,000 km',
    },
    vin: 'JTDBT9234050123460',
  },
  {
    id: 'v-6',
    make: 'Toyota',
    model: 'Corolla',
    trim: 'LE',
    year: 2024,
    color: 'Celestite Gray',
    colorHex: '#8a9aab',
    price: 32000000,
    fuelType: 'Petrol',
    transmission: 'CVT',
    engine: '1.8L 4-Cylinder',
    availability: 'sold',
    branchId: 'br-2',
    images: vehicleImages.corolla,
    specs: {
      'Seating': '5',
      'Fuel Economy': '14.5 km/L',
      'Safety': 'Toyota Safety Sense 2.0',
      'Infotainment': '8" Touchscreen',
      'Warranty': '3 Years / 100,000 km',
    },
    vin: 'JTDBT9234050123461',
  },
]

export const ownedVehicles: OwnedVehicle[] = [
  {
    id: 'ov-1',
    vin: 'JTDBT9234050098765',
    make: 'Toyota',
    model: 'Corolla',
    trim: 'XLE',
    year: 2022,
    color: 'Pearl White',
    colorHex: '#f5f5f5',
    mileage: 42500,
    registrationNumber: 'LAG-123-AB',
    purchaseDate: '2022-06-15',
    isPrimary: true,
    nextServiceDue: '2026-07-01',
    nextServiceMileage: 50000,
    image: vehicleImages.corolla[0],
  },
  {
    id: 'ov-2',
    vin: 'JTDBT9234050098766',
    make: 'Toyota',
    model: 'RAV4',
    trim: 'XLE',
    year: 2020,
    color: 'Blueprint',
    colorHex: '#2c4a6e',
    mileage: 68000,
    registrationNumber: 'LAG-456-CD',
    purchaseDate: '2020-03-20',
    isPrimary: false,
    nextServiceDue: '2026-06-20',
    nextServiceMileage: 70000,
    image: vehicleImages.rav4[0],
  },
]

export const userProfile: UserProfile = {
  id: 'user-1',
  firstName: 'Adaeze',
  lastName: 'Okonkwo',
  email: 'adaeze.okonkwo@email.com',
  phone: '+234 803 456 7890',
  city: 'Lagos',
  state: 'Lagos',
  role: 'customer',
  avatar: avatarUrl('Adaeze Okonkwo'),
  preferences: {
    pushEnabled: true,
    smsEnabled: true,
    emailEnabled: true,
    marketingOptIn: false,
  },
}

export const serviceAppointments: ServiceAppointment[] = [
  {
    id: 'sa-1',
    vehicleId: 'ov-1',
    branchId: 'br-2',
    serviceType: 'periodic',
    scheduledAt: '2026-06-25T09:00:00',
    status: 'confirmed',
    issueDescription: '5,000 km periodic maintenance — oil change, filter replacement, general inspection.',
    estimatedCompletion: '2026-06-25T12:00:00',
    mileageAtBooking: 42500,
  },
  {
    id: 'sa-2',
    vehicleId: 'ov-1',
    branchId: 'br-1',
    serviceType: 'repair',
    scheduledAt: '2026-06-17T14:00:00',
    status: 'awaiting_approval',
    issueDescription: 'Brake pad replacement and rotor inspection.',
    estimatedCompletion: '2026-06-17T17:30:00',
    technicianNotes: 'Front brake pads worn beyond safe limit. Rotors need resurfacing.',
    mileageAtBooking: 42480,
  },
]

export const activeServiceJob: ServiceJob = {
  id: 'sj-1',
  appointmentId: 'sa-2',
  status: 'awaiting_customer_approval',
  stages: [
    { label: 'Checked In', completed: true, timestamp: '2026-06-17T14:05:00' },
    { label: 'Diagnosing', completed: true, timestamp: '2026-06-17T14:45:00' },
    { label: 'In Progress', completed: true, timestamp: '2026-06-17T15:30:00' },
    { label: 'Awaiting Approval', completed: false },
    { label: 'Quality Check', completed: false },
    { label: 'Ready for Collection', completed: false },
  ],
  estimatedCompletion: '2026-06-17T17:30:00',
  additionalWork: {
    id: 'aw-1',
    description: 'Front brake pad replacement + rotor resurfacing (both front wheels)',
    cost: 185000,
    status: 'pending_approval',
  },
  invoice: {
    subtotal: 320000,
    tax: 24000,
    total: 344000,
    lineItems: [
      { description: 'Brake pad replacement (labour)', amount: 45000 },
      { description: 'Front brake pads (genuine Toyota)', amount: 95000 },
      { description: 'Rotor resurfacing', amount: 65000 },
      { description: 'Inspection & diagnostics', amount: 35000 },
      { description: 'Consumables', amount: 15000 },
    ],
  },
}

export const serviceHistory: ServiceHistoryItem[] = [
  {
    id: 'sh-1',
    vehicleId: 'ov-1',
    date: '2025-12-10',
    type: 'Periodic Maintenance',
    branchName: 'Elizade Ikeja',
    mileage: 37500,
    description: 'Oil change, air filter, brake inspection',
    cost: 125000,
  },
  {
    id: 'sh-2',
    vehicleId: 'ov-1',
    date: '2025-06-08',
    type: 'Periodic Maintenance',
    branchName: 'Elizade Victoria Island',
    mileage: 32500,
    description: '5,000 km service — full periodic maintenance',
    cost: 118000,
  },
  {
    id: 'sh-3',
    vehicleId: 'ov-2',
    date: '2025-11-15',
    type: 'Repair',
    branchName: 'Elizade Ikeja',
    mileage: 65000,
    description: 'Suspension bush replacement',
    cost: 210000,
  },
]

export const warrantyCertificates: WarrantyCertificate[] = [
  {
    id: 'wc-1',
    vehicleId: 'ov-1',
    type: 'standard',
    coverageStart: '2022-06-15',
    coverageEnd: '2025-06-14',
    status: 'expired',
    coverageDetails: [
      'Engine & transmission',
      'Electrical systems',
      'Air conditioning',
      'Factory defects',
    ],
  },
  {
    id: 'wc-2',
    vehicleId: 'ov-1',
    type: 'extended',
    coverageStart: '2025-06-15',
    coverageEnd: '2028-06-14',
    status: 'active',
    coverageDetails: [
      'Extended powertrain coverage',
      'Electrical & electronics',
      'Roadside assistance',
      'Genuine parts guarantee',
    ],
  },
  {
    id: 'wc-3',
    vehicleId: 'ov-2',
    type: 'standard',
    coverageStart: '2020-03-20',
    coverageEnd: '2023-03-19',
    status: 'expired',
    coverageDetails: ['Engine & transmission', 'Electrical systems', 'Factory defects'],
  },
]

export const warrantyClaims: WarrantyClaim[] = [
  {
    id: 'wcl-1',
    vehicleId: 'ov-1',
    claimType: 'Electrical',
    description: 'Dashboard infotainment screen flickering intermittently.',
    status: 'under_review',
    createdAt: '2026-05-20T10:00:00',
  },
  {
    id: 'wcl-2',
    vehicleId: 'ov-2',
    claimType: 'Powertrain',
    description: 'Unusual noise from transmission during acceleration.',
    status: 'approved',
    createdAt: '2026-03-10T14:30:00',
    resolutionNotes: 'Transmission fluid change covered under warranty. Service scheduled.',
  },
]

export const recallNotices: RecallNotice[] = [
  {
    id: 'rc-1',
    referenceCode: 'TNL-2026-RC-0042',
    title: 'Fuel Pump Module Inspection',
    description: 'Toyota Nigeria Limited has identified a potential issue with the fuel pump module in certain 2020–2022 Corolla models. Free inspection and replacement if needed.',
    severity: 'high',
    issuedAt: '2026-04-01',
    affected: false,
  },
  {
    id: 'rc-2',
    referenceCode: 'TNL-2025-RC-0891',
    title: 'Airbag Sensor Recall',
    description: 'Affected vehicles may have a faulty airbag sensor. Schedule a free inspection at any Elizade service centre.',
    severity: 'critical',
    issuedAt: '2025-11-15',
    affected: true,
  },
]

export const supportTickets: SupportTicket[] = [
  {
    id: 'st-1',
    ticketNumber: 'EC-2026-004521',
    category: 'service',
    subject: 'Delayed service completion at Ikeja centre',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2026-06-16T08:30:00',
    firstResponseDue: '2026-06-16T10:30:00',
    resolutionDue: '2026-06-18T08:30:00',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        body: 'My vehicle has been at the Ikeja service centre for 3 days without updates. Appointment was for brake repair.',
        timestamp: '2026-06-16T08:30:00',
      },
      {
        id: 'msg-2',
        sender: 'staff',
        body: 'Thank you for reaching out, Adaeze. I can see your vehicle is currently awaiting your approval for additional brake work. I\'ve sent a reminder to check the app for the approval request.',
        timestamp: '2026-06-16T09:15:00',
      },
      {
        id: 'msg-3',
        sender: 'customer',
        body: 'I see it now. I\'ll review and approve shortly. Can you confirm the total cost?',
        timestamp: '2026-06-16T09:45:00',
      },
    ],
  },
  {
    id: 'st-2',
    ticketNumber: 'EC-2026-003890',
    category: 'sales',
    subject: 'Quotation for Camry XSE — financing options',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2026-06-10T11:00:00',
    firstResponseDue: '2026-06-10T13:00:00',
    resolutionDue: '2026-06-12T11:00:00',
    satisfactionRating: 5,
    messages: [
      {
        id: 'msg-4',
        sender: 'customer',
        body: 'I received a quotation for the Camry XSE. Can you provide financing options with 30% deposit?',
        timestamp: '2026-06-10T11:00:00',
      },
      {
        id: 'msg-5',
        sender: 'staff',
        body: 'With 30% deposit (₦15.6M), your estimated monthly payment over 48 months would be approximately ₦1.1M at 18% interest. I\'ve attached the detailed breakdown.',
        timestamp: '2026-06-10T12:30:00',
      },
    ],
  },
  {
    id: 'st-3',
    ticketNumber: 'EC-2026-002100',
    category: 'billing',
    subject: 'Invoice discrepancy on last service',
    status: 'closed',
    priority: 'low',
    createdAt: '2026-05-28T16:00:00',
    firstResponseDue: '2026-05-28T18:00:00',
    resolutionDue: '2026-05-30T16:00:00',
    satisfactionRating: 4,
    messages: [
      {
        id: 'msg-6',
        sender: 'customer',
        body: 'The invoice shows ₦15,000 for consumables but I was quoted ₦12,000.',
        timestamp: '2026-05-28T16:00:00',
      },
      {
        id: 'msg-7',
        sender: 'staff',
        body: 'We\'ve reviewed and issued a corrected invoice. A credit of ₦3,000 has been applied to your account.',
        timestamp: '2026-05-29T10:00:00',
      },
    ],
  },
]

export const notifications: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Additional work needs approval',
    body: 'Your Corolla brake repair requires approval for ₦185,000 additional work. Tap to review.',
    category: 'service',
    isRead: false,
    createdAt: '2026-06-17T15:35:00',
    deepLink: '/service/track/sa-2',
  },
  {
    id: 'n-2',
    title: 'Service reminder — 7 days',
    body: 'Your Corolla is due for periodic maintenance in 7 days (50,000 km milestone).',
    category: 'service',
    isRead: false,
    createdAt: '2026-06-17T08:00:00',
    deepLink: '/service/book',
  },
  {
    id: 'n-3',
    title: 'Critical recall alert',
    body: 'Your RAV4 is affected by airbag sensor recall TNL-2025-RC-0891. Book a free inspection.',
    category: 'warranty',
    isRead: true,
    createdAt: '2026-06-15T10:00:00',
    deepLink: '/warranty',
  },
  {
    id: 'n-4',
    title: 'Year-End Toyota Offers',
    body: 'Save up to ₦1.7M on select 2025 models. Limited time only.',
    category: 'promo',
    isRead: true,
    createdAt: '2026-06-12T09:00:00',
    deepLink: '/vehicles',
  },
  {
    id: 'n-5',
    title: 'Test drive confirmed',
    body: 'Your Camry XSE test drive at Victoria Island is confirmed for June 28 at 10:00 AM.',
    category: 'sales',
    isRead: true,
    createdAt: '2026-06-11T14:00:00',
    deepLink: '/sales/test-drive',
  },
]

export const testDriveBookings: TestDriveBooking[] = [
  {
    id: 'td-1',
    vehicleId: 'v-2',
    branchId: 'br-1',
    scheduledAt: '2026-06-28T10:00:00',
    status: 'confirmed',
  },
]

export const quotations: Quotation[] = [
  {
    id: 'qt-1',
    vehicleId: 'v-2',
    basePrice: 52000000,
    accessoriesTotal: 850000,
    discount: 500000,
    total: 52450000,
    status: 'sent',
    validUntil: '2026-07-15',
    lineItems: [
      { description: 'Camry XSE — Midnight Black', amount: 52000000 },
      { description: 'Premium leather package', amount: 450000 },
      { description: 'Extended warranty (2 years)', amount: 400000 },
      { description: 'Year-end discount', amount: -500000 },
    ],
  },
]

export const reservations: Reservation[] = [
  {
    id: 'res-1',
    vehicleId: 'v-1',
    status: 'deposit_paid',
    depositAmount: 2000000,
    expiresAt: '2026-07-01T23:59:59',
  },
]

export const tradeInRequests: TradeInRequest[] = [
  {
    id: 'ti-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2018,
    mileage: 95000,
    conditionNotes: 'Good condition, minor scratch on rear bumper. Full service history.',
    status: 'valued',
    estimatedValue: 12500000,
  },
]

export const watchlist: WatchlistItem[] = [
  { id: 'wl-1', model: 'Land Cruiser', trim: 'VX', color: 'Precious White', isActive: true },
  { id: 'wl-2', model: 'RAV4', trim: 'Adventure', isActive: true },
]

export function getVehicleById(id: string) {
  return vehicles.find((v) => v.id === id)
}

export function getOwnedVehicleById(id: string) {
  return ownedVehicles.find((v) => v.id === id)
}

export function getBranchById(id: string) {
  return branches.find((b) => b.id === id)
}

export const dashboardStats = {
  upcomingServices: 2,
  activeTickets: 1,
  unreadNotifications: 2,
  warrantyAlerts: 1,
  savedVehicles: 3,
}

export const storySteps = [
  {
    title: 'Discover',
    subtitle: 'Your journey begins',
    description: 'Browse Nigeria\'s finest Toyota inventory with rich media, 360° views, and real-time availability across Elizade showrooms.',
    image: vehicleImages.corolla[0],
  },
  {
    title: 'Own',
    subtitle: 'Seamless purchase',
    description: 'From test drive to quotation, reservation, financing estimates, and trade-in — your entire purchase journey in one place.',
    image: vehicleImages.camry[0],
  },
  {
    title: 'Service',
    subtitle: 'Premium care',
    description: 'Book appointments, track repairs in real-time, approve additional work, and never miss a maintenance milestone.',
    image: vehicleImages.rav4[0],
  },
  {
    title: 'Protect',
    subtitle: 'Peace of mind',
    description: 'Digital warranty certificates, instant recall alerts, and streamlined claim submissions keep you covered.',
    image: vehicleImages.landcruiser[0],
  },
]
