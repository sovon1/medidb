'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Pill, 
  Building2, 
  Package, 
  ChevronRight,
  Activity,
  FileText,
  AlertTriangle,
  Heart,
  Shield,
  Clock,
  Info,
  X
} from 'lucide-react'

interface Medicine {
  id: number
  brandName: string
  type: string
  slug: string
  dosageForm: string
  generic: string
  strength: string
  manufacturer: string
  packageContainer: string | null
  packageSize: string | null
}

interface Generic {
  id: number
  name: string
  drugClass: string | null
  indication: string | null
  indicationDescription: string | null
  pharmacologyDescription: string | null
  dosageDescription: string | null
  sideEffectsDescription: string | null
  contraindicationsDescription: string | null
  precautionsDescription: string | null
  pregnancyLactationDescription: string | null
  storageConditionsDescription: string | null
}

interface MedicineDetail {
  medicine: Medicine
  generic: Generic | null
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const searchMedicines = useCallback(async (searchQuery: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(searchQuery)}&limit=50`)
      const data = await res.json()
      setMedicines(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    searchTimeout.current = setTimeout(() => {
      searchMedicines(query)
    }, 300)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [query, searchMedicines])

  const fetchMedicineDetail = async (id: number) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/medicines/${id}`)
      const data = await res.json()
      setSelectedMedicine(data)
    } catch (error) {
      console.error('Failed to fetch details:', error)
    } finally {
      setDetailLoading(false)
    }
  }

  const truncateText = (text: string | null, maxLength: number = 300) => {
    if (!text) return null
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">MedViewer</h1>
                <p className="text-xs text-slate-500">21,700+ medicines</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search medicines, generics, manufacturers..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-11 pr-10 h-11 bg-slate-100/50 border-0 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all rounded-xl text-sm"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-6 border-amber-200 bg-amber-50/90 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900">Informational use only</p>
              <p className="text-sm leading-6 text-amber-800">
                This database is for informational purposes and should not replace advice from a licensed doctor or pharmacist.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Medicine List */}
          <div className="lg:col-span-5" ref={listRef}>
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {loading ? 'Searching...' : `${medicines.length} Results`}
                  </CardTitle>
                  {query && (
                    <Badge variant="secondary" className="font-normal text-xs bg-emerald-50 text-emerald-700 border-0">
                      "{query}"
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50">
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : medicines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Pill className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">No medicines found</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {medicines.map((medicine) => (
                        <button
                          key={medicine.id}
                          onClick={() => fetchMedicineDetail(medicine.id)}
                          className={`w-full text-left p-4 hover:bg-slate-50 transition-all duration-200 group ${
                            selectedMedicine?.medicine.id === medicine.id 
                              ? 'bg-emerald-50/80 border-l-2 border-emerald-500' 
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedMedicine?.medicine.id === medicine.id
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                            }`}>
                              <Pill className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-slate-900 truncate">{medicine.brandName}</h3>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-slate-200 text-slate-500 shrink-0">
                                  {medicine.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{medicine.generic}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {medicine.dosageForm}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate">{medicine.strength}</span>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform group-hover:translate-x-0.5 ${
                              selectedMedicine?.medicine.id === medicine.id ? 'text-emerald-500' : ''
                            }`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Medicine Detail */}
          <div className="lg:col-span-7">
            {detailLoading ? (
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="space-y-3 mt-6">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : selectedMedicine ? (
              <div className="space-y-4">
                {/* Header Card */}
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-white/20 text-white border-0 text-xs">
                            {selectedMedicine.medicine.type}
                          </Badge>
                          <Badge className="bg-white/20 text-white border-0 text-xs">
                            {selectedMedicine.medicine.dosageForm}
                          </Badge>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{selectedMedicine.medicine.brandName}</h2>
                        <p className="text-emerald-100">{selectedMedicine.medicine.generic}</p>
                        <p className="text-sm text-emerald-200 mt-1">{selectedMedicine.medicine.strength}</p>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Pill className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-0 shadow-lg shadow-slate-200/30 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Manufacturer</p>
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">
                            {selectedMedicine.medicine.manufacturer}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg shadow-slate-200/30 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Package</p>
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">
                            {selectedMedicine.medicine.packageSize || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Generic Information */}
                {selectedMedicine.generic && (
                  <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Drug Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedMedicine.generic.drugClass && (
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 shrink-0">
                            Class
                          </Badge>
                          <p className="text-sm text-slate-600">{selectedMedicine.generic.drugClass}</p>
                        </div>
                      )}
                      {selectedMedicine.generic.indication && (
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-0 shrink-0">
                            Indication
                          </Badge>
                          <p className="text-sm text-slate-600">{selectedMedicine.generic.indication}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Detailed Information */}
                {selectedMedicine.generic && (
                  <div className="space-y-3">
                    {selectedMedicine.generic.pharmacologyDescription && (
                      <InfoCard
                        icon={<FileText className="w-4 h-4" />}
                        title="Pharmacology"
                        content={selectedMedicine.generic.pharmacologyDescription}
                        color="blue"
                      />
                    )}
                    {selectedMedicine.generic.dosageDescription && (
                      <InfoCard
                        icon={<Clock className="w-4 h-4" />}
                        title="Dosage"
                        content={selectedMedicine.generic.dosageDescription}
                        color="emerald"
                      />
                    )}
                    {selectedMedicine.generic.sideEffectsDescription && (
                      <InfoCard
                        icon={<AlertTriangle className="w-4 h-4" />}
                        title="Side Effects"
                        content={selectedMedicine.generic.sideEffectsDescription}
                        color="amber"
                      />
                    )}
                    {selectedMedicine.generic.contraindicationsDescription && (
                      <InfoCard
                        icon={<Shield className="w-4 h-4" />}
                        title="Contraindications"
                        content={selectedMedicine.generic.contraindicationsDescription}
                        color="red"
                      />
                    )}
                    {selectedMedicine.generic.pregnancyLactationDescription && (
                      <InfoCard
                        icon={<Heart className="w-4 h-4" />}
                        title="Pregnancy & Lactation"
                        content={selectedMedicine.generic.pregnancyLactationDescription}
                        color="pink"
                      />
                    )}
                    {selectedMedicine.generic.precautionsDescription && (
                      <InfoCard
                        icon={<Shield className="w-4 h-4" />}
                        title="Precautions"
                        content={selectedMedicine.generic.precautionsDescription}
                        color="purple"
                      />
                    )}
                    {selectedMedicine.generic.storageConditionsDescription && (
                      <InfoCard
                        icon={<Package className="w-4 h-4" />}
                        title="Storage"
                        content={selectedMedicine.generic.storageConditionsDescription}
                        color="slate"
                      />
                    )}
                  </div>
                )}

                {/* No Generic Info */}
                {selectedMedicine && !selectedMedicine.generic && (
                  <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12">
                      <div className="text-center text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No detailed information available</p>
                        <p className="text-xs mt-1">for this medicine</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm h-[calc(100vh-220px)] flex items-center justify-center">
                <CardContent className="text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                    <Pill className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700 mb-1">Select a Medicine</h3>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto">
                    Choose a medicine from the list to view detailed information about its usage, dosage, and side effects.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Info Card Component
function InfoCard({ 
  icon, 
  title, 
  content, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  content: string
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'pink' | 'purple' | 'slate'
}) {
  const [expanded, setExpanded] = useState(false)
  
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    pink: 'bg-pink-50 text-pink-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-100 text-slate-600',
  }

  const maxLength = 200
  const shouldTruncate = content.length > maxLength
  const displayContent = expanded ? content : (shouldTruncate ? content.substring(0, maxLength) + '...' : content)

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/30 bg-white/80 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-slate-900 mb-1">{title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{displayContent}</p>
            {shouldTruncate && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-emerald-600 hover:text-emerald-700 mt-2 font-medium"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
