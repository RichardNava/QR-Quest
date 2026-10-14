-- Minijuego generado automáticamente (opcional) de un puzzle.
-- Solo se guarda la «receta»: {"tipo": ..., "nivel": ..., "semilla": ...}. El tablero se recalcula
-- de forma determinista. Las políticas RLS de `puzzles` ya cubren la columna.
alter table public.puzzles add column if not exists minijuego jsonb;

alter table public.puzzles
  add constraint puzzles_minijuego_valido check (
    minijuego is null or (
      minijuego ->> 'tipo' in ('rushhour', 'lightsout', 'mastermind', 'sudoku', 'laberinto')
      and minijuego ->> 'nivel' in ('facil', 'medio', 'dificil')
      and jsonb_typeof(minijuego -> 'semilla') = 'number'
    )
  );
