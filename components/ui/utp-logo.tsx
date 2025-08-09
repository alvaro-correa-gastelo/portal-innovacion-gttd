"use client"

import { cn } from "@/lib/utils"

interface UTPLogoProps {
  variant?: "default" | "compact" | "text-only" | "icon-only" | "full-logo"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  theme?: "light" | "dark" | "auto"
  className?: string
}

export function UTPLogo({ 
  variant = "default", 
  size = "md", 
  theme = "auto",
  className 
}: UTPLogoProps) {
  const sizeClasses = {
    xs: {
      container: "h-8",
      icon: "w-6 h-6",
      text: "text-xs",
      subtitle: "text-[10px]"
    },
    sm: {
      container: "h-10", 
      icon: "w-8 h-8",
      text: "text-sm",
      subtitle: "text-xs"
    },
    md: {
      container: "h-12",
      icon: "w-10 h-10", 
      text: "text-base",
      subtitle: "text-sm"
    },
    lg: {
      container: "h-16",
      icon: "w-12 h-12",
      text: "text-lg", 
      subtitle: "text-base"
    },
    xl: {
      container: "h-20",
      icon: "w-16 h-16",
      text: "text-xl",
      subtitle: "text-lg"
    }
  }

  const currentSize = sizeClasses[size]

  const LogoIcon = ({ className: iconClassName }: { className?: string }) => {
    const logoSize = {
      xs: { container: "w-6 h-6", letter: "text-[6px]", letterSize: "w-1.5 h-4" },
      sm: { container: "w-8 h-8", letter: "text-[8px]", letterSize: "w-2 h-5" },
      md: { container: "w-10 h-10", letter: "text-[10px]", letterSize: "w-2.5 h-6" },
      lg: { container: "w-12 h-12", letter: "text-xs", letterSize: "w-3 h-7" },
      xl: { container: "w-16 h-16", letter: "text-sm", letterSize: "w-4 h-10" }
    }[size] || { container: "w-10 h-10", letter: "text-[10px]", letterSize: "w-2.5 h-6" }

    return (
      <div className={cn(
        "flex items-center justify-center relative shadow-lg rounded-sm overflow-hidden",
        logoSize.container,
        iconClassName
      )}>
        {/* Logo UTP Oficial */}
        <div className="flex h-full w-full">
          {/* U - Bloque Rojo */}
          <div className="bg-utp-red flex-1 flex items-center justify-center">
            <span className={cn(
              "font-black text-white tracking-tighter",
              logoSize.letter
            )}>
              U
            </span>
          </div>
          {/* T - Bloque Negro */}
          <div className="bg-black flex-1 flex items-center justify-center">
            <span className={cn(
              "font-black text-white tracking-tighter",
              logoSize.letter
            )}>
              T
            </span>
          </div>
          {/* P - Bloque Rojo */}
          <div className="bg-utp-red flex-1 flex items-center justify-center">
            <span className={cn(
              "font-black text-white tracking-tighter",
              logoSize.letter
            )}>
              P
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "icon-only") {
    return <LogoIcon className={className} />
  }

  if (variant === "text-only") {
    return (
      <div className={cn("flex flex-col", className)}>
        <h2 className={cn(
          "font-bold text-gray-900 dark:text-gray-100",
          currentSize.text
        )}>
          Universidad Tecnológica del Perú
        </h2>
        <p className={cn(
          "text-gray-600 dark:text-gray-400 font-medium",
          currentSize.subtitle
        )}>
          Portal de Innovación GTTD
        </p>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn(
        "flex items-center space-x-2",
        currentSize.container,
        className
      )}>
        <LogoIcon />
        <div className="flex flex-col justify-center min-w-0">
          <h2 className={cn(
            "font-bold text-gray-900 dark:text-gray-100 leading-tight",
            currentSize.text
          )}>
            GTTD
          </h2>
        </div>
      </div>
    )
  }

  if (variant === "full-logo") {
    return (
      <div className={cn(
        "flex items-center space-x-4",
        currentSize.container,
        className
      )}>
        <LogoIcon />
        <div className="flex flex-col justify-center min-w-0">
          <h2 className={cn(
            "font-bold text-gray-900 dark:text-gray-100 leading-tight",
            currentSize.text
          )}>
            Universidad Tecnológica del Perú
          </h2>
          <p className={cn(
            "text-gray-600 dark:text-gray-400 font-medium leading-tight",
            currentSize.subtitle
          )}>
            Portal de Innovación GTTD
          </p>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn(
      "flex items-center space-x-3",
      currentSize.container,
      className
    )}>
      <LogoIcon />
      <div className="flex flex-col justify-center min-w-0">
        <h2 className={cn(
          "font-bold text-gray-900 dark:text-gray-100 leading-tight",
          currentSize.text
        )}>
          UTP GTTD
        </h2>
        <p className={cn(
          "text-gray-600 dark:text-gray-400 font-medium leading-tight",
          currentSize.subtitle
        )}>
          Portal de Innovación
        </p>
      </div>
    </div>
  )
}

// Componente especializado para headers
export function UTPHeader({ 
  title, 
  subtitle, 
  size = "lg",
  className 
}: { 
  title?: string
  subtitle?: string
  size?: "md" | "lg" | "xl"
  className?: string 
}) {
  return (
    <div className={cn("text-center", className)}>
      <div className="flex items-center justify-center mb-4">
        <UTPLogo variant="icon-only" size={size} />
      </div>
      
      {title && (
        <h1 className={cn(
          "font-bold text-gray-900 dark:text-gray-100 mb-2",
          size === "md" ? "text-2xl" :
          size === "lg" ? "text-3xl" : "text-4xl"
        )}>
          {title}
        </h1>
      )}
      
      {subtitle && (
        <p className={cn(
          "text-gray-600 dark:text-gray-400 max-w-2xl mx-auto",
          size === "md" ? "text-base" :
          size === "lg" ? "text-lg" : "text-xl"
        )}>
          {subtitle}
        </p>
      )}
      
      <div className={cn(
        "mt-4 w-24 h-1 bg-gradient-to-r from-utp-blue-500 to-utp-blue-600 dark:from-utp-red-500 dark:to-utp-red-600 rounded-full mx-auto"
      )} />
    </div>
  )
}
