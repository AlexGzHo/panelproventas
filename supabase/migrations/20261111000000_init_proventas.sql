-- =====================================================================
-- PANEL PROVENTAS — Migración inicial
-- Registro de ventas de suscripciones (Netflix, ChatGPT, Spotify, etc.)
-- Motor: Supabase (PostgreSQL 15+). Zona horaria de negocio: America/Lima
-- Moneda: PEN (S/). Importes en numeric(10,2).
--
-- Decisiones clave (ver docs/PRD.md y .agents/skills/proventas-dominio):
--   * Cada registro de "suscripciones" es UNA VENTA. Renovar = nueva fila
--     enlazada con renovacion_de. Así el historial queda completo.
--   * El historial no se borra: las ventas se ANULAN (con motivo).
--   * Precio y costo se copian del catálogo al vender (snapshot), para que
--     cambiar precios del catálogo no altere ingresos pasados.
--   * fecha_fin = fecha_inicio + duración del producto (vence ese mismo día).
--   * Ingresos de un mes = suma de precio_venta por fecha_venta, sin anuladas.
-- =====================================================================

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------
-- 0. Esquema privado para funciones auxiliares (no expuesto por la API)
-- ---------------------------------------------------------------------
create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;

-- ---------------------------------------------------------------------
-- 1. Perfiles (miembros del equipo). Registro público DESACTIVADO:
--    los usuarios se invitan desde el panel de Supabase.
-- ---------------------------------------------------------------------
create table public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null default '',
  rol        text not null default 'operador' check (rol in ('admin', 'operador')),
  creado_en  timestamptz not null default now()
);

create or replace function privado.es_miembro()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.perfiles where id = (select auth.uid()));
$$;

create or replace function privado.es_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'admin'
  );
$$;

revoke all on function privado.es_miembro() from public, anon;
revoke all on function privado.es_admin()   from public, anon;
grant execute on function privado.es_miembro() to authenticated;
grant execute on function privado.es_admin()   to authenticated;

-- Crea el perfil automáticamente cuando se invita/crea un usuario
create or replace function privado.crear_perfil()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function privado.crear_perfil();

-- Marca de actualización genérica
create or replace function privado.marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Catálogo: plataformas y productos
-- ---------------------------------------------------------------------
create table public.plataformas (
  id          bigint generated always as identity primary key,
  nombre      text not null unique check (length(trim(nombre)) > 0),
  color       text check (color ~ '^#[0-9A-Fa-f]{6}$'),   -- color del badge en la UI
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

create table public.productos (
  id              bigint generated always as identity primary key,
  plataforma_id   bigint not null references public.plataformas (id) on delete restrict,
  nombre          text not null check (length(trim(nombre)) > 0),
  tipo_cuenta     text not null default 'perfil'
                  check (tipo_cuenta in ('perfil', 'cuenta_completa', 'compartida', 'otro')),
  duracion_meses  smallint not null default 1 check (duracion_meses between 1 and 24),
  precio_venta    numeric(10,2) not null check (precio_venta >= 0),
  costo           numeric(10,2) not null default 0 check (costo >= 0),
  activo          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  unique (plataforma_id, nombre)          -- también sirve de índice para plataforma_id
);

create trigger productos_actualizado
  before update on public.productos
  for each row execute function privado.marcar_actualizado();

-- ---------------------------------------------------------------------
-- 3. Clientes
-- ---------------------------------------------------------------------
create table public.clientes (
  id              bigint generated always as identity primary key,
  nombre          text not null check (length(trim(nombre)) > 0),
  telefono        text,
  email           text,
  notas           text,
  creado_por      uuid default auth.uid() references auth.users (id) on delete set null,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

-- Búsqueda rápida por nombre parcial (combobox "buscar cliente")
create index clientes_nombre_trgm on public.clientes using gin (nombre extensions.gin_trgm_ops);
create index clientes_telefono_idx on public.clientes (telefono) where telefono is not null;

create trigger clientes_actualizado
  before update on public.clientes
  for each row execute function privado.marcar_actualizado();

-- ---------------------------------------------------------------------
-- 4. Suscripciones (= ventas)
-- ---------------------------------------------------------------------
create table public.suscripciones (
  id              bigint generated always as identity primary key,
  cliente_id      bigint not null references public.clientes (id)  on delete restrict,
  producto_id     bigint not null references public.productos (id) on delete restrict,
  fecha_venta     date not null default ((now() at time zone 'America/Lima')::date),
  fecha_inicio    date not null default ((now() at time zone 'America/Lima')::date),
  fecha_fin       date not null,              -- la completa el trigger si viene vacía
  precio_venta    numeric(10,2) not null check (precio_venta >= 0),  -- snapshot
  costo           numeric(10,2) not null check (costo >= 0),         -- snapshot
  metodo_pago     text check (metodo_pago in ('yape', 'plin', 'transferencia', 'efectivo', 'otro')),
  renovacion_de   bigint references public.suscripciones (id) on delete set null,
  notas           text,
  anulada         boolean not null default false,
  anulada_motivo  text,
  anulada_en      timestamptz,
  creado_por      uuid default auth.uid() references auth.users (id) on delete set null,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  constraint fechas_validas      check (fecha_fin > fecha_inicio),
  constraint anulacion_con_motivo check (not anulada or length(trim(coalesce(anulada_motivo, ''))) > 0)
);

create index suscripciones_cliente_idx    on public.suscripciones (cliente_id);
create index suscripciones_producto_idx   on public.suscripciones (producto_id);
create index suscripciones_renovacion_idx on public.suscripciones (renovacion_de) where renovacion_de is not null;
create index suscripciones_fecha_venta_idx on public.suscripciones (fecha_venta desc, id desc);
create index suscripciones_vencimiento_idx on public.suscripciones (fecha_fin) where not anulada;

-- Completa precio, costo y fecha_fin desde el catálogo (registro rápido)
create or replace function privado.completar_suscripcion()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  p record;
begin
  if tg_op = 'INSERT' then
    select precio_venta, costo, duracion_meses into p
    from public.productos where id = new.producto_id;

    if not found then
      raise exception 'El producto % no existe', new.producto_id;
    end if;

    new.precio_venta := coalesce(new.precio_venta, p.precio_venta);
    new.costo        := coalesce(new.costo, p.costo);
    new.fecha_fin    := coalesce(new.fecha_fin,
                          (new.fecha_inicio + make_interval(months => p.duracion_meses))::date);
  else
    new.actualizado_en := now();
    if new.anulada and not old.anulada then
      new.anulada_en := now();
    end if;
    if old.anulada and not new.anulada then
      raise exception 'Una venta anulada no se puede reactivar; registra una nueva.';
    end if;
  end if;
  return new;
end;
$$;

create trigger suscripciones_completar
  before insert or update on public.suscripciones
  for each row execute function privado.completar_suscripcion();

-- ---------------------------------------------------------------------
-- 5. Seguridad: RLS
--    Miembros: leen, crean y editan. Solo admin borra catálogo/clientes.
--    Las ventas NO se borran nunca (no hay política DELETE): se anulan.
-- ---------------------------------------------------------------------
alter table public.perfiles      enable row level security;
alter table public.plataformas   enable row level security;
alter table public.productos     enable row level security;
alter table public.clientes      enable row level security;
alter table public.suscripciones enable row level security;

revoke all on public.perfiles, public.plataformas, public.productos,
              public.clientes, public.suscripciones from anon;

-- perfiles
create policy "perfil propio o admin" on public.perfiles
  for select to authenticated
  using (id = (select auth.uid()) or (select privado.es_admin()));
create policy "admin gestiona perfiles" on public.perfiles
  for update to authenticated
  using ((select privado.es_admin())) with check ((select privado.es_admin()));

-- plataformas, productos, clientes (mismo patrón)
create policy "miembros leen plataformas"   on public.plataformas for select to authenticated using ((select privado.es_miembro()));
create policy "miembros crean plataformas"  on public.plataformas for insert to authenticated with check ((select privado.es_miembro()));
create policy "miembros editan plataformas" on public.plataformas for update to authenticated using ((select privado.es_miembro())) with check ((select privado.es_miembro()));
create policy "admin borra plataformas"     on public.plataformas for delete to authenticated using ((select privado.es_admin()));

create policy "miembros leen productos"   on public.productos for select to authenticated using ((select privado.es_miembro()));
create policy "miembros crean productos"  on public.productos for insert to authenticated with check ((select privado.es_miembro()));
create policy "miembros editan productos" on public.productos for update to authenticated using ((select privado.es_miembro())) with check ((select privado.es_miembro()));
create policy "admin borra productos"     on public.productos for delete to authenticated using ((select privado.es_admin()));

create policy "miembros leen clientes"   on public.clientes for select to authenticated using ((select privado.es_miembro()));
create policy "miembros crean clientes"  on public.clientes for insert to authenticated with check ((select privado.es_miembro()));
create policy "miembros editan clientes" on public.clientes for update to authenticated using ((select privado.es_miembro())) with check ((select privado.es_miembro()));
create policy "admin borra clientes"     on public.clientes for delete to authenticated using ((select privado.es_admin()));

-- suscripciones: sin DELETE
create policy "miembros leen ventas"   on public.suscripciones for select to authenticated using ((select privado.es_miembro()));
create policy "miembros crean ventas"  on public.suscripciones for insert to authenticated with check ((select privado.es_miembro()));
create policy "miembros editan ventas" on public.suscripciones for update to authenticated using ((select privado.es_miembro())) with check ((select privado.es_miembro()));

-- ---------------------------------------------------------------------
-- 6. Vistas de lectura (security_invoker: respetan RLS del usuario)
-- ---------------------------------------------------------------------

-- Historial enriquecido con estado calculado
create view public.v_suscripciones with (security_invoker = true) as
select
  s.id,
  s.fecha_venta,
  s.fecha_inicio,
  s.fecha_fin,
  s.precio_venta,
  s.costo,
  s.precio_venta - s.costo        as ganancia,
  s.metodo_pago,
  s.notas,
  s.renovacion_de,
  s.anulada,
  s.anulada_motivo,
  s.creado_en,
  c.id        as cliente_id,
  c.nombre    as cliente_nombre,
  c.telefono  as cliente_telefono,
  p.id        as producto_id,
  p.nombre    as producto_nombre,
  p.tipo_cuenta,
  pl.id       as plataforma_id,
  pl.nombre   as plataforma_nombre,
  pl.color    as plataforma_color,
  r.renovada,
  case
    when s.anulada                 then 'anulada'
    when r.renovada                then 'renovada'
    when s.fecha_fin <  d.hoy      then 'vencida'
    when s.fecha_fin <= d.hoy + 3  then 'por_vencer'
    else 'vigente'
  end                              as estado,
  s.fecha_fin - d.hoy              as dias_restantes
from public.suscripciones s
join public.clientes    c  on c.id  = s.cliente_id
join public.productos   p  on p.id  = s.producto_id
join public.plataformas pl on pl.id = p.plataforma_id
cross join lateral (select (now() at time zone 'America/Lima')::date as hoy) d
cross join lateral (
  select exists (
    select 1 from public.suscripciones x
    where x.renovacion_de = s.id and not x.anulada
  ) as renovada
) r;

-- Ingresos mes a mes, con meses sin ventas en 0 y comparación vs mes anterior
create view public.v_ingresos_mensuales with (security_invoker = true) as
with limites as (
  select date_trunc('month', min(fecha_venta))::date                            as desde,
         date_trunc('month', (now() at time zone 'America/Lima'))::date         as hasta
  from public.suscripciones
  where not anulada
),
meses as (
  select generate_series(desde, hasta, interval '1 month')::date as mes
  from limites
  where desde is not null
),
agregado as (
  select date_trunc('month', fecha_venta)::date as mes,
         count(*)                               as ventas,
         sum(precio_venta)                      as ingresos,
         sum(costo)                             as costos
  from public.suscripciones
  where not anulada
  group by 1
),
serie as (
  select m.mes,
         coalesce(a.ventas, 0)       as ventas,
         coalesce(a.ingresos, 0)     as ingresos,
         coalesce(a.costos, 0)       as costos
  from meses m
  left join agregado a using (mes)
)
select
  mes,
  ventas,
  ingresos,
  costos,
  ingresos - costos                                            as ganancia,
  lag(ingresos) over (order by mes)                            as ingresos_mes_anterior,
  lag(ventas)   over (order by mes)                            as ventas_mes_anterior,
  ingresos - lag(ingresos) over (order by mes)                 as diferencia,
  round(100.0 * (ingresos - lag(ingresos) over (order by mes))
        / nullif(lag(ingresos) over (order by mes), 0), 1)     as variacion_pct
from serie;

-- Ingresos por plataforma y mes (para gráfico apilado / ranking)
create view public.v_ingresos_plataforma_mes with (security_invoker = true) as
select
  date_trunc('month', s.fecha_venta)::date as mes,
  pl.id                                    as plataforma_id,
  pl.nombre                                as plataforma_nombre,
  pl.color                                 as plataforma_color,
  count(*)                                 as ventas,
  sum(s.precio_venta)                      as ingresos,
  sum(s.precio_venta - s.costo)            as ganancia
from public.suscripciones s
join public.productos   p  on p.id  = s.producto_id
join public.plataformas pl on pl.id = p.plataforma_id
where not s.anulada
group by 1, 2, 3, 4;

revoke all on public.v_suscripciones, public.v_ingresos_mensuales,
              public.v_ingresos_plataforma_mes from anon;
grant select on public.v_suscripciones, public.v_ingresos_mensuales,
                public.v_ingresos_plataforma_mes to authenticated;
