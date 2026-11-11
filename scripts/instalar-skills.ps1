# =====================================================================
# PANEL PROVENTAS — Instala las skills de Antigravity (Windows / PowerShell)
# Ejecutar desde la RAÍZ del proyecto:   .\scripts\instalar-skills.ps1
# Requisitos: Node.js 18+ (npx) y Git. Para webapp-testing: Python 3 + Playwright.
# =====================================================================
$ErrorActionPreference = "Stop"
$env:DISABLE_TELEMETRY = "1"

function Instalar($repo, [string[]]$skills) {
    $npxArgs = @("-y", "skills@latest", "add", $repo)
    foreach ($s in $skills) { $npxArgs += @("--skill", $s) }
    $npxArgs += @("-a", "antigravity", "-y")
    Write-Host "`n>> $repo : $($skills -join ', ')" -ForegroundColor Cyan
    & npx @npxArgs
    if ($LASTEXITCODE -ne 0) { throw "Falló la instalación de $repo" }
}

# 1. Base de datos (Supabase oficial)
Instalar "supabase/agent-skills" @("supabase-postgres-best-practices", "supabase")

# 2. React + revisión de interfaz (Vercel oficial)
Instalar "vercel-labs/agent-skills" @("vercel-react-best-practices", "vercel-composition-patterns", "web-design-guidelines")

# 3. Componentes shadcn/ui (oficial)
Instalar "shadcn/ui" @("shadcn")

# 4. Diseño no genérico + pruebas en navegador (Anthropic oficial)
Instalar "anthropics/skills" @("frontend-design", "webapp-testing")

# 5. Verificación: dónde quedaron
Write-Host "`n== Skills instaladas ==" -ForegroundColor Green
foreach ($dir in @(".agents\skills", ".agent\skills")) {
    if (Test-Path $dir) {
        Write-Host "`n[$dir]"
        Get-ChildItem $dir -Directory | ForEach-Object {
            $ok = Test-Path (Join-Path $_.FullName "SKILL.md")
            Write-Host ("  {0,-40} {1}" -f $_.Name, $(if ($ok) { "OK" } else { "SIN SKILL.md" }))
        }
    }
}
Write-Host "`nSi aparecen en .agent\skills (singular), Antigravity también las lee; no es necesario moverlas."
Write-Host "Abre Antigravity, inicia una conversación nueva y pregunta: 'Lista las skills que tienes disponibles'."
