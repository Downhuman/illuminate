"use server"

import { sql } from "@/lib/db"

export type AccessCodeValidation = {
  valid: boolean
  error?: string
}

export async function validateAccessCode(code: string): Promise<AccessCodeValidation> {
  if (!code || code.trim() === "") {
    return { valid: false, error: "Access code is required" }
  }

  try {
    // Check if database connection is configured
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      return { valid: false, error: "Database connection not configured. Please contact support." }
    }

    const result = await sql`
      SELECT code, uses_count, total_limit 
      FROM access_codes 
      WHERE code = ${code.trim()}
    `

    if (result.length === 0) {
      return { valid: false, error: "Invalid access code" }
    }

    const accessCode = result[0]
    
    if (accessCode.uses_count >= accessCode.total_limit) {
      return { valid: false, error: "This access code has reached its usage limit" }
    }

    return { valid: true }
  } catch (error) {
    console.error("[validateAccessCode] Database error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { 
      valid: false, 
      error: `Database connection failed: ${errorMessage.includes("connection") ? "Unable to connect to database" : "Please try again"}` 
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
