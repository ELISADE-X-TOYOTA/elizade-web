export type AvailabilityStatus = 'available' | 'reserved' | 'sold' | 'transferred'
export type ServiceType = 'periodic' | 'repair' | 'inspection' | 'recall'
export type TicketCategory = 'sales' | 'service' | 'warranty' | 'billing' | 'general'
export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'escalated' | 'closed'
export type AppointmentStatus = 'requested' | 'confirmed' | 'in_progress' | 'awaiting_approval' | 'completed' | 'cancelled'

export interface Branch {
  id: string
  name: string
  type: 'showroom' | 'service_centre' | 'both'
  city: string
  state: string
  address: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  trim: string
  year: number
  color: string
  colorHex: string
  price: number
  promotionalPrice?: number
  isPromotional?: boolean
  promotionLabel?: string
  fuelType: string
  transmission: string
  engine: string
  availability: AvailabilityStatus
  branchId: string
  branchName?: string
  branchCity?: string
  branchState?: string
  branchAddress?: string
  images: string[]
  specs: Record<string, string>
  mileage?: number
  vin?: string
}

export interface OwnedVehicle {
  id: string
  vin: string
  make: string
  model: string
  trim: string
  year: number
  color: string
  colorHex: string
  mileage: number
  registrationNumber: string
  purchaseDate: string
  isPrimary: boolean
  nextServiceDue: string
  nextServiceMileage: number
  image: string
}

export interface ServiceAppointment {
  id: string
  vehicleId: string
  branchId: string
  serviceType: ServiceType
  scheduledAt: string
  status: AppointmentStatus
  issueDescription: string
  estimatedCompletion?: string
  technicianNotes?: string
  mileageAtBooking: number
}

export interface ServiceJob {
  id: string
  appointmentId: string
  status: string
  stages: { label: string; completed: boolean; timestamp?: string }[]
  estimatedCompletion: string
  additionalWork?: {
    id: string
    description: string
    cost: number
    status: 'pending_approval' | 'approved' | 'rejected'
  }
  invoice?: {
    subtotal: number
    tax: number
    total: number
    lineItems: { description: string; amount: number }[]
  }
}

export interface ServiceHistoryItem {
  id: string
  vehicleId: string
  date: string
  type: string
  branchName: string
  mileage: number
  description: string
  cost: number
}

export interface WarrantyCertificate {
  id: string
  vehicleId: string
  type: 'standard' | 'extended'
  coverageStart: string
  coverageEnd: string
  status: 'active' | 'expired'
  coverageDetails: string[]
}

export interface WarrantyClaim {
  id: string
  vehicleId: string
  claimType: string
  description: string
  status: ClaimStatus
  createdAt: string
  resolutionNotes?: string
}

export interface RecallNotice {
  id: string
  referenceCode: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  issuedAt: string
  affected: boolean
}

export interface SupportTicket {
  id: string
  ticketNumber: string
  category: TicketCategory
  subject: string
  status: TicketStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  firstResponseDue: string
  resolutionDue: string
  messages: TicketMessage[]
  satisfactionRating?: number
}

export interface TicketMessage {
  id: string
  sender: 'customer' | 'staff' | 'system'
  body: string
  timestamp: string
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  category: 'service' | 'sales' | 'warranty' | 'support' | 'promo' | 'system'
  isRead: boolean
  createdAt: string
  deepLink?: string
}

export interface TestDriveBooking {
  id: string
  vehicleId: string
  branchId: string
  scheduledAt: string
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled'
}

export interface Quotation {
  id: string
  vehicleId: string
  basePrice: number
  accessoriesTotal: number
  discount: number
  total: number
  status: 'draft' | 'sent' | 'accepted' | 'expired'
  validUntil: string
  lineItems: { description: string; amount: number }[]
}

export interface Reservation {
  id: string
  vehicleId: string
  status: 'pending' | 'deposit_paid' | 'confirmed' | 'expired'
  depositAmount: number
  expiresAt: string
}

export interface TradeInRequest {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  conditionNotes: string
  status: 'submitted' | 'under_review' | 'valued' | 'accepted' | 'rejected'
  estimatedValue?: number
}

export interface WatchlistItem {
  id: string
  model: string
  trim?: string
  color?: string
  isActive: boolean
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state: string
  avatar?: string
  role: 'customer' | 'staff' | 'admin'
  department?: string
  preferences: {
    pushEnabled: boolean
    smsEnabled: boolean
    emailEnabled: boolean
    marketingOptIn: boolean
  }
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface AdminLead {
  id: string
  customerName: string
  email: string
  phone: string
  source: string
  status: LeadStatus
  interestedModel: string
  assignedAgent: string
  value: number
  createdAt: string
  notes?: string
}

export interface AdminCustomer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  vehicles: string[]
  totalSpend: number
  lastActive: string
  segment: string
}

export interface AgentPerformance {
  id: string
  name: string
  department: string
  ticketsHandled: number
  leadsConverted: number
  avgResponseMin: number
  satisfaction: number
  avatar: string
}
