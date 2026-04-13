import { Illuminate } from "@/components/illuminate"

/**
 * v2.4.0 - HTML-Based PDF Layout Fix
 * ✓ Converted from jsPDF direct drawing to HTML-based PDF using html2pdf
 * ✓ Fixed table structure: 20% left (image) | 80% right (header + descriptor)
 * ✓ Fixed greeting bar text wrapping with inline styles (no orphan words)
 * ✓ Teal pressure bars as full-width HTML divs
 * ✓ Black background maintained, hero banner with fade effect
 * ✓ Montserrat 11pt descriptors with 1.4 line-height, master content untruncated
 */
export default function Page() {
  return <Illuminate />
}
