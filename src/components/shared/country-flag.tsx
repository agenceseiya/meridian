import { COUNTRIES } from "@/lib/utils/constants";

interface CountryFlagProps {
  code: string | null | undefined;
  showName?: boolean;
}

export function CountryFlag({ code, showName = false }: CountryFlagProps) {
  const country = code ? COUNTRIES[code as keyof typeof COUNTRIES] : null;

  if (!country) {
    return showName ? (
      <span className="text-[#94a3b8]">Unknown</span>
    ) : null;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span>{country.flag}</span>
      {showName && <span className="text-sm">{country.name}</span>}
    </span>
  );
}
