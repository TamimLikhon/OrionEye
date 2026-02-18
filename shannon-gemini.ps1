# Shannon-Gemini CLI (PowerShell)

param (
    [string]$Command,
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$ScriptArgs
)

$ErrorActionPreference = "Stop"

# Load .env if present
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$COMPOSE_FILE = "docker-compose.yml"

function Start-Shannon {
    param (
        [string]$Url,
        [string]$Repo
    )

    if (-not $Url -or -not $Repo) {
        Write-Error "Usage: .\shannon-gemini.ps1 start URL=<url> REPO=<name>"
        exit 1
    }

    Write-Host "Starting Shannon-Gemini services..." -ForegroundColor Cyan
    docker compose -f $COMPOSE_FILE up -d --build

    Write-Host "Waiting for worker to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5 # Simple wait, better to check health

    Write-Host "Submitting workflow..." -ForegroundColor Cyan
    # Execute client inside the running worker container
    # Note: Using docker exec to run the client script inside the container context
    docker compose -f $COMPOSE_FILE exec -T worker node dist/temporal/client.js "$Url" "$Repo"
}

function Stop-Shannon {
    docker compose -f $COMPOSE_FILE down
}

# Main logic
if ($Command -eq "start") {
    $Url = ""
    $Repo = ""
    foreach ($arg in $ScriptArgs) {
        if ($arg -match "^URL=(.*)") { $Url = $matches[1] }
        if ($arg -match "^REPO=(.*)") { $Repo = $matches[1] }
    }
    Start-Shannon -Url $Url -Repo $Repo
}
elseif ($Command -eq "stop") {
    Stop-Shannon
}
else {
    Write-Host "Usage: .\shannon-gemini.ps1 {start|stop} [URL=...] [REPO=...]"
}
