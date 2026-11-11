#!/usr/bin/env bash
# =====================================================================
# PANEL PROVENTAS — Instala las skills de Antigravity (macOS / Linux / Git Bash)
# Ejecutar desde la RAÍZ del proyecto:   bash scripts/instalar-skills.sh
# Requisitos: Node.js 18+ (npx) y Git. Para webapp-testing: Python 3 + Playwright.
# =====================================================================
set -euo pipefail
export DISABLE_TELEMETRY=1

instalar() {
  local repo="$1"; shift
  local flags=()
  for s in "$@"; do flags+=(--skill "$s"); done
  echo -e "\n>> $repo : $*"
  npx -y skills@latest add "$repo" "${flags[@]}" -a antigravity -y
}

instalar supabase/agent-skills   supabase-postgres-best-practices supabase
instalar vercel-labs/agent-skills vercel-react-best-practices vercel-composition-patterns web-design-guidelines
instalar shadcn/ui               shadcn
instalar anthropics/skills       frontend-design webapp-testing

echo -e "\n== Skills instaladas =="
for dir in .agents/skills .agent/skills; do
  [ -d "$dir" ] || continue
  echo -e "\n[$dir]"
  for d in "$dir"/*/; do
    name=$(basename "$d")
    [ -f "$d/SKILL.md" ] && echo "  $name  OK" || echo "  $name  SIN SKILL.md"
  done
done
echo -e "\nAbre Antigravity, inicia una conversación nueva y pregunta: 'Lista las skills que tienes disponibles'."
