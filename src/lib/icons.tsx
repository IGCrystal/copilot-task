/**
 * Mock: Icon components used in ActionBadge.
 * Simple SVG placeholders for preview.
 */

import React from "react";

function createIcon(pathD: string, displayName: string) {
  const Icon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={pathD} />
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

// Refresh / sync
export const ArrowRefreshIcon = createIcon(
  "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15",
  "ArrowRefreshIcon",
);

// Browser / Edge
export const EdgeIcon = createIcon(
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  "EdgeIcon",
);

// Cursor / click
export const CursorClickIcon = createIcon("M13 2L3 14h9l-1 8 10-12h-9l1-8z", "CursorClickIcon");

// Cloud / OneDrive
export const OnedriveIcon = createIcon(
  "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
  "OnedriveIcon",
);

// Mail / Outlook
export const OutlookIcon = createIcon(
  "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  "OutlookIcon",
);

// Calendar
export const GoogleCalendarIcon = createIcon(
  "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18",
  "GoogleCalendarIcon",
);

// Gmail
export const GoogleGmailIcon = createIcon(
  "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  "GoogleGmailIcon",
);

// Generic mail
export const EmailIcon = createIcon(
  "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  "EmailIcon",
);

// Search
export const SearchIcon = createIcon(
  "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35",
  "SearchIcon",
);

// Calendar / schedule
export const CalendarIcon = createIcon(
  "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18",
  "CalendarIcon",
);

// Send
export const SendEmailIcon = createIcon("M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z", "SendEmailIcon");
