-- Los modos difuminado/rompecabezas pasan a ser válidos también en el enunciado.
-- Se mantiene la regla de que solo las imágenes pueden tener un modo distinto de normal.
alter table public.elementos drop constraint if exists elementos_check2;
alter table public.elementos drop constraint if exists elementos_check;

do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.elementos'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%recompensa%'
      and pg_get_constraintdef(oid) like '%modo%'
  loop
    execute format('alter table public.elementos drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.elementos
  add constraint elementos_modo_solo_imagen check (modo = 'normal' or tipo = 'imagen');
