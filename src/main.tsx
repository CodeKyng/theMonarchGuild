import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThirdwebProvider } from "thirdweb/react"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThirdwebProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ThirdwebProvider>
  </StrictMode>
)
