export interface SyncButtonProps {
  onSyncComplete?: () => void
  variant?: 'icon' | 'button' | 'full'
  className?: string
  includeInvestments?: boolean
  investmentOnly?: boolean
}

export interface SyncStatus {
  lastSync: string
  isHealthy: boolean
  nextAutoSync: string
}

export interface SyncIconProps {
  isLoading: boolean
  isHealthy?: boolean
}

export interface SyncButtonVariantProps {
  isLoading: boolean
  onSync: () => void
  className?: string
  investmentOnly?: boolean
  children?: React.ReactNode
}

export interface SyncStatusPanelProps {
  syncStatus: SyncStatus | null
  lastSyncResult: string | null
  isLoading: boolean
  onSync: () => void
  className?: string
}
