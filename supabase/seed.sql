-- =====================================================================
-- PANEL PROVENTAS — Datos iniciales del catálogo
-- Precios y costos de EJEMPLO en soles (S/). Edítalos desde la pantalla
-- Catálogo antes de empezar a vender.
-- =====================================================================

insert into public.plataformas (nombre, color) values
  ('Netflix',         '#E50914'),
  ('ChatGPT',         '#10A37F'),
  ('Spotify',         '#1DB954'),
  ('Disney+',         '#113CCF'),
  ('Max',             '#002BE7'),
  ('Prime Video',     '#00A8E1'),
  ('YouTube Premium', '#FF0000'),
  ('Canva',           '#00C4CC')
on conflict (nombre) do nothing;

insert into public.productos (plataforma_id, nombre, tipo_cuenta, duracion_meses, precio_venta, costo)
select pl.id, v.nombre, v.tipo_cuenta, v.duracion_meses, v.precio_venta, v.costo
from (values
  ('Netflix',         'Perfil 1 mes',            'perfil',          1, 15.00,  9.00),
  ('Netflix',         'Cuenta completa 1 mes',   'cuenta_completa', 1, 45.00, 35.00),
  ('ChatGPT',         'Plus compartido 1 mes',   'compartida',      1, 25.00, 15.00),
  ('ChatGPT',         'Plus cuenta propia 1 mes','cuenta_completa', 1, 75.00, 65.00),
  ('Spotify',         'Premium 1 mes',           'perfil',          1, 10.00,  5.00),
  ('Spotify',         'Premium 3 meses',         'perfil',          3, 27.00, 15.00),
  ('Disney+',         'Perfil 1 mes',            'perfil',          1, 12.00,  7.00),
  ('Max',             'Perfil 1 mes',            'perfil',          1, 12.00,  7.00),
  ('Prime Video',     'Perfil 1 mes',            'perfil',          1, 10.00,  6.00),
  ('YouTube Premium', 'Familiar 1 mes',          'compartida',      1, 10.00,  6.00),
  ('Canva',           'Pro 1 mes',               'compartida',      1,  8.00,  3.00)
) as v(plataforma, nombre, tipo_cuenta, duracion_meses, precio_venta, costo)
join public.plataformas pl on pl.nombre = v.plataforma
on conflict (plataforma_id, nombre) do nothing;

-- Después de invitar a tu usuario desde Supabase (Authentication > Users),
-- conviértelo en administrador (cambia el correo):
-- update public.perfiles set rol = 'admin'
-- where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
