"use server"

import { sql, dbConfigured } from "@/lib/db"

export type AccessCodeValidation = {
  valid: boolean
  error?: string
}

export async function validateAccessCode(code: string): Promise<AccessCodeValidation> {
  if (!code || code.trim() === "") {
    return { valid: false, error: "Access code is required" }
  }

  // Check if database is configured before attempting query
  if (!dbConfigured) {
    return { 
      valid: false, 
      error: "ERROR: POSTGRES_URL environment variable is not set. Please configure the database connection." 
    }
  }

  try {
    const result = await sql`
      SELECT code, uses_count, total_limit 
      FROM access_codes 
      WHERE code = ${code.trim()}
    `

    if (result.length === 0) {
      return { valid: false, error: "Invalid access code. Please check your code and try again." }
    }

    const accessCode = result[0]
    
    if (accessCode.uses_count >= accessCode.total_limit) {
      return { valid: false, error: "This access code has reached its usage limit. Please contact support." }
    }

    return { valid: true }
  } catch (error) {
    // Detailed error logging and user-friendly message
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[validateAccessCode] Database error:", errorMessage)
    
    // Return specific error details so the user can see what went wrong
    if (errorMessage.includes("POSTGRES_URL")) {
      return { valid: false, error: "Database not configured: POSTGRES_URL is missing" }
    }
    if (errorMessage.includes("connection") || errorMessage.includes("ECONNREFUSED")) {
      return { valid: false, error: "Cannot connect to database. Please check POSTGRES_URL configuration." }
    }
    if (errorMessage.includes("does not exist")) {
      return { valid: false, error: "Database table 'access_codes' not found. Please run migrations." }
    }
    
    return { 
      valid: false, 
      error: `Database error: ${errorMessage.substring(0, 100)}` 
    }
  }
}

export type SaveResponseResult = {
  success: boolean
  error?: string
}

export async function saveResponse(data: {
  name: string
  email: string
  company: string
  accessCode: string
  generatorScore: number
  reflectorScore: number
  connectorScore: number
  ignitorScore: number
}): Promise<SaveResponseResult> {
  try {
    // First, increment the uses_count for the access code
    await sql`
      UPDATE access_codes 
      SET uses_count = uses_count + 1 
      WHERE code = ${data.accessCode}
    `

    // Then save the response
    await sql`
      INSERT INTO responses (
        name, 
        email, 
        company, 
        access_code, 
        generator_score, 
        reflector_score, 
        connector_score, 
        ignitor_score,
        created_at
      ) VALUES (
        ${data.name},
        ${data.email},
        ${data.company},
        ${data.accessCode},
        ${data.generatorScore},
        ${data.reflectorScore},
        ${data.connectorScore},
        ${data.ignitorScore},
        NOW()
      )
    `

    return { success: true }
  } catch (error) {
    console.error("Error saving response:", error)
    return { success: false, error: "Failed to save your results. Please try again." }
  }
}

export type Response = {
  id: number
  name: string
  email: string
  company: string
  access_code: string
  generator_score: number
  reflector_score: number
  connector_score: number
  ignitor_score: number
  created_at: string
}

export async function getResponses(): Promise<{ responses: Response[]; error?: string }> {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        email,
        company,
        access_code,
        generator_score,
        reflector_score,
        connector_score,
        ignitor_score,
        created_at
      FROM responses 
      ORDER BY created_at DESC
    `

    return { responses: result as Response[] }
  } catch (error) {
    console.error("Error fetching responses:", error)
    return { responses: [], error: "Failed to fetch responses" }
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD
}

// Access Code Management Types
export type AccessCode = {
  id: number
  code: string
  uses_count: number
  total_limit: number
  created_at: string
}

export async function getAccessCodes(): Promise<{ codes: AccessCode[]; error?: string }> {
  if (!dbConfigured) {
    return { codes: [], error: "Database not configured: POSTGRES_URL is missing" }
  }

  try {
    const result = await sql`
      SELECT 
        id,
        code,
        uses_count,
        total_limit,
        created_at
      FROM access_codes 
      ORDER BY created_at DESC
    `

    return { codes: result as AccessCode[] }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[getAccessCodes] Database error:", errorMessage)
    return { codes: [], error: `Failed to fetch access codes: ${errorMessage.substring(0, 100)}` }
  }
}

export async function createAccessCode(
  code: string,
  totalLimit: number
): Promise<{ success: boolean; error?: string }> {
  if (!dbConfigured) {
    return { success: false, error: "Database not configured: POSTGRES_URL is missing" }
  }

  if (!code || code.trim() === "") {
    return { success: false, error: "Access code is required" }
  }

  if (!totalLimit || totalLimit < 1) {
    return { success: false, error: "Usage limit must be at least 1" }
  }

  try {
    // Check if code already exists
    const existing = await sql`
      SELECT id FROM access_codes WHERE code = ${code.trim().toUpperCase()}
    `

    if (existing.length > 0) {
      return { success: false, error: "This access code already exists" }
    }

    await sql`
      INSERT INTO access_codes (code, uses_count, total_limit, created_at)
      VALUES (${code.trim().toUpperCase()}, 0, ${totalLimit}, NOW())
    `

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[createAccessCode] Database error:", errorMessage)
    return { success: false, error: `Failed to create access code: ${errorMessage.substring(0, 100)}` }
  }
}
