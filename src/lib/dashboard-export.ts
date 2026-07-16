import type { DashboardOverview } from '@/lib/dashboard-api'
import { downloadCsv, rowsToCsv } from '@/lib/csv-export'
import { formatCurrency } from '@/lib/utils'

function sectionTitle(title: string) {
  return `\n${title}\n${'='.repeat(title.length)}\n`
}

export function exportDashboardReport(data: DashboardOverview) {
  const { summary: s } = data
  const generated = new Date().toLocaleString('en-NG')
  const lines: string[] = [
    'ELIZADE CONNECT — OPERATIONS REPORT',
    `Generated,${generated}`,
    '',
    sectionTitle('EXECUTIVE SUMMARY').trim(),
    rowsToCsv(
      ['Metric', 'Value', 'Detail'],
      [
        ['Inventory available', s.vehiclesAvailable, `${s.vehiclesTotal} total stock`],
        ['Vehicles reserved', s.vehiclesReserved, ''],
        ['Vehicles sold', s.vehiclesSold, ''],
        ['Customers total', s.customersTotal, `${s.customersNew30d} new in 30 days`],
        ['Customers with vehicle', s.customersWithVehicle, ''],
        ['Staff active', s.staffActive, `${s.staffTotal} total`],
        ['Branches active', s.branchesActive, `${s.branchesTotal} total`],
        ['Open support tickets', s.openSupportTickets, `${s.slaAtRiskTickets} SLA at risk`],
        ['Pending warranty claims', s.pendingWarrantyClaims, ''],
        ['Active leads', s.leadsActive, formatCurrency(s.leadsPipelineValue)],
        ['Leads new this week', s.leadsNewThisWeek, ''],
        ['Lead conversion rate', `${s.leadsConversionRate}%`, 'Won vs closed'],
        ['Service today', s.serviceToday, `${s.serviceCapacity} bay capacity`],
        ['Service in progress', s.serviceInProgress, ''],
        ['Service awaiting approval', s.serviceAwaitingApproval, ''],
        ['Service completed today', s.serviceCompletedToday, ''],
      ],
    ),
    '',
    sectionTitle('LEAD PIPELINE BY STAGE').trim(),
    rowsToCsv(
      ['Stage', 'Status', 'Count', 'Value (NGN)'],
      data.leadPipeline.map((row) => [row.stage, row.status, row.count, row.value]),
    ),
    '',
    sectionTitle('LEAD SOURCES').trim(),
    rowsToCsv(
      ['Source', 'Count'],
      data.leadSources.map((row) => [row.source, row.count]),
    ),
    '',
    sectionTitle('HOT LEADS').trim(),
    rowsToCsv(
      ['Customer', 'Model', 'Status', 'Value (NGN)', 'Assigned agent'],
      data.hotLeads.map((row) => [
        row.customerName,
        row.interestedModel,
        row.status,
        row.value,
        row.assignedAgent ?? 'Unassigned',
      ]),
    ),
    '',
    sectionTitle('INVENTORY BY MODEL').trim(),
    rowsToCsv(
      ['Model', 'Available', 'Sold'],
      data.inventoryByModel.map((row) => [row.model, row.available, row.sold]),
    ),
    '',
    sectionTitle('SERVICE BY TYPE').trim(),
    rowsToCsv(
      ['Type', 'Count'],
      data.serviceByType.map((row) => [row.type, row.count]),
    ),
    '',
    sectionTitle('BRANCH PERFORMANCE').trim(),
    rowsToCsv(
      ['Branch', 'Vehicles', 'Appointments today', 'Active leads'],
      data.branchStats.map((row) => [row.name, row.vehicles, row.appointmentsToday, row.activeLeads]),
    ),
    '',
    sectionTitle('STAFF PERFORMANCE').trim(),
    rowsToCsv(
      ['Name', 'Department', 'Leads won', 'Open tickets'],
      data.staffPerformance.map((row) => [row.name, row.department, row.leadsWon, row.ticketsOpen]),
    ),
    '',
    sectionTitle('REVENUE BY MONTH').trim(),
    rowsToCsv(
      ['Month', 'Sales (won)', 'Service'],
      data.revenueByMonth.map((row) => [row.month, row.sales, row.service]),
    ),
    '',
    sectionTitle('CUSTOMER SIGN-UPS BY MONTH').trim(),
    rowsToCsv(
      ['Month', 'New customers'],
      data.customerSignupsByMonth.map((row) => [row.month, row.customers]),
    ),
    '',
    sectionTitle('RECENT ACTIVITY').trim(),
    rowsToCsv(
      ['Activity', 'Meta', 'Time'],
      data.recentActivity.map((row) => [row.text, row.meta, row.time]),
    ),
  ]

  const stamp = new Date().toISOString().slice(0, 10)
  downloadCsv(`elizade-operations-report-${stamp}.csv`, lines.join('\n'))
}
