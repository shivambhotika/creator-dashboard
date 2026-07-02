export interface SheetSource {
  id: string;
  name: string;
  agency: string;
  spreadsheetId: string;
  gid?: string;
  /** Columns that must be present in the header row for the schema to be valid. */
  requiredColumns?: string[];
}

export const SHEET_SOURCES: SheetSource[] = [
  {
    id: "finnet",
    name: "Finnet Campaign Master Tracker",
    agency: "Finnet",
    spreadsheetId: "1f0dAHqqkIv3MiRyKUxrJ7UsXDNOwWyQ7wp8M9_M0hG0",
  },
  {
    id: "wldd-june-old",
    name: "Wispr x WLDD June 2026 (old)",
    agency: "Social Tag",
    spreadsheetId: "1-il4V8YW8Fob3NMogIm1db7PvBR4PsfAKGXoShWe5N8",
  },
  {
    id: "mastered-data",
    name: "Camp India Mastered Data",
    agency: "Multiple",
    spreadsheetId: "14n9hSSi9J48KvBT4fpliWC-0GAu0hER5",
    gid: "857053967",
    requiredColumns: ["Creator", "Agency", "Platform", "Views", "Clicks"],
  },
  {
    id: "wldd-master",
    name: "WLDD Master Sheet",
    agency: "WLDD",
    spreadsheetId: "1TcE0qcDlrh1l8MKbAGTtDAzsxCytBo1MHYqDp3taPmg",
    gid: "1977255002",
    requiredColumns: ["#", "Username", "Platform", "Video Status", "UTM Links", "Live Link", "Clicks", "Downloads", "Creator Cost"],
  },
];
