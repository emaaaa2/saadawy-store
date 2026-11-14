/**
 * A search box value ready for a PostgREST filter: Arabic digits become 0–9 (so typing ٤٦٠١ finds
 * code 4601) and characters that would break the filter syntax are removed.
 */
export function searchTerm(value: unknown) {
  return toLatinDigits(value).replace(/[,()%*\\]/g, ' ').trim()
}
