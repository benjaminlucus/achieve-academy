export type AvailabilitySlot = { day: string; time?: string[]; startTime?: string; endTime?: string; active?: boolean };

export function availabilityTimes(slot: AvailabilitySlot): string[] {
  if (Array.isArray(slot.time) && slot.time.length > 0) return slot.time.filter(Boolean);
  if (slot.active === false) return [];
  return [slot.startTime, slot.endTime].filter((value): value is string => Boolean(value));
}

export function availabilityToLegacySlots(slots: AvailabilitySlot[] = []) {
  return slots.map(slot => ({ day: slot.day, time: availabilityTimes(slot) }));
}
