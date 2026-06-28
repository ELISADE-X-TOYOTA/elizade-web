import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Play, Plus, Send } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer, DrawerSection } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ApiError } from '@/lib/api'
import {
  createBroadcastCampaign,
  createNotificationRule,
  evaluateNotificationRule,
  listBroadcastCampaigns,
  listNotificationRules,
  sendBroadcastCampaign,
  updateNotificationRule,
  type BroadcastCampaign,
  type NotificationRule,
} from '@/lib/notifications-api'
import { cn } from '@/lib/utils'

const NOTIFICATION_CHANNELS = ['in_app', 'email', 'push'] as const

const TRIGGER_OPTIONS = [
  { value: 'service_due_soon', label: 'Service due soon', description: 'Customers with a vehicle service date within N days' },
  { value: 'marketing_opt_in', label: 'Marketing opt-in', description: 'Customers who opted in to promotional messages' },
] as const

const SEGMENT_OPTIONS = [
  { value: 'all_customers', label: 'All customers' },
  { value: 'has_vehicle', label: 'Has vehicle' },
  { value: 'no_vehicle', label: 'No vehicle' },
  { value: 'marketing_opt_in', label: 'Marketing opt-in' },
  { value: 'active_customers', label: 'Active customers' },
] as const

const CADENCE_OPTIONS = ['immediate', 'daily', 'weekly', 'monthly'] as const

const CHANNEL_LABELS: Record<(typeof NOTIFICATION_CHANNELS)[number], string> = {
  in_app: 'In-app',
  email: 'Email',
  push: 'Push',
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(18,26,42,0.1)',
}

/** Navy admin buttons — explicit white label (overrides default Button foreground). */
const btnNavy = 'bg-[#121a2a] text-white hover:bg-[#121a2a]/90 hover:text-white [&_svg]:text-white'
const btnGold = 'bg-[#ffcf0f] text-[#121a2a] hover:bg-[#ffcf0f]/90 hover:text-[#121a2a] [&_svg]:text-[#121a2a]'
const btnSend = btnGold

type Channel = (typeof NOTIFICATION_CHANNELS)[number]

interface RuleFormState {
  name: string
  triggerKey: string
  cadence: string
  isActive: boolean
  channels: Channel[]
  daysBefore: string
  title: string
  body: string
  deepLink: string
}

interface CampaignFormState {
  title: string
  body: string
  segmentKey: string
  channels: Channel[]
}

const emptyRuleForm = (): RuleFormState => ({
  name: '',
  triggerKey: 'service_due_soon',
  cadence: 'daily',
  isActive: true,
  channels: ['in_app', 'email', 'push'],
  daysBefore: '14',
  title: '',
  body: '',
  deepLink: '/service/book',
})

const emptyCampaignForm = (): CampaignFormState => ({
  title: '',
  body: '',
  segmentKey: 'all_customers',
  channels: ['in_app', 'push'],
})

function ChannelPicker({
  selected,
  onChange,
}: {
  selected: Channel[]
  onChange: (channels: Channel[]) => void
}) {
  const toggle = (channel: Channel) => {
    onChange(
      selected.includes(channel)
        ? selected.filter((c) => c !== channel)
        : [...selected, channel],
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {NOTIFICATION_CHANNELS.map((channel) => {
        const active = selected.includes(channel)
        return (
          <button
            key={channel}
            type="button"
            onClick={() => toggle(channel)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              active
                ? 'border-[#ffcf0f] bg-[#ffcf0f]/20 text-[#121a2a]'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
            )}
          >
            {CHANNEL_LABELS[channel]}
          </button>
        )
      })}
    </div>
  )
}

export function AdminNotificationsPage() {
  const [rules, setRules] = useState<NotificationRule[]>([])
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [busyRuleId, setBusyRuleId] = useState<string | null>(null)
  const [busyCampaignId, setBusyCampaignId] = useState<string | null>(null)
  const [ruleDrawerOpen, setRuleDrawerOpen] = useState(false)
  const [campaignDrawerOpen, setCampaignDrawerOpen] = useState(false)
  const [ruleFilter, setRuleFilter] = useState<'all' | 'active' | 'disabled'>('all')
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'draft' | 'sent'>('all')
  const [ruleForm, setRuleForm] = useState<RuleFormState>(emptyRuleForm)
  const [campaignForm, setCampaignForm] = useState<CampaignFormState>(emptyCampaignForm)
  const [savingRule, setSavingRule] = useState(false)
  const [savingCampaign, setSavingCampaign] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [ruleRows, campaignRows] = await Promise.all([
        listNotificationRules(),
        listBroadcastCampaigns(),
      ])
      setRules(ruleRows)
      setCampaigns(campaignRows)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const openRuleDrawer = () => {
    setRuleForm(emptyRuleForm())
    setRuleDrawerOpen(true)
  }

  const openCampaignDrawer = () => {
    setCampaignForm(emptyCampaignForm())
    setCampaignDrawerOpen(true)
  }

  const handleEvaluate = async (rule: NotificationRule) => {
    setBusyRuleId(rule.id)
    try {
      const result = await evaluateNotificationRule(rule.id)
      toast.success(
        `Sent to ${result.matchedUsers} users · ${result.notificationsCreated} in-app · ${result.emailsSent} email · ${result.pushesSent} push`,
      )
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Rule evaluation failed')
    } finally {
      setBusyRuleId(null)
    }
  }

  const handleToggleRule = async (rule: NotificationRule) => {
    try {
      const updated = await updateNotificationRule(rule.id, { isActive: !rule.isActive })
      setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      toast.success(updated.isActive ? 'Rule activated' : 'Rule disabled')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update rule')
    }
  }

  const handleCreateRule = async () => {
    if (!ruleForm.name.trim()) {
      toast.error('Rule name is required')
      return
    }
    if (ruleForm.channels.length === 0) {
      toast.error('Select at least one delivery channel')
      return
    }

    const config: Record<string, unknown> = {
      title: ruleForm.title.trim() || ruleForm.name.trim(),
      deep_link: ruleForm.deepLink.trim() || undefined,
    }
    if (ruleForm.body.trim()) config.body = ruleForm.body.trim()
    if (ruleForm.triggerKey === 'service_due_soon') {
      config.days_before = Number(ruleForm.daysBefore) || 14
    }

    setSavingRule(true)
    try {
      const created = await createNotificationRule({
        name: ruleForm.name.trim(),
        triggerKey: ruleForm.triggerKey,
        channels: ruleForm.channels,
        cadence: ruleForm.cadence,
        isActive: ruleForm.isActive,
        config,
      })
      setRules((prev) => [created, ...prev])
      setRuleDrawerOpen(false)
      toast.success('Automation rule created')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create rule')
    } finally {
      setSavingRule(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!campaignForm.title.trim()) {
      toast.error('Campaign title is required')
      return
    }
    if (!campaignForm.body.trim()) {
      toast.error('Campaign message is required')
      return
    }
    if (campaignForm.channels.length === 0) {
      toast.error('Select at least one delivery channel')
      return
    }

    setSavingCampaign(true)
    try {
      const created = await createBroadcastCampaign({
        title: campaignForm.title.trim(),
        body: campaignForm.body.trim(),
        segmentKey: campaignForm.segmentKey,
        channels: campaignForm.channels,
      })
      setCampaigns((prev) => [created, ...prev])
      setCampaignDrawerOpen(false)
      toast.success(`Draft campaign created · estimated reach ${created.reachCount}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create campaign')
    } finally {
      setSavingCampaign(false)
    }
  }

  const handleSendCampaign = async (campaign: BroadcastCampaign) => {
    setBusyCampaignId(campaign.id)
    try {
      const result = await sendBroadcastCampaign(campaign.id)
      toast.success(
        `Campaign sent to ${result.reachCount} users · ${result.notificationsCreated} in-app notifications`,
      )
      await loadAll()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Campaign send failed')
    } finally {
      setBusyCampaignId(null)
    }
  }

  const selectedTrigger = TRIGGER_OPTIONS.find((t) => t.value === ruleForm.triggerKey)

  const activeRules = rules.filter((rule) => rule.isActive)
  const disabledRules = rules.filter((rule) => !rule.isActive)
  const draftCampaigns = campaigns.filter((campaign) => campaign.status === 'draft')
  const sentCampaigns = campaigns.filter((campaign) => campaign.status === 'sent')

  const filteredRules = useMemo(() => {
    if (ruleFilter === 'active') return activeRules
    if (ruleFilter === 'disabled') return disabledRules
    return rules
  }, [activeRules, disabledRules, ruleFilter, rules])

  const filteredCampaigns = useMemo(() => {
    if (campaignFilter === 'draft') return draftCampaigns
    if (campaignFilter === 'sent') return sentCampaigns
    return campaigns
  }, [campaignFilter, campaigns, draftCampaigns, sentCampaigns])

  const ruleDonutData = [
    { name: 'Active', value: activeRules.length, color: '#ffcf0f' },
    { name: 'Disabled', value: disabledRules.length, color: '#25324d' },
  ]
  const campaignDonutData = [
    { name: 'Sent', value: sentCampaigns.length, color: '#ffcf0f' },
    { name: 'Draft', value: draftCampaigns.length, color: '#25324d' },
  ]

  const channelUsage = useMemo(() => {
    const usage: Record<Channel, number> = {
      in_app: 0,
      email: 0,
      push: 0,
    }

    rules.forEach((rule) => {
      rule.channels.forEach((channel) => {
        if (channel in usage) {
          usage[channel as Channel] += 1
        }
      })
    })

    campaigns.forEach((campaign) => {
      campaign.channels.forEach((channel) => {
        if (channel in usage) {
          usage[channel as Channel] += 1
        }
      })
    })

    const total = Object.values(usage).reduce((sum, count) => sum + count, 0)
    return {
      total,
      rows: NOTIFICATION_CHANNELS.map((channel) => ({
        channel,
        label: CHANNEL_LABELS[channel],
        count: usage[channel],
        share: total === 0 ? 0 : Math.round((usage[channel] / total) * 100),
      })),
    }
  }, [campaigns, rules])

  const ruleActivePct = rules.length === 0 ? 0 : Math.round((activeRules.length / rules.length) * 100)
  const campaignsSentPct = campaigns.length === 0 ? 0 : Math.round((sentCampaigns.length / campaigns.length) * 100)

  const cardClassName = 'rounded-2xl border border-[#121a2a]/10 shadow-sm'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#121a2a] dark:text-white">Notifications</h1>
          <p className="text-sm text-muted-foreground">Rules, broadcasts, and delivery channels for Elizade Connect.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2 rounded-xl border-[#121a2a]/20" onClick={openRuleDrawer}>
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
          <Button className={cn('gap-2 rounded-xl', btnGold)} onClick={openCampaignDrawer}>
            <Send className="h-4 w-4" />
            New Broadcast
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-full border border-[#121a2a]/15 bg-white px-4 py-2.5 text-center dark:bg-slate-900">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active rules</p>
          <p className="font-display text-lg font-bold text-[#121a2a] dark:text-white">{activeRules.length}</p>
        </div>
        <div className="rounded-full border border-[#121a2a]/15 bg-white px-4 py-2.5 text-center dark:bg-slate-900">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Disabled rules</p>
          <p className="font-display text-lg font-bold text-[#121a2a] dark:text-white">{disabledRules.length}</p>
        </div>
        <div className="rounded-full border border-[#121a2a]/15 bg-white px-4 py-2.5 text-center dark:bg-slate-900">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Draft campaigns</p>
          <p className="font-display text-lg font-bold text-[#121a2a] dark:text-white">{draftCampaigns.length}</p>
        </div>
        <div className="rounded-full border border-[#121a2a]/15 bg-white px-4 py-2.5 text-center dark:bg-slate-900">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sent campaigns</p>
          <p className="font-display text-lg font-bold text-[#121a2a] dark:text-white">{sentCampaigns.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading notifications...
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className={cardClassName}>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Automation rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-[#121a2a]/10 bg-muted/20 p-2.5">
                    <p className="text-[11px] text-muted-foreground">Active</p>
                    <p className="font-display text-lg font-semibold">{activeRules.length}</p>
                  </div>
                  <div className="rounded-xl border border-[#121a2a]/10 bg-muted/20 p-2.5">
                    <p className="text-[11px] text-muted-foreground">Disabled</p>
                    <p className="font-display text-lg font-semibold">{disabledRules.length}</p>
                  </div>
                  <div className="rounded-xl border border-[#121a2a]/10 bg-muted/20 p-2.5">
                    <p className="text-[11px] text-muted-foreground">Total</p>
                    <p className="font-display text-lg font-semibold">{rules.length}</p>
                  </div>
                </div>
                <div className="h-24 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ruleDonutData} dataKey="value" innerRadius={26} outerRadius={38} paddingAngle={2}>
                        {ruleDonutData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="mt-1 text-center text-[10px] text-muted-foreground">{ruleActivePct}% active</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'disabled'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setRuleFilter(tab)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                      ruleFilter === tab
                        ? 'border-[#ffcf0f] bg-[#ffcf0f] text-[#121a2a]'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted/40',
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-3">Name</th>
                      <th className="pb-2 pr-3">Trigger</th>
                      <th className="pb-2 pr-3">Channels</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-5 text-center text-sm text-muted-foreground">
                          No rules in this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRules.map((rule) => (
                        <tr key={rule.id} className="border-b border-border/40 align-top">
                          <td className="py-3 pr-3">
                            <p className="font-medium">{rule.name}</p>
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">{rule.triggerKey}</td>
                          <td className="py-3 pr-3">
                            <div className="flex flex-wrap gap-1">
                              {rule.channels.map((channel) => (
                                <Badge key={channel} variant="outline" className="text-[10px]">
                                  {channel}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 pr-3">
                            <Badge variant={rule.isActive ? 'success' : 'secondary'}>
                              {rule.isActive ? 'Active' : 'Disabled'}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1.5">
                              <Button
                                size="sm"
                                className={cn('h-7 gap-1 px-2 text-xs', btnNavy)}
                                disabled={!rule.isActive || busyRuleId === rule.id}
                                onClick={() => handleEvaluate(rule)}
                              >
                                {busyRuleId === rule.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Play className="h-3.5 w-3.5" />
                                )}
                                Run
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleToggleRule(rule)}
                              >
                                {rule.isActive ? 'Disable' : 'Enable'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClassName}>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Broadcast campaigns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-[#121a2a]/10 bg-muted/20 p-2.5">
                    <p className="text-[11px] text-muted-foreground">Draft</p>
                    <p className="font-display text-lg font-semibold">{draftCampaigns.length}</p>
                  </div>
                  <div className="rounded-xl border border-[#121a2a]/10 bg-muted/20 p-2.5">
                    <p className="text-[11px] text-muted-foreground">Sent</p>
                    <p className="font-display text-lg font-semibold">{sentCampaigns.length}</p>
                  </div>
                  <div className="rounded-xl border border-[#121a2a]/10 bg-muted/20 p-2.5">
                    <p className="text-[11px] text-muted-foreground">Total</p>
                    <p className="font-display text-lg font-semibold">{campaigns.length}</p>
                  </div>
                </div>
                <div className="h-24 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={campaignDonutData} dataKey="value" innerRadius={26} outerRadius={38} paddingAngle={2}>
                        {campaignDonutData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="mt-1 text-center text-[10px] text-muted-foreground">{campaignsSentPct}% sent</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['all', 'draft', 'sent'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCampaignFilter(tab)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                      campaignFilter === tab
                        ? 'border-[#ffcf0f] bg-[#ffcf0f] text-[#121a2a]'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted/40',
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-3">Title</th>
                      <th className="pb-2 pr-3">Segment</th>
                      <th className="pb-2 pr-3">Reach</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2">Send</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-5 text-center text-sm text-muted-foreground">
                          No campaigns in this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-border/40 align-top">
                          <td className="py-3 pr-3">
                            <p className="font-medium">{campaign.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{campaign.body}</p>
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">{campaign.segmentKey}</td>
                          <td className="py-3 pr-3 font-medium">{campaign.reachCount.toLocaleString()}</td>
                          <td className="py-3 pr-3">
                            <Badge variant={campaign.status === 'sent' ? 'success' : campaign.status === 'draft' ? 'outline' : 'warning'}>
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            {campaign.status === 'sent' ? (
                              <span className="text-xs text-muted-foreground">Delivered</span>
                            ) : (
                              <Button
                                size="sm"
                                className={cn('h-7 gap-1 rounded-lg px-2 text-xs', btnSend)}
                                disabled={busyCampaignId === campaign.id}
                                onClick={() => handleSendCampaign(campaign)}
                              >
                                {busyCampaignId === campaign.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Send className="h-3.5 w-3.5" />
                                )}
                                Send
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClassName}>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Delivery channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Channel usage across all automation rules and campaigns ({channelUsage.total} assignments).
              </p>
              <div className="space-y-3">
                {channelUsage.rows.map((row) => (
                  <div key={row.channel} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="font-medium">
                        {row.count} <span className="text-xs text-muted-foreground">({row.share}%)</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[#121a2a]"
                        style={{ width: `${Math.max(row.share, row.count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={cardClassName}>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Create and dispatch customer communication flows with one click.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button onClick={openRuleDrawer} className={cn('justify-start gap-2 rounded-xl', btnNavy)}>
                  <Plus className="h-4 w-4" />
                  Create automation rule
                </Button>
                <Button onClick={openCampaignDrawer} className={cn('justify-start gap-2 rounded-xl', btnGold)}>
                  <Send className="h-4 w-4" />
                  Create broadcast
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2 rounded-xl border-[#121a2a]/20 sm:col-span-2">
                  <Link to="/admin/analytics">View notification analytics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Drawer
        open={ruleDrawerOpen}
        onClose={() => setRuleDrawerOpen(false)}
        title="New automation rule"
        description="Define when notifications fire and which channels to use."
        width="lg"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setRuleDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRule} disabled={savingRule} className={cn('rounded-xl', btnNavy)}>
              {savingRule ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create rule'}
            </Button>
          </div>
        }
      >
        <DrawerSection title="Rule details" accent="violet">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Rule name *</Label>
              <Input
                value={ruleForm.name}
                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                placeholder="e.g. Service due in 14 days"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Trigger *</Label>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={ruleForm.triggerKey}
                onChange={(e) => setRuleForm({ ...ruleForm, triggerKey: e.target.value })}
              >
                {TRIGGER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {selectedTrigger && (
                <p className="text-[11px] text-muted-foreground">{selectedTrigger.description}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cadence</Label>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={ruleForm.cadence}
                onChange={(e) => setRuleForm({ ...ruleForm, cadence: e.target.value })}
              >
                {CADENCE_OPTIONS.map((cadence) => (
                  <option key={cadence} value={cadence}>{cadence}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-[11px] text-muted-foreground">Inactive rules cannot be run</p>
              </div>
              <Switch
                checked={ruleForm.isActive}
                onCheckedChange={(checked) => setRuleForm({ ...ruleForm, isActive: checked })}
              />
            </div>
          </div>
        </DrawerSection>

        <DrawerSection title="Delivery channels" accent="sky" className="mt-6">
          <ChannelPicker
            selected={ruleForm.channels}
            onChange={(channels) => setRuleForm({ ...ruleForm, channels })}
          />
        </DrawerSection>

        <DrawerSection title="Message content" accent="amber" className="mt-6">
          <div className="space-y-4">
            {ruleForm.triggerKey === 'service_due_soon' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Days before service due</Label>
                <Input
                  type="number"
                  min={1}
                  max={90}
                  value={ruleForm.daysBefore}
                  onChange={(e) => setRuleForm({ ...ruleForm, daysBefore: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Notification title</Label>
              <Input
                value={ruleForm.title}
                onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                placeholder="Your Toyota is due for service"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message body</Label>
              <textarea
                className="min-h-[96px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={ruleForm.body}
                onChange={(e) => setRuleForm({ ...ruleForm, body: e.target.value })}
                placeholder="Optional - a default is generated for service reminders"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Deep link (mobile / web route)</Label>
              <Input
                value={ruleForm.deepLink}
                onChange={(e) => setRuleForm({ ...ruleForm, deepLink: e.target.value })}
                placeholder="/service/book"
              />
            </div>
          </div>
        </DrawerSection>
      </Drawer>

      <Drawer
        open={campaignDrawerOpen}
        onClose={() => setCampaignDrawerOpen(false)}
        title="New broadcast campaign"
        description="Compose a one-time message for a customer segment. Saves as draft until you send."
        width="lg"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setCampaignDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCampaign} disabled={savingCampaign} className={cn('rounded-xl', btnNavy)}>
              {savingCampaign ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save draft'}
            </Button>
          </div>
        }
      >
        <DrawerSection title="Campaign content" accent="violet">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input
                value={campaignForm.title}
                onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                placeholder="e.g. June service special"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message *</Label>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={campaignForm.body}
                onChange={(e) => setCampaignForm({ ...campaignForm, body: e.target.value })}
                placeholder="Write the full broadcast message customers will receive..."
              />
            </div>
          </div>
        </DrawerSection>

        <DrawerSection title="Audience & delivery" accent="sky" className="mt-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Customer segment *</Label>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={campaignForm.segmentKey}
                onChange={(e) => setCampaignForm({ ...campaignForm, segmentKey: e.target.value })}
              >
                {SEGMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Channels *</Label>
              <ChannelPicker
                selected={campaignForm.channels}
                onChange={(channels) => setCampaignForm({ ...campaignForm, channels })}
              />
            </div>
          </div>
        </DrawerSection>
      </Drawer>
    </div>
  )
}
