import type { AdminCustomer, AdminLead, AgentPerformance } from '@/types'
import { avatarUrl } from '@/lib/images'
import { vehicles, supportTickets, warrantyClaims, recallNotices } from './dummy'

export const adminKpis = {
  totalRevenue: 892500000,
  revenueGrowth: 12.4,
  activeLeads: 47,
  leadsGrowth: 8.2,
  serviceToday: 34,
  serviceCapacity: 48,
  openTickets: 12,
  slaAtRisk: 3,
  inventoryAvailable: 28,
  inventoryReserved: 6,
  newCustomersMonth: 156,
  customerGrowth: 15.3,
}

export const revenueChart = [
  { month: 'Jan', sales: 62, service: 18 },
  { month: 'Feb', sales: 58, service: 20 },
  { month: 'Mar', sales: 71, service: 22 },
  { month: 'Apr', sales: 65, service: 19 },
  { month: 'May', sales: 78, service: 24 },
  { month: 'Jun', sales: 84, service: 26 },
]

export const leadPipelineChart = [
  { stage: 'New', count: 18, color: '#6366f1' },
  { stage: 'Contacted', count: 12, color: '#8b5cf6' },
  { stage: 'Qualified', count: 9, color: '#a855f7' },
  { stage: 'Proposal', count: 6, color: '#d946ef' },
  { stage: 'Negotiation', count: 4, color: '#ec4899' },
  { stage: 'Won', count: 8, color: '#10b981' },
]

export const adminLeads: AdminLead[] = [
  {
    id: 'ld-1',
    customerName: 'Chukwuemeka Nwosu',
    email: 'emeka.n@email.com',
    phone: '08031234567',
    source: 'Website',
    status: 'qualified',
    interestedModel: 'Camry XSE',
    assignedAgent: 'Sarah Adeyemi',
    value: 52000000,
    createdAt: '2026-06-16T09:00:00',
    notes: 'Interested in financing, 30% deposit',
  },
  {
    id: 'ld-2',
    customerName: 'Fatima Bello',
    email: 'fatima.b@email.com',
    phone: '08098765432',
    source: 'Test Drive',
    status: 'proposal',
    interestedModel: 'RAV4 Adventure',
    assignedAgent: 'James Okafor',
    value: 48500000,
    createdAt: '2026-06-15T14:30:00',
  },
  {
    id: 'ld-3',
    customerName: 'Oluwaseun Adeyemi',
    email: 'seun.a@corp.ng',
    phone: '08123456789',
    source: 'Showroom',
    status: 'negotiation',
    interestedModel: 'Land Cruiser VX',
    assignedAgent: 'Divine Obinali',
    value: 125000000,
    createdAt: '2026-06-14T11:00:00',
    notes: 'Fleet purchase — 3 units',
  },
  {
    id: 'ld-4',
    customerName: 'Grace Etim',
    email: 'grace.etim@email.com',
    phone: '07087654321',
    source: 'Trade-In',
    status: 'new',
    interestedModel: 'Corolla XLE',
    assignedAgent: 'Unassigned',
    value: 38500000,
    createdAt: '2026-06-17T08:15:00',
  },
  {
    id: 'ld-5',
    customerName: 'Ibrahim Musa',
    email: 'ibrahim.m@email.com',
    phone: '09011223344',
    source: 'Referral',
    status: 'won',
    interestedModel: 'Hilux GR-S',
    assignedAgent: 'Sarah Adeyemi',
    value: 45000000,
    createdAt: '2026-06-10T16:00:00',
  },
]

export const adminCustomers: AdminCustomer[] = [
  {
    id: 'ac-1',
    name: 'Adaeze Okonkwo',
    email: 'adaeze.okonkwo@email.com',
    phone: '08034567890',
    city: 'Lagos',
    vehicles: ['2022 Corolla XLE', '2020 RAV4 XLE'],
    totalSpend: 4850000,
    lastActive: '2026-06-17T15:35:00',
    segment: 'Premium Owner',
  },
  {
    id: 'ac-2',
    name: 'Chinedu Okoro',
    email: 'chinedu.o@email.com',
    phone: '08055667788',
    city: 'Abuja',
    vehicles: ['2024 Camry XSE'],
    totalSpend: 52800000,
    lastActive: '2026-06-16T10:00:00',
    segment: 'New Buyer',
  },
  {
    id: 'ac-3',
    name: 'Amina Hassan',
    email: 'amina.h@email.com',
    phone: '08199887766',
    city: 'Lagos',
    vehicles: ['2019 Hilux', '2021 Corolla'],
    totalSpend: 12400000,
    lastActive: '2026-06-15T09:30:00',
    segment: 'Fleet',
  },
  {
    id: 'ac-4',
    name: 'Tunde Bakare',
    email: 'tunde.b@email.com',
    phone: '07033445566',
    city: 'Port Harcourt',
    vehicles: ['2023 RAV4 Adventure'],
    totalSpend: 890000,
    lastActive: '2026-06-14T14:00:00',
    segment: 'Service Regular',
  },
  {
    id: 'ac-5',
    name: 'Ngozi Eze',
    email: 'ngozi.e@email.com',
    phone: '09088776655',
    city: 'Lagos',
    vehicles: ['2025 Land Cruiser VX'],
    totalSpend: 127500000,
    lastActive: '2026-06-12T11:00:00',
    segment: 'VIP',
  },
]

export const agentPerformance: AgentPerformance[] = [
  {
    id: 'ag-1',
    name: 'Sarah Adeyemi',
    department: 'Sales',
    ticketsHandled: 42,
    leadsConverted: 8,
    avgResponseMin: 18,
    satisfaction: 4.8,
    avatar: avatarUrl('Sarah Adeyemi', '4338ca'),
  },
  {
    id: 'ag-2',
    name: 'James Okafor',
    department: 'Sales',
    ticketsHandled: 35,
    leadsConverted: 6,
    avgResponseMin: 22,
    satisfaction: 4.6,
    avatar: avatarUrl('James Okafor', '0891b2'),
  },
  {
    id: 'ag-3',
    name: 'Divine Obinali',
    department: 'Management',
    ticketsHandled: 28,
    leadsConverted: 5,
    avgResponseMin: 12,
    satisfaction: 4.9,
    avatar: avatarUrl('Divine Obinali', '1a1a2e'),
  },
  {
    id: 'ag-4',
    name: 'Blessing Uche',
    department: 'Support',
    ticketsHandled: 67,
    leadsConverted: 0,
    avgResponseMin: 15,
    satisfaction: 4.7,
    avatar: avatarUrl('Blessing Uche', '059669'),
  },
]

export const serviceScheduleToday = [
  { id: 'ss-1', time: '08:00', customer: 'Adaeze Okonkwo', vehicle: 'Corolla', type: 'Periodic', bay: 'Bay 1', branch: 'Ikeja', status: 'in_progress' },
  { id: 'ss-2', time: '09:00', customer: 'Tunde Bakare', vehicle: 'RAV4', type: 'Repair', bay: 'Bay 2', branch: 'Ikeja', status: 'confirmed' },
  { id: 'ss-3', time: '10:00', customer: 'Chinedu Okoro', vehicle: 'Camry', type: 'Inspection', bay: 'Bay 1', branch: 'VI', status: 'confirmed' },
  { id: 'ss-4', time: '11:30', customer: 'Amina Hassan', vehicle: 'Hilux', type: 'Periodic', bay: 'Bay 3', branch: 'Abuja', status: 'confirmed' },
  { id: 'ss-5', time: '14:00', customer: 'Adaeze Okonkwo', vehicle: 'Corolla', type: 'Repair', bay: 'Bay 2', branch: 'VI', status: 'awaiting_approval' },
  { id: 'ss-6', time: '15:30', customer: 'Ngozi Eze', vehicle: 'Land Cruiser', type: 'Recall', bay: 'Bay 1', branch: 'VI', status: 'confirmed' },
]

export const notificationRules = [
  { id: 'nr-1', name: 'Service Reminder — 30 days', trigger: 'service.due_30', channels: ['push', 'sms'], cadence: '30/7/1/0', active: true },
  { id: 'nr-2', name: 'Service Reminder — Corolla', trigger: 'model.corolla', channels: ['push', 'email'], cadence: '30/7/1', active: true },
  { id: 'nr-3', name: 'Post-Service Follow-up', trigger: 'service.completed', channels: ['push'], cadence: '1', active: true },
  { id: 'nr-4', name: 'Year-End Promo', trigger: 'broadcast.promo', channels: ['push', 'sms', 'email'], cadence: 'once', active: false },
]

export const broadcastCampaigns = [
  { id: 'bc-1', title: 'Year-End Service Campaign', segment: 'All Owners', scheduled: '2026-06-20T09:00:00', status: 'scheduled', reach: 12400 },
  { id: 'bc-2', title: 'New RAV4 Hybrid Launch', segment: 'SUV Interested', scheduled: '2026-06-12T09:00:00', status: 'sent', reach: 3200 },
]

export const adminWarrantyQueue = warrantyClaims.map((c) => ({
  ...c,
  customerName: c.vehicleId === 'ov-1' ? 'Adaeze Okonkwo' : 'Adaeze Okonkwo',
  vehicle: c.vehicleId === 'ov-1' ? '2022 Corolla' : '2020 RAV4',
}))

export const adminSupportQueue = supportTickets.map((t) => ({
  ...t,
  customerName: 'Adaeze Okonkwo',
  assignedTo: t.status === 'in_progress' ? 'Blessing Uche' : 'Sarah Adeyemi',
  slaStatus: t.status === 'in_progress' ? 'at_risk' : 'ok',
}))

export const inventoryList = vehicles.map((v) => ({
  id: v.id,
  title: `${v.year} ${v.model} ${v.trim}`,
  vin: v.vin,
  color: v.color,
  price: v.promotionalPrice || v.price,
  status: v.availability,
  branch: v.branchId,
  image: v.images[0],
  published: v.availability !== 'sold',
}))

export const customerSegments = [
  { id: 'seg-1', name: 'VIP Owners', count: 234, criteria: 'Spend > ₦50M' },
  { id: 'seg-2', name: 'Premium Owners', count: 1840, criteria: '2+ vehicles' },
  { id: 'seg-3', name: 'Service Regulars', count: 4520, criteria: '3+ services/year' },
  { id: 'seg-4', name: 'New Buyers', count: 890, criteria: 'Purchase < 12 months' },
  { id: 'seg-5', name: 'At-Risk', count: 156, criteria: 'No service 12+ months' },
]

export const slaConfigs = [
  { category: 'Sales', response: '2 hours', resolution: '48 hours', breaches: 0 },
  { category: 'Service', response: '4 hours', resolution: '72 hours', breaches: 2 },
  { category: 'Warranty', response: '24 hours', resolution: '7 days', breaches: 0 },
  { category: 'Billing', response: '48 hours', resolution: '5 days', breaches: 1 },
  { category: 'General', response: '24 hours', resolution: '5 days', breaches: 0 },
]

export const recallAdminList = recallNotices.map((r) => ({
  ...r,
  affectedCount: r.affected ? 1247 : 0,
  notifiedCount: r.affected ? 892 : 0,
}))

export const vehicleSalesByModel = [
  { model: 'Corolla', sold: 45, available: 8 },
  { model: 'Camry', sold: 32, available: 5 },
  { model: 'RAV4', sold: 28, available: 6 },
  { model: 'Hilux', sold: 38, available: 4 },
  { model: 'Land Cruiser', sold: 12, available: 3 },
]
