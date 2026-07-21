export const COMMON_TIMEZONES = [
  { value: "Asia/Karachi", label: "(GMT+5:00) Pakistan Time (Asia/Karachi)" },
  { value: "America/New_York", label: "(GMT-5:00) Eastern Time (America/New_York)" },
  { value: "America/Chicago", label: "(GMT-6:00) Central Time (America/Chicago)" },
  { value: "America/Denver", label: "(GMT-7:00) Mountain Time (America/Denver)" },
  { value: "America/Los_Angeles", label: "(GMT-8:00) Pacific Time (America/Los_Angeles)" },
  { value: "Europe/London", label: "(GMT+0:00) London / UK Time (Europe/London)" },
  { value: "Europe/Paris", label: "(GMT+1:00) Central European Time (Europe/Paris)" },
  { value: "Europe/Berlin", label: "(GMT+1:00) Berlin (Europe/Berlin)" },
  { value: "Asia/Dubai", label: "(GMT+4:00) Gulf Standard Time (Asia/Dubai)" },
  { value: "Asia/Riyadh", label: "(GMT+3:00) Arabia Standard Time (Asia/Riyadh)" },
  { value: "Asia/Kolkata", label: "(GMT+5:30) India Standard Time (Asia/Kolkata)" },
  { value: "Asia/Dhaka", label: "(GMT+6:00) Bangladesh Time (Asia/Dhaka)" },
  { value: "Asia/Singapore", label: "(GMT+8:00) Singapore Time (Asia/Singapore)" },
  { value: "Asia/Tokyo", label: "(GMT+9:00) Japan Standard Time (Asia/Tokyo)" },
  { value: "Australia/Sydney", label: "(GMT+11:00) Australian Eastern Time (Australia/Sydney)" },
  { value: "UTC", label: "(GMT+0:00) Coordinated Universal Time (UTC)" }
];

export const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
  Pakistan: "Asia/Karachi",
  "United States": "America/New_York",
  USA: "America/New_York",
  "United Kingdom": "Europe/London",
  UK: "Europe/London",
  Canada: "America/Toronto",
  Australia: "Australia/Sydney",
  "United Arab Emirates": "Asia/Dubai",
  UAE: "Asia/Dubai",
  "Saudi Arabia": "Asia/Riyadh",
  India: "Asia/Kolkata",
  Bangladesh: "Asia/Dhaka",
  Germany: "Europe/Berlin",
  France: "Europe/Paris",
  Turkey: "Europe/Istanbul",
  Japan: "Asia/Tokyo",
  China: "Asia/Shanghai",
  Brazil: "America/Sao_Paulo",
  "South Africa": "Africa/Johannesburg",
  Singapore: "Asia/Singapore",
  Malaysia: "Asia/Kuala_Lumpur",
  Qatar: "Asia/Qatar"
};

export function getTimezoneForCountry(country?: string): string {
  if (!country) return detectUserTimezone();
  const normalized = country.trim();
  if (COUNTRY_TIMEZONE_MAP[normalized]) {
    return COUNTRY_TIMEZONE_MAP[normalized];
  }
  return detectUserTimezone();
}

export function detectUserTimezone(): string {
  try {
    if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    }
  } catch {
    // fallback
  }
  return "UTC";
}
