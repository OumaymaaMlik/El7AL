export type DetectedFile = { mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'; ext: string };

const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  buffer.length >= offset + bytes.length && bytes.every((byte, i) => buffer[offset + i] === byte);

/**
 * What a file really is, read from its first bytes. The type a client declares is not trusted:
 * anyone can send "image/png" with any content.
 */
export function detectFile(buffer: Buffer): DetectedFile | null {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', ext: '.jpg' };
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', ext: '.png' };
  // WebP: "RIFF" + 4 size bytes + "WEBP"
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { mime: 'image/webp', ext: '.webp' };
  }
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { mime: 'application/pdf', ext: '.pdf' };
  return null;
}
