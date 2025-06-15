
export default function generateOtp(length = 6): string {
  return Array.from({ length })
    .map(() => Math.floor(Math.random() * 10))
    .join("");
}
