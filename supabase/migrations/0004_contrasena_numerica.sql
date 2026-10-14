-- Tipo de contraseña de un puzzle: numérica (el jugador ve una casilla por dígito) o alfanumérica.
-- `longitud_clave` se calcula sola y es lo único que se expone al jugador: la contraseña nunca sale del servidor.
alter table public.puzzles add column if not exists clave_numerica boolean not null default false;

alter table public.puzzles
  add column if not exists longitud_clave integer
  generated always as (char_length(btrim(contrasena))) stored;
