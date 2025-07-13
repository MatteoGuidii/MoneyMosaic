export interface Bank {
  id: number
  institution_id: string
  name: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface HealthStatus {
  institution_id: string
  status: string
  last_check: string
  error?: string
}

export interface BankManagementProps {
  onBankConnectionChange?: () => Promise<void>
  onSyncComplete?: () => Promise<void>
}

export interface BankManagementState {
  banks: Bank[]
  healthStatuses: HealthStatus[]
  loading: boolean
  syncing: boolean
  checkingHealth: boolean
  connectingBank: boolean
  error: string | null
  successMessage: string | null
}
