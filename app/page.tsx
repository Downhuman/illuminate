import { Illuminate } from "@/components/illuminate"

/**
 * v2.6.0 - Bulk Deletion Feature for Admin Portal
 * ✓ Checkbox column added to responses table (far left)
 * ✓ Master checkbox in header for Select All/Deselect All (respects filters)
 * ✓ Individual checkboxes per row for granular selection
 * ✓ Delete Selected button (red, destructive styling) with dynamic counter
 * ✓ Bulk confirmation dialog with item count
 * ✓ Instant table refresh after bulk deletion with selected state cleared
 * ✓ Maintains existing company filter, search, and CSV export functionality
 */
export default function Page() {
  return <Illuminate />
}
