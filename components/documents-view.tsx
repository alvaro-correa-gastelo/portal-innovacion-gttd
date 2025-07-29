"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye, Search, Calendar, File, ImageIcon, Archive, Filter, X } from "lucide-react"

export default function DocumentsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProject, setSelectedProject] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  const documents = [
    {
      id: 1,
      name: "Resumen de Usuario - Sistema de Inventarios",
      type: "PDF",
      size: "245 KB",
      date: "28/07/2025",
      project: "Sistema de Gestión de Inventarios",
      status: "Disponible",
      category: "Resumen",
      icon: FileText,
    },
    {
      id: 2,
      name: "Informe de Evaluación Técnica",
      type: "PDF",
      size: "1.2 MB",
      date: "27/07/2025",
      project: "Sistema de Gestión de Inventarios",
      status: "Disponible",
      category: "Evaluación",
      icon: FileText,
    },
    {
      id: 3,
      name: "Plan de Implementación",
      type: "PDF",
      size: "890 KB",
      date: "26/07/2025",
      project: "Dashboard BI",
      status: "Disponible",
      category: "Planificación",
      icon: FileText,
    },
    {
      id: 4,
      name: "Especificaciones Técnicas",
      type: "DOCX",
      size: "456 KB",
      date: "25/07/2025",
      project: "Sistema de Reportes",
      status: "En Proceso",
      category: "Especificaciones",
      icon: File,
    },
    {
      id: 5,
      name: "Mockups de Interfaz",
      type: "ZIP",
      size: "3.4 MB",
      date: "24/07/2025",
      project: "Dashboard BI",
      status: "Disponible",
      category: "Diseño",
      icon: Archive,
    },
    {
      id: 6,
      name: "Diagrama de Arquitectura",
      type: "PNG",
      size: "678 KB",
      date: "23/07/2025",
      project: "Sistema de Gestión de Inventarios",
      status: "Disponible",
      category: "Arquitectura",
      icon: ImageIcon,
    },
    {
      id: 7,
      name: "Manual de Usuario",
      type: "PDF",
      size: "2.1 MB",
      date: "22/07/2025",
      project: "Sistema de Reportes",
      status: "Disponible",
      category: "Documentación",
      icon: FileText,
    },
    {
      id: 8,
      name: "Código Fuente",
      type: "ZIP",
      size: "15.3 MB",
      date: "21/07/2025",
      project: "Dashboard BI",
      status: "En Proceso",
      category: "Desarrollo",
      icon: Archive,
    },
  ]

  // Get unique values for filters
  const projects = [...new Set(documents.map((doc) => doc.project))]
  const categories = [...new Set(documents.map((doc) => doc.category))]
  const statuses = [...new Set(documents.map((doc) => doc.status))]
  const types = [...new Set(documents.map((doc) => doc.type))]

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.project.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesProject = selectedProject === "all" || doc.project === selectedProject
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus
    const matchesType = selectedType === "all" || doc.type === selectedType

    return matchesSearch && matchesProject && matchesCategory && matchesStatus && matchesType
  })

  const clearFilters = () => {
    setSelectedProject("all")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSelectedType("all")
    setSearchQuery("")
  }

  const activeFiltersCount = [selectedProject, selectedCategory, selectedStatus, selectedType].filter(
    (f) => f !== "all",
  ).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponible":
        return "bg-green-600/20 text-green-300"
      case "En Proceso":
        return "bg-yellow-600/20 text-yellow-300"
      case "Pendiente":
        return "bg-gray-600/20 text-gray-300"
      default:
        return "bg-gray-600/20 text-gray-300"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Resumen":
        return "bg-blue-600/20 text-blue-300"
      case "Evaluación":
        return "bg-purple-600/20 text-purple-300"
      case "Planificación":
        return "bg-green-600/20 text-green-300"
      case "Especificaciones":
        return "bg-orange-600/20 text-orange-300"
      case "Diseño":
        return "bg-pink-600/20 text-pink-300"
      case "Arquitectura":
        return "bg-indigo-600/20 text-indigo-300"
      case "Documentación":
        return "bg-cyan-600/20 text-cyan-300"
      case "Desarrollo":
        return "bg-red-600/20 text-red-300"
      default:
        return "bg-gray-600/20 text-gray-300"
    }
  }

  const stats = {
    total: documents.length,
    available: documents.filter((d) => d.status === "Disponible").length,
    inProcess: documents.filter((d) => d.status === "En Proceso").length,
    totalSize: "28.2 MB",
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mis Documentos</h1>
            <p className="text-muted-foreground">Accede a todos los documentos de tus proyectos</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Descargar Todo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Disponibles</p>
                  <p className="text-2xl font-bold">{stats.available}</p>
                </div>
                <Download className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En Proceso</p>
                  <p className="text-2xl font-bold">{stats.inProcess}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tamaño Total</p>
                  <p className="text-2xl font-bold">{stats.totalSize}</p>
                </div>
                <Archive className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>

              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas las solicitudes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las solicitudes</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(activeFiltersCount > 0 || searchQuery) && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="bg-transparent">
                  <X className="h-4 w-4 mr-2" />
                  Limpiar ({activeFiltersCount + (searchQuery ? 1 : 0)})
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedProject !== "all" && (
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                    Proyecto: {selectedProject}
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                    Categoría: {selectedCategory}
                  </Badge>
                )}
                {selectedStatus !== "all" && (
                  <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                    Estado: {selectedStatus}
                  </Badge>
                )}
                {selectedType !== "all" && (
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                    Tipo: {selectedType}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredDocuments.length} de {documents.length} documentos
          </p>
          <Tabs defaultValue="grid">
            <TabsList>
              <TabsTrigger value="grid">Vista de Cuadrícula</TabsTrigger>
              <TabsTrigger value="list">Vista de Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent rounded-lg">
                    <document.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate mb-2">{document.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 truncate">{document.project}</p>

                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className={getCategoryColor(document.category)}>
                        {document.category}
                      </Badge>
                      <Badge variant="secondary" className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>
                        {document.type} • {document.size}
                      </span>
                      <span>{document.date}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        disabled={document.status !== "Disponible"}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        disabled={document.status !== "Disponible"}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron documentos</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || activeFiltersCount > 0
                  ? "Intenta ajustar los filtros o términos de búsqueda"
                  : "No hay documentos disponibles"}
              </p>
              {(searchQuery || activeFiltersCount > 0) && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
