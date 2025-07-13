import { Account } from '../../../services/apiService'

export interface AccountsDataTableProps {
  accounts: Account[]
  onAccountSelect?: (account: Account) => void
  onSyncAccount?: (accountId: string) => void
  onViewTransactions?: (accountId: string) => void
  onDeleteAccount?: (accountId: string) => void
}

export interface AccountRowProps {
  account: Account
  isDropdownActive: boolean
  onAccountSelect?: (account: Account) => void
  onDropdownToggle: (accountId: string) => void
  onSyncAccount?: (accountId: string) => void
  onViewTransactions?: (accountId: string) => void
  onDeleteAccount?: (accountId: string) => void
}

export interface AccountStatus {
  status: 'healthy' | 'warning' | 'error'
  label: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

export interface EmptyStateProps {
  title: string
  description: string
}

export interface AccountActionsDropdownProps {
  accountId: string
  isOpen: boolean
  onSyncAccount?: (accountId: string) => void
  onViewTransactions?: (accountId: string) => void
  onDeleteAccount?: (accountId: string) => void
  onClose: () => void
}
