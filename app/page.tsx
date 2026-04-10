import { Illuminate } from "@/components/illuminate"

/**
 * v2.2.0 - PDF Perfection Overhaul
 * ✓ Completely rebuilt PDF layout with ranked preferences (highest score first)
 * ✓ New split-row design: 30% left (name+image) | 70% right (score+full descriptor)
 * ✓ Full-width pressure boxes with exact "BE MINDFUL" statements per spec
 * ✓ Auto-height text containers (no clipping/truncation)
 * ✓ All headers teal regardless of score
 * ✓ Century Gothic throughout, 40px logo, exact master descriptors
 * ✓ Automatic page break when content exceeds page height
 */
export default function Page() {
  return <Illuminate />
}
