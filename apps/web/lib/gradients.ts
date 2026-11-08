// Deterministic warm gradient per id (used for thumbnail blocks without artwork).
const THUMB_GRADIENTS = [
  "from-[#FFE3D3] via-[#FFD0BC] to-[#FFB89E]",
  "from-[#DFF0FA] via-[#C9E2F4] to-[#A9CDE9]",
  "from-[#DFF7F4] via-[#C3EEE9] to-[#9FE0D7]",
  "from-[#FFF3C9] via-[#FFE8A3] to-[#FFD97A]",
  "from-[#F3E8FF] via-[#E5D4FB] to-[#D2B8F5]",
];

export function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return THUMB_GRADIENTS[hash % THUMB_GRADIENTS.length];
}
