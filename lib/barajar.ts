export function estaResuelto(orden: number[]): boolean {
  return orden.every((v, i) => v === i);
}

export function barajar(n: number): number[] {
  const orden = Array.from({ length: Math.max(n, 0) }, (_, i) => i);
  if (n < 2) return orden;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  if (estaResuelto(orden)) orden.push(orden.shift()!);
  return orden;
}
