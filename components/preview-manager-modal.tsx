"use client"

import React from "react"
import { PreviewLeaderModal } from "@/components/preview-leader-modal"

// Wrapper para líderes de área/gerenciales que reutiliza PreviewLeaderModal
// Forzamos userRole="lider_gerencial" y permitimos pasar las mismas props que el modal base.
export type PreviewManagerModalProps = React.ComponentProps<typeof PreviewLeaderModal>

export function PreviewManagerModal(props: PreviewManagerModalProps) {
  return (
    <PreviewLeaderModal
      {...props}
      userRole={"lider_gerencial"}
      // Badge y textos ya están gestionados dentro de PreviewLeaderModal por userRole
    />
  )
}
