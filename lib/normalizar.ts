export function normalizar(texto: string): string {
  return texto.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}
