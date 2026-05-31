# Set console output encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "              Eazo App Auto-Starter" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Detect Package Manager (Bun is preferred, npm is fallback)
$runner = "bun"
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "[INFO] Bun is not detected in PATH. Checking for npm..." -ForegroundColor Yellow
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] Neither Bun nor npm was found in your PATH!" -ForegroundColor Red
        Write-Host "Please install Bun (https://bun.sh) or Node.js (https://nodejs.org)." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        Exit
    }
    $runner = "npm"
}
Write-Host "[✓] Using package manager: $runner" -ForegroundColor Green

# 2. Check .env file
if (-not (Test-Path .env)) {
    Write-Host "[WARNING] .env file not found!" -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Write-Host "Copying .env.example to .env ..." -ForegroundColor Cyan
        Copy-Item .env.example .env
        Write-Host "[!] Please update your .env file with your database and API secrets!" -ForegroundColor Yellow
    } else {
        Write-Host "[ERROR] .env.example also not found. Cannot configure environment." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        Exit
    }
} else {
    Write-Host "[✓] .env file found." -ForegroundColor Green
}

# 3. Install dependencies
if (-not (Test-Path node_modules)) {
    Write-Host "[INFO] node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    if ($runner -eq "bun") {
        bun install
    } else {
        npm install
    }
} else {
    Write-Host "[✓] node_modules found. Checking/updating dependencies..." -ForegroundColor Green
    if ($runner -eq "bun") {
        bun install
    } else {
        npm install
    }
}

# 4. Database migrations
Write-Host "[INFO] Checking database configuration..." -ForegroundColor Yellow
if (-not (Test-Path src/lib/db/migrations)) {
    Write-Host "[INFO] Generating database migration files..." -ForegroundColor Yellow
    if ($runner -eq "bun") {
        bun run db:generate
    } else {
        npm run db:generate
    }
}

Write-Host "[INFO] Running database migrations..." -ForegroundColor Yellow
if ($runner -eq "bun") {
    bun run db:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Database migration failed. Attempting schema push..." -ForegroundColor Yellow
        bun run db:push
    }
} else {
    try {
        npm run db:migrate
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[WARNING] Database migration failed. Attempting schema push..." -ForegroundColor Yellow
            npm run db:push
        }
    } catch {
        Write-Host "[WARNING] Database migration failed. Attempting schema push..." -ForegroundColor Yellow
        npm run db:push
    }
}

# 5. Start Dev Server
Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "[✓] Setup completed! Starting Next.js Dev Server..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

if ($runner -eq "bun") {
    bun run dev
} else {
    npm run dev
}
