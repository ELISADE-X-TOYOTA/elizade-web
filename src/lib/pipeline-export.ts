import type { LeadListItem, LeadPipeline } from '@/lib/leads-api'
import { downloadCsv, rowsToCsv } from '@/lib/csv-export'

const STAGE_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const

const STAGE_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
}

export function exportPipelineBreakdown(pipeline: LeadPipeline, leads: LeadListItem[]) {
  const total = pipeline.totalLeads || 1
  const stamp = new Date().toISOString().slice(0, 10)

  const stageRows = STAGE_ORDER.map((status) => {
    const row = pipeline.byStatus.find((s) => s.status === status)
    const count = row?.count ?? 0
    const value = Number(row?.value ?? 0)
    const avg = count > 0 ? Math.round(value / count) : 0
    const share = Math.round((count / total) * 100)
    return [STAGE_LABELS[status] ?? status, status, count, value, avg, `${share}%`]
  })

  const sourceMap = new Map<string, { count: number; value: number }>()
  for (const lead of leads) {
    const key = lead.source || 'unknown'
    const prev = sourceMap.get(key) ?? { count: 0, value: 0 }
    sourceMap.set(key, { count: prev.count + 1, value: prev.value + Number(lead.value) })
  }
  const sourceRows = [...sourceMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([source, stats]) => [source, stats.count, stats.value])

  const agentMap = new Map<string, { name: string; count: number; value: number; won: number }>()
  for (const lead of leads) {
    const key = lead.assignedAgent?.id ?? 'unassigned'
    const name = lead.assignedAgent
      ? `${lead.assignedAgent.firstName} ${lead.assignedAgent.lastName}`.trim()
      : 'Unassigned'
    const prev = agentMap.get(key) ?? { name, count: 0, value: 0, won: 0 }
    agentMap.set(key, {
      name,
      count: prev.count + 1,
      value: prev.value + Number(lead.value),
      won: prev.won + (lead.status === 'won' ? 1 : 0),
    })
  }
  const agentRows = [...agentMap.values()]
    .sort((a, b) => b.count - a.count)
    .map((row) => [row.name, row.count, row.value, row.won])

  const leadRows = leads.map((lead) => [
    lead.customerName,
    lead.email ?? '',
    lead.phone,
    lead.source,
    STAGE_LABELS[lead.status] ?? lead.status,
    lead.interestedModel,
    lead.value,
    lead.assignedAgent
      ? `${lead.assignedAgent.firstName} ${lead.assignedAgent.lastName}`.trim()
      : 'Unassigned',
    lead.createdAt,
    lead.updatedAt,
  ])

  const content = [
    'ELIZADE CONNECT — PIPELINE BREAKDOWN REPORT',
    `Generated,${new Date().toLocaleString('en-NG')}`,
    '',
    'SUMMARY',
    rowsToCsv(
      ['Metric', 'Value'],
      [
        ['Total leads', pipeline.totalLeads],
        ['Total pipeline value (NGN)', Number(pipeline.totalValue)],
        ['Conversion rate', `${pipeline.conversionRate}%`],
        ['New this week', pipeline.newThisWeek],
      ],
    ),
    '',
    'BY STAGE',
    rowsToCsv(['Stage', 'Status key', 'Count', 'Value (NGN)', 'Avg deal (NGN)', 'Share of total'], stageRows),
    '',
    'BY SOURCE',
    rowsToCsv(['Source', 'Count', 'Value (NGN)'], sourceRows),
    '',
    'BY ASSIGNED AGENT',
    rowsToCsv(['Agent', 'Leads', 'Value (NGN)', 'Won'], agentRows),
    '',
    'ALL LEADS',
    rowsToCsv(
      [
        'Customer',
        'Email',
        'Phone',
        'Source',
        'Stage',
        'Interested model',
        'Value (NGN)',
        'Assigned agent',
        'Created',
        'Updated',
      ],
      leadRows,
    ),
  ].join('\n')

  downloadCsv(`elizade-pipeline-breakdown-${stamp}.csv`, content)
}

export { STAGE_ORDER, STAGE_LABELS }
