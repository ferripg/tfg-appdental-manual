-- =============================================================================
-- Dades de DEMO per a la clínica dental (manual)
-- NIFs/CIFs amb checksum REAL vàlid (passen la validació MAN-15).
-- Executar:  Get-Content prisma\seed-demo.sql | docker exec -i denta-postgres psql -U appdental -d appdental
-- =============================================================================

BEGIN;

-- --- Tipus de despesa ---
INSERT INTO "TipusDespesa" (id, codi, descripcio, deduible, grup, concepte, "esAmortitzable", actiu, "createdAt", "updatedAt") VALUES
  ('demo-td-mat',   'MAT',   'Material dental fungible',            true, 6, 'Consumibles clínics (guants, anestèsia, fresas...)', false, true, NOW(), NOW()),
  ('demo-td-llog',  'LLOG',  'Lloguer del local',                  true, 6, 'Lloguer mensual de la consulta',                     false, true, NOW(), NOW()),
  ('demo-td-subm',  'SUBM',  'Subministraments',                   true, 6, 'Llum, aigua, internet',                              false, true, NOW(), NOW()),
  ('demo-td-equip', 'EQUIP', 'Equipament i mobiliari',             true, 2, 'Béns d''inversió amortitzables',                     true,  true, NOW(), NOW()),
  ('demo-td-net',   'NET',   'Neteja i desinfecció',               true, 6, 'Productes de neteja i esterilització',               false, true, NOW(), NOW()),
  ('demo-td-form',  'FORM',  'Formació i congressos',              true, 6, 'Cursos i formació continuada',                       false, true, NOW(), NOW()),
  ('demo-td-asseg', 'ASSEG', 'Assegurances',                       true, 6, 'Responsabilitat civil i del local',                  false, true, NOW(), NOW()),
  ('demo-td-gest',  'GEST',  'Serveis professionals',              true, 6, 'Gestoria i assessorament',                           false, true, NOW(), NOW())
ON CONFLICT (codi) DO NOTHING;

-- --- Proveïdors (NIF/CIF amb checksum vàlid) ---
INSERT INTO "Proveidor" (id, nif, nom, actiu, adreca, "codiPostal", poblacio, email, telefon, "personaContacte", iban, "createdAt", "updatedAt") VALUES
  ('demo-prov-001', 'B12345674', 'Dental Ibérica SL',        true, 'C/ Indústria 45',     '08025', 'Barcelona',  'comandes@dentaliberica.es', '934567890', 'Marta Solé',   NULL, NOW(), NOW()),
  ('demo-prov-002', 'A23456783', 'Henry Schein España SA',   true, 'Av. Europa 12',       '28100', 'Madrid',     'info@henryschein.es',       '911234567', 'Carlos Ruiz',  NULL, NOW(), NOW()),
  ('demo-prov-003', 'B11111119', 'Dentaltix SL',             true, 'Pol. Ind. Sud 8',     '46980', 'València',    'suport@dentaltix.com',      '961112233', NULL,           NULL, NOW(), NOW()),
  ('demo-prov-004', 'B87654323', 'Proclínic Subministres SL',true, 'C/ Major 102',        '17001', 'Girona',     'girona@proclinic.es',       '972445566', 'Anna Vidal',   NULL, NOW(), NOW()),
  ('demo-prov-005', 'A87654323', 'Proveïments Mèdics SA',    true, 'C/ Rambla Nova 30',   '43003', 'Tarragona',  'comercial@provmedics.es',   '977889900', NULL,           NULL, NOW(), NOW()),
  ('demo-prov-006', '12345678Z', 'Joan Martí (manteniment)', true, 'C/ Sant Pere 7',      '17002', 'Girona',     'joanmarti@gmail.com',       '600112233', NULL,           NULL, NOW(), NOW())
ON CONFLICT (nif) DO NOTHING;

-- --- Despeses (variades, repartides 2025-2026) ---
INSERT INTO "Despesa" (id, "dataFactura", "dataPagament", import, "numFactura", descripcio, "tipusDespesaId", "proveidorId", "userId", "createdAt", "updatedAt") VALUES
  ('demo-desp-01', '2025-01-10', '2025-01-15', 1200.00, 'LLOG-2025-01', 'Lloguer gener',                      'demo-td-llog',  NULL,            'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-02', '2025-01-22', '2025-02-01',  452.30, 'DI-2025-0042', 'Material dental (fresas, anestèsia)', 'demo-td-mat',   'demo-prov-001', 'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-03', '2025-02-05', NULL,           230.75, 'ENDESA-0215',  'Factura llum febrer',                'demo-td-subm',  NULL,            'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-04', '2025-02-10', '2025-02-10', 12000.00,'HS-2025-1188', 'Cadira dental KaVo (amortitzable)',  'demo-td-equip', 'demo-prov-002', 'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-05', '2025-02-18', '2025-03-01',  315.00, 'DTX-99213',    'Guants i mascaretes (caixa gran)',   'demo-td-mat',   'demo-prov-003', 'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-06', '2025-03-01', '2025-03-15', 1200.00, 'LLOG-2025-03', 'Lloguer març',                       'demo-td-llog',  NULL,            'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-07', '2025-03-12', '2025-03-12', 3500.00, 'PC-2025-0571', 'Autoclau esterilitzador (amortitzable)','demo-td-equip','demo-prov-004', 'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-08', '2025-03-20', '2025-04-01',  185.40, 'PM-2025-0304', 'Productes desinfecció superfícies',  'demo-td-net',   'demo-prov-005', 'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-09', '2025-04-08', NULL,           600.00, 'SEPA-2025-12', 'Curs endodòncia avançada',           'demo-td-form',  NULL,            'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-10', '2025-04-15', '2025-04-20',  150.00, 'GEST-2025-04', 'Gestoria abril',                     'demo-td-gest',  NULL,            'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-11', '2025-05-02', '2025-05-02',  820.00, 'MAPF-2025-01', 'Assegurança RC anual',               'demo-td-asseg', NULL,            'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-12', '2025-05-19', '2025-06-01',  398.90, 'DI-2025-0388', 'Material dental (compòsits)',        'demo-td-mat',   'demo-prov-001', 'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-13', '2025-06-10', NULL,           245.10, 'AGBAR-0610',   'Factura aigua 2n trimestre',         'demo-td-subm',  NULL,            'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-14', '2025-09-14', '2025-09-14',  890.00, 'HS-2025-2299', 'Instrumental rotatori',              'demo-td-mat',   'demo-prov-002', 'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW()),
  ('demo-desp-15', '2026-01-12', '2026-01-18', 1250.00, 'LLOG-2026-01', 'Lloguer gener 2026',                 'demo-td-llog',  NULL,            'jnCQbtlP1v85xY0cGOzBivktmxmImhQB', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Resum
SELECT 'Proveidor' AS taula, COUNT(*) FROM "Proveidor"
UNION ALL SELECT 'TipusDespesa', COUNT(*) FROM "TipusDespesa"
UNION ALL SELECT 'Despesa', COUNT(*) FROM "Despesa";
