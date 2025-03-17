/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_NETWORK: string
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }