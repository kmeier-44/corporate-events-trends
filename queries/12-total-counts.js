// ============================================================
// Total Counts — For badge numbers and coverage stats
// ============================================================
// SOURCE: MongoDB — bookings + bookinglines collections
// UPDATED: 27 March 2026 — added booking-level counts

// ── Booking-level counts (from bookings collection) ────────

db.bookings.countDocuments({})
// All bookings (enquiries): TBD

db.bookings.countDocuments({ status: "won" })
// Won bookings: TBD

db.bookings.countDocuments({
  "companyData._id": { $exists: true },
  status: { $ne: "void" }
})
// Corporate non-void bookings (backfill scope): 36,398

// ── Booking line counts (from bookinglines collection) ─────
// BLs are venue-specific lines — one booking contacting 3 venues = 3 BLs.
// These counts are useful for venue-level analysis (shopping, conversion).

db.bookinglines.countDocuments({})
// All BLs: 1,011,543

db.bookinglines.countDocuments({ venueId: { $type: "int" } })
// BLs with venueId (int): 926,677

db.bookinglines.countDocuments({ status: "won", venueId: { $type: "int" } })
// Won BLs with venueId: TBD

// ── Badge text ─────────────────────────────────────────────
// Current badge text: "120,000+ real enquiries"
// This should reflect unique bookings (enquiries), not venue lines.
// Re-run booking-level counts above to determine accurate badge number.
