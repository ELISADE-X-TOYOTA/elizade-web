import { apiFetch } from '@/lib/api'

export interface NotificationRule {
  id: string
  name: string
  triggerKey: string
  channels: string[]
  cadence: string
  isActive: boolean
  config?: Record<string, unknown> | null
}

export interface BroadcastCampaign {
  id: string
  title: string
  body: string
  segmentKey: string
  channels: string[]
  status: string
  reachCount: number
  scheduledAt?: string | null
  sentAt?: string | null
}

export interface RuleEvaluateResult {
  ruleId: string
  matchedUsers: number
  notificationsCreated: number
  emailsSent: number
  pushesSent: number
}

export interface CampaignSendResult {
  campaignId: string
  status: string
  reachCount: number
  notificationsCreated: number
  emailsSent: number
  pushesSent: number
}

export interface UserNotificationItem {
  id: string
  title: string
  body: string
  category: string
  isRead: boolean
  deepLink?: string | null
  createdAt: string
}

export function listNotificationRules(): Promise<NotificationRule[]> {
  return apiFetch('/admin/notifications/rules')
}

export function createNotificationRule(body: {
  name: string
  triggerKey: string
  channels: string[]
  cadence?: string
  isActive?: boolean
  config?: Record<string, unknown>
}): Promise<NotificationRule> {
  return apiFetch('/admin/notifications/rules', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateNotificationRule(
  id: string,
  body: Partial<{
    name: string
    channels: string[]
    cadence: string
    isActive: boolean
    config: Record<string, unknown>
  }>,
): Promise<NotificationRule> {
  return apiFetch(`/admin/notifications/rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function evaluateNotificationRule(id: string): Promise<RuleEvaluateResult> {
  return apiFetch(`/admin/notifications/rules/${id}/evaluate`, { method: 'POST' })
}

export function listBroadcastCampaigns(): Promise<BroadcastCampaign[]> {
  return apiFetch('/admin/notifications/campaigns')
}

export function createBroadcastCampaign(body: {
  title: string
  body: string
  segmentKey: string
  channels: string[]
  scheduledAt?: string
}): Promise<BroadcastCampaign> {
  return apiFetch('/admin/notifications/campaigns', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function sendBroadcastCampaign(id: string): Promise<CampaignSendResult> {
  return apiFetch(`/admin/notifications/campaigns/${id}/send`, { method: 'POST' })
}

export function listUserNotifications(unreadOnly = false): Promise<UserNotificationItem[]> {
  const qs = unreadOnly ? '?unreadOnly=true' : ''
  return apiFetch(`/notifications${qs}`)
}

export function markNotificationRead(id: string): Promise<{ id: string; isRead: boolean }> {
  return apiFetch(`/notifications/${id}/read`, { method: 'POST' })
}

export function markAllNotificationsRead(): Promise<{ updated: number }> {
  return apiFetch('/notifications/read-all', { method: 'POST' })
}
