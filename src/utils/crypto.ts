/**
 * Calcule le hachage SHA‑256 d'une chaîne donnée via l'API Web Crypto.
 * Utile pour stocker un mot de passe localement de manière pédagogique.
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}