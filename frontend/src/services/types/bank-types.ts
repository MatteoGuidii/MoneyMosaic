export interface BankConnection {
  id: number
  institution_id: string
  name: string
  created_at: string
  updated_at: string
  is_active: boolean
  health_status?: {
    status: 'healthy' | 'unhealthy' | 'maintenance'
    last_check: string
    error?: string
  }
}
