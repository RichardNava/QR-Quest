-- QR Quest v0: esquema inicial
create extension if not exists pgcrypto;

create table public.aventuras (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null check (length(trim(nombre)) > 0),
  creada_en timestamptz not null default now()
);

create table public.puzzles (
  id uuid primary key default gen_random_uuid(),
  aventura_id uuid not null references public.aventuras(id) on delete cascade,
  posicion integer not null,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  titulo text,
  contrasena text not null default ''
);

create table public.elementos (
  id uuid primary key default gen_random_uuid(),
  puzzle_id uuid not null references public.puzzles(id) on delete cascade,
  parte text not null check (parte in ('enunciado', 'recompensa')),
  posicion integer not null,
  tipo text not null check (tipo in ('texto', 'imagen')),
  texto text,
  ruta_imagen text,
  modo text not null default 'normal' check (modo in ('normal', 'difuminado', 'rompecabezas')),
  check (tipo <> 'texto' or texto is not null),
  check (tipo <> 'imagen' or ruta_imagen is not null),
  check (modo = 'normal' or (parte = 'recompensa' and tipo = 'imagen'))
);

create index on public.puzzles (aventura_id, posicion);
create index on public.elementos (puzzle_id, parte, posicion);

-- El token se genera al crear y no se puede modificar nunca
create function public.impedir_cambio_token() returns trigger
language plpgsql as $$
begin
  if new.token is distinct from old.token then
    raise exception 'El código de un puzzle no se puede modificar';
  end if;
  return new;
end $$;

create trigger puzzles_token_inmutable
  before update on public.puzzles
  for each row execute function public.impedir_cambio_token();

-- Máximo 40 imágenes por aventura
create function public.limitar_imagenes() returns trigger
language plpgsql as $$
declare
  total integer;
begin
  if new.tipo = 'imagen' then
    select count(*) into total
    from public.elementos e
    join public.puzzles p on p.id = e.puzzle_id
    where e.tipo = 'imagen'
      and e.id <> new.id
      and p.aventura_id = (select aventura_id from public.puzzles where id = new.puzzle_id);
    if total >= 40 then
      raise exception 'Máximo 40 imágenes por aventura';
    end if;
  end if;
  return new;
end $$;

create trigger elementos_limite_imagenes
  before insert or update of tipo on public.elementos
  for each row execute function public.limitar_imagenes();

-- Seguridad: RLS solo para el master dueño; sin políticas para anónimos
alter table public.aventuras enable row level security;
alter table public.puzzles enable row level security;
alter table public.elementos enable row level security;

create policy aventuras_master on public.aventuras
  for all to authenticated
  using (master_id = auth.uid()) with check (master_id = auth.uid());

create policy puzzles_master on public.puzzles
  for all to authenticated
  using (exists (select 1 from public.aventuras a where a.id = aventura_id and a.master_id = auth.uid()))
  with check (exists (select 1 from public.aventuras a where a.id = aventura_id and a.master_id = auth.uid()));

create policy elementos_master on public.elementos
  for all to authenticated
  using (exists (
    select 1 from public.puzzles p join public.aventuras a on a.id = p.aventura_id
    where p.id = puzzle_id and a.master_id = auth.uid()))
  with check (exists (
    select 1 from public.puzzles p join public.aventuras a on a.id = p.aventura_id
    where p.id = puzzle_id and a.master_id = auth.uid()));

-- Almacén privado de imágenes (4 MB, solo imágenes)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagenes', 'imagenes', false, 4194304, array['image/*'])
on conflict (id) do nothing;

create policy imagenes_master_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'imagenes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy imagenes_master_select on storage.objects
  for select to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy imagenes_master_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] = auth.uid()::text);
