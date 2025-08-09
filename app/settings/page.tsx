import { SimpleConfigurationPanel } from "@/components/simple-configuration-panel"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <SimpleConfigurationPanel />
    </div>
  )
}

export const metadata = {
  title: "Configuración - Portal de Innovación GTTD",
  description: "Panel de configuración del sistema de scoring"
}
