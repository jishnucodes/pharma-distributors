/** Maps free-text dosage forms (from the catalogue) to an icon family. */
export type DoseKind = "tablet" | "capsule" | "bottle" | "vial" | "tube";

export function doseKind(dosageForm: string): DoseKind {
  const f = dosageForm.toLowerCase();
  if (/capsule|\bcap\b/.test(f)) return "capsule";
  if (/syrup|suspension|liquid|solution|drops|elixir|oral/.test(f)) return "bottle";
  if (/inject|vial|ampoule|\binj\b|infusion/.test(f)) return "vial";
  if (/cream|ointment|gel|lotion/.test(f)) return "tube";
  return "tablet";
}
