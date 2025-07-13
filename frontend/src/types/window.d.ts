// Window interface extension for third-party libraries
declare global {
  interface Window {
    Plaid: {
      create: (config: {
        token: string
        onSuccess: (publicToken: string, metadata: any) => void
        onExit: (error: any) => void
        onEvent: (eventName: string, metadata: any) => void
      }) => {
        open: () => void
      }
    }
  }
}

export {}
