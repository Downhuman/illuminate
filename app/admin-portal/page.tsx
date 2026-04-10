"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Lock, Download, Search, LogOut, Loader2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { verifyAdminPassword, getResponses, type Response } from "@/app/actions"

const ITEMS_PER_PAGE = 20

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof Response>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const isValid = await verifyAdminPassword(password)

    if (isValid) {
      setIsAuthenticated(true)
      fetchResponses()
    } else {
      setError("Invalid password")
    }
    setIsLoading(false)
  }

  const fetchResponses = async () => {
    const result = await getResponses()
    if (result.error) {
      setError(result.error)
    } else {
      setResponses(result.responses)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
    setResponses([])
  }

  const handleSort = (field: keyof Response) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const filteredAndSortedResponses = useMemo(() => {
    let filtered = responses.filter((response) => {
      const query = searchQuery.toLowerCase()
      return (
        response.name?.toLowerCase().includes(query) ||
        response.email?.toLowerCase().includes(query) ||
        response.company?.toLowerCase().includes(query) ||
        response.access_code?.toLowerCase().includes(query)
      )
    })

    filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      let comparison = 0
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }
      
      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [responses, searchQuery, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedResponses.length / ITEMS_PER_PAGE)
  const paginatedResponses = filteredAndSortedResponses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Company",
      "Access Code",
      "Generator Score",
      "Reflector Score",
      "Connector Score",
      "Ignitor Score",
      "Created At",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredAndSortedResponses.map((r) =>
        [
          r.id,
          `"${(r.name || "").replace(/"/g, '""')}"`,
          `"${(r.email || "").replace(/"/g, '""')}"`,
          `"${(r.company || "").replace(/"/g, '""')}"`,
          `"${(r.access_code || "").replace(/"/g, '""')}"`,
          r.generator_score,
          r.reflector_score,
          r.connector_score,
          r.ignitor_score,
          r.created_at ? new Date(r.created_at).toISOString() : "",
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `illuminate-responses-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="w-full max-w-md border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-[#01A0B6]/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-[#01A0B6]" />
              </div>
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
              <p className="text-muted-foreground text-sm">
                Enter your admin password to access the dashboard
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background"
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full bg-[#01A0B6] hover:bg-[#01A0B6]/90 text-black font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Illuminate Admin Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedResponses.length} responses
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-border"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, company, or access code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Button
            onClick={exportToCSV}
            disabled={filteredAndSortedResponses.length === 0}
            className="bg-[#01A0B6] hover:bg-[#01A0B6]/90 text-black font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Email
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("company")}
                  >
                    <div className="flex items-center gap-2">
                      Company
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("access_code")}
                  >
                    <div className="flex items-center gap-2">
                      Code
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="text-[#01A0B6]">Gen</span>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="text-[#15CBD9]">Ref</span>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="text-[#B2BFC5]">Con</span>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="text-[#D10980]">Ign</span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {paginatedResponses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-12 text-muted-foreground"
                      >
                        {searchQuery
                          ? "No responses match your search"
                          : "No responses yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedResponses.map((response, index) => (
                      <motion.tr
                        key={response.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-border hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {response.name || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {response.email || "-"}
                        </TableCell>
                        <TableCell>{response.company || "-"}</TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {response.access_code || "-"}
                          </code>
                        </TableCell>
                        <TableCell className="text-center font-mono text-[#01A0B6]">
                          {response.generator_score}
                        </TableCell>
                        <TableCell className="text-center font-mono text-[#15CBD9]">
                          {response.reflector_score}
                        </TableCell>
                        <TableCell className="text-center font-mono text-[#B2BFC5]">
                          {response.connector_score}
                        </TableCell>
                        <TableCell className="text-center font-mono text-[#D10980]">
                          {response.ignitor_score}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(response.created_at)}
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedResponses.length)} of{" "}
              {filteredAndSortedResponses.length} responses
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-border"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
