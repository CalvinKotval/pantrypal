# Whimsical Pantry Local Server with Smart Dynamic Port & Receipt Diagnostic Logging

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $baseDir) { $baseDir = Get-Location }

# Ensure logs directory exists
$logsDir = Join-Path $baseDir "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

$mainLogFile = Join-Path $logsDir "receipt-scans.log"
$jsonLogFile = Join-Path $logsDir "receipt-scans.jsonl"
$latestScanFile = Join-Path $logsDir "latest-scan.json"
$learnedDictFile = Join-Path $logsDir "learned-dictionary.json"

# Auto-bind an available port (handles port 3000 conflicts automatically)
$preferredPorts = @(3001, 3002, 3003, 3004, 8080, 8081, 5000, 5001, 3000)
$listener = $null
$boundPort = 0
$url = ""

foreach ($p in $preferredPorts) {
    try {
        $tempListener = New-Object System.Net.HttpListener
        $testUrl = "http://localhost:$p/"
        $tempListener.Prefixes.Add($testUrl)
        $tempListener.Start()
        # Successfully bound!
        $listener = $tempListener
        $boundPort = $p
        $url = $testUrl
        break
    } catch {
        # Port busy or registered by another process, try next port
        if ($tempListener) {
            $tempListener.Close()
        }
    }
}

if (-not $listener) {
    Write-Host "Error: Could not bind any HTTP port. Please ensure you have permission to listen on localhost." -ForegroundColor Red
    pause
    exit 1
}

try {
    Write-Host "==========================================================" -ForegroundColor Yellow
    Write-Host "  Whimsical Pantry Tracker & Smart Recipe Cooker" -ForegroundColor Cyan
    Write-Host "  Web Server: $url" -ForegroundColor Green
    Write-Host "  Backend Logs: $mainLogFile" -ForegroundColor Magenta
    Write-Host "  Live scanner logs will stream here in real-time." -ForegroundColor Gray
    Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Yellow

    # Launch browser automatically
    Start-Process $url

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Add CORS Headers for local development flexibility
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        # Handle Preflight OPTIONS
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        $rawPath = $request.Url.LocalPath.TrimStart('/')

        # ---------------------------------------------------------
        # BACKEND API: POST /api/scan-log
        # Receives complete receipt OCR & parser diagnostics from UI
        # ---------------------------------------------------------
        if ($rawPath -eq "api/scan-log" -and $request.HttpMethod -eq "POST") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $bodyJson = $reader.ReadToEnd()
                $reader.Close()

                $scanData = $bodyJson | ConvertFrom-Json
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                $logId = "scan_" + [Guid]::NewGuid().ToString().Substring(0, 8)

                # Save raw JSON data for latest scan
                [System.IO.File]::WriteAllText($latestScanFile, $bodyJson, [System.Text.Encoding]::UTF8)

                # Append to JSONL log
                $jsonEntry = [PSCustomObject]@{
                    logId = $logId
                    timestamp = $timestamp
                    source = $scanData.source
                    itemCount = if ($scanData.items) { $scanData.items.Count } else { 0 }
                    skippedCount = if ($scanData.skipped) { $scanData.skipped.Count } else { 0 }
                    lineCount = if ($scanData.allLines) { $scanData.allLines.Count } else { 0 }
                    rawTextLength = if ($scanData.rawText) { $scanData.rawText.Length } else { 0 }
                } | ConvertTo-Json -Compress
                [System.IO.File]::AppendAllLines($jsonLogFile, @($jsonEntry), [System.Text.Encoding]::UTF8)

                # Append human-readable diagnostic log
                $logLines = [System.Collections.Generic.List[string]]::new()
                $logLines.Add("================================================================================")
                $logLines.Add("[$timestamp] RECEIPT SCAN LOG [$logId]")
                $logLines.Add("Source / Filename : " + $scanData.source)
                $logLines.Add("Total Lines Scanned : " + $(if ($scanData.allLines) { $scanData.allLines.Count } else { 0 }))
                $logLines.Add("Extracted Groceries : " + $(if ($scanData.items) { $scanData.items.Count } else { 0 }))
                $logLines.Add("Skipped / Noise Lines: " + $(if ($scanData.skipped) { $scanData.skipped.Count } else { 0 }))
                $logLines.Add("--------------------------------------------------------------------------------")
                $logLines.Add("EXTRACTED INGREDIENTS:")
                if ($scanData.items -and $scanData.items.Count -gt 0) {
                    foreach ($it in $scanData.items) {
                        $logLines.Add("  [ACCEPTED] $($it.emoji) $($it.name.PadRight(28)) | Qty: $($it.qty) $($it.unit.PadRight(6)) | Cat: $($it.category)")
                    }
                } else {
                    $logLines.Add("  (No items extracted)")
                }

                $logLines.Add("--------------------------------------------------------------------------------")
                $logLines.Add("LINE-BY-LINE AUDIT & DIAGNOSTICS:")
                if ($scanData.auditLines) {
                    foreach ($al in $scanData.auditLines) {
                        $statusPad = "[$($al.status)]".PadRight(24)
                        $logLines.Add("  $statusPad Line $($al.lineNum.ToString().PadLeft(2)): `"$($al.text)`"")
                        if ($al.reason) {
                            $logLines.Add("                          Reason: $($al.reason)")
                        }
                    }
                }

                $logLines.Add("--------------------------------------------------------------------------------")
                $logLines.Add("FULL RAW OCR TEXT:")
                if ($scanData.rawText) {
                    $logLines.Add($scanData.rawText)
                } else {
                    $logLines.Add("(No raw text provided)")
                }
                $logLines.Add("================================================================================`n")

                [System.IO.File]::AppendAllLines($mainLogFile, $logLines, [System.Text.Encoding]::UTF8)

                # Output pretty summary to PowerShell console
                Write-Host ""
                Write-Host "📄 [$timestamp] RECEIPT SCAN RECEIVED [$logId]" -ForegroundColor Cyan
                Write-Host "   Source: $($scanData.source)" -ForegroundColor Gray
                Write-Host "   Lines: $(if ($scanData.allLines) { $scanData.allLines.Count } else { 0 }) | Detected: $(if ($scanData.items) { $scanData.items.Count } else { 0 }) items | Skipped: $(if ($scanData.skipped) { $scanData.skipped.Count } else { 0 }) lines" -ForegroundColor Yellow
                
                if ($scanData.items) {
                    foreach ($it in $scanData.items) {
                        Write-Host "   [+] $($it.emoji) $($it.name) - $($it.qty) $($it.unit) ($($it.category))" -ForegroundColor Green
                    }
                }
                if ($scanData.skipped) {
                    $previewSkipped = $scanData.skipped | Select-Object -First 4
                    foreach ($sk in $previewSkipped) {
                        Write-Host "   [-] Skipped: `"$($sk.text)`" ($($sk.reason))" -ForegroundColor DarkGray
                    }
                    if ($scanData.skipped.Count -gt 4) {
                        Write-Host "   ... and $($scanData.skipped.Count - 4) more skipped lines in logs/receipt-scans.log" -ForegroundColor DarkGray
                    }
                }
                Write-Host "   Saved detailed log -> logs/receipt-scans.log" -ForegroundColor DarkCyan

                $respObj = @{
                    success = $true
                    logId = $logId
                    savedTo = "logs/receipt-scans.log"
                    itemCount = if ($scanData.items) { $scanData.items.Count } else { 0 }
                    skippedCount = if ($scanData.skipped) { $scanData.skipped.Count } else { 0 }
                } | ConvertTo-Json

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respObj)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
            }
            catch {
                Write-Host "Error logging scan: $_" -ForegroundColor Red
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":false,"error":"' + $_.Exception.Message + '"}')
                $response.StatusCode = 500
                $response.ContentType = "application/json"
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
            continue
        }

        # ---------------------------------------------------------
        # BACKEND API: GET /api/scan-logs
        # Returns the latest scan diagnostics for in-app viewer
        # ---------------------------------------------------------
        if ($rawPath -eq "api/scan-logs" -and $request.HttpMethod -eq "GET") {
            if (Test-Path $latestScanFile) {
                $bytes = [System.IO.File]::ReadAllBytes($latestScanFile)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $emptyResp = [System.Text.Encoding]::UTF8.GetBytes('{"status":"no_scans_yet"}')
                $response.ContentType = "application/json"
                $response.OutputStream.Write($emptyResp, 0, $emptyResp.Length)
            }
            $response.Close()
            continue
        }

        # ---------------------------------------------------------
        # BACKEND API: GET /api/learned-dictionary
        # Returns all user-taught item mappings
        # ---------------------------------------------------------
        if ($rawPath -eq "api/learned-dictionary" -and $request.HttpMethod -eq "GET") {
            if (Test-Path $learnedDictFile) {
                $bytes = [System.IO.File]::ReadAllBytes($learnedDictFile)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $emptyDict = [System.Text.Encoding]::UTF8.GetBytes('{}')
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $emptyDict.Length
                $response.OutputStream.Write($emptyDict, 0, $emptyDict.Length)
            }
            $response.Close()
            continue
        }

        # ---------------------------------------------------------
        # BACKEND API: POST /api/learned-dictionary
        # Saves or updates user-taught grocery classifications
        # ---------------------------------------------------------
        if ($rawPath -eq "api/learned-dictionary" -and $request.HttpMethod -eq "POST") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $bodyJson = $reader.ReadToEnd()
                $reader.Close()

                # Persist directly to disk
                [System.IO.File]::WriteAllText($learnedDictFile, $bodyJson, [System.Text.Encoding]::UTF8)
                
                $learnedObj = $bodyJson | ConvertFrom-Json
                $keysCount = ($learnedObj.PSObject.Properties | Measure-Object).Count
                Write-Host "🧠 [LEARNED MEMORY UPDATED] Stored $keysCount custom mappings -> logs/learned-dictionary.json" -ForegroundColor Green

                $respObj = @{ success = $true; count = $keysCount; file = "logs/learned-dictionary.json" } | ConvertTo-Json
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respObj)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
            } catch {
                Write-Host "Error saving learned dictionary: $_" -ForegroundColor Red
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":false,"error":"' + $_.Exception.Message + '"}')
                $response.StatusCode = 500
                $response.ContentType = "application/json"
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
            continue
        }

        # ---------------------------------------------------------
        # STATIC FILE SERVER
        # ---------------------------------------------------------
        if ([string]::IsNullOrWhiteSpace($rawPath)) {
            $rawPath = "index.html"
        }

        $filePath = Join-Path $baseDir $rawPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".log"  { "text/plain; charset=utf-8" }
                default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }

        $response.Close()
    }
}
catch {
    Write-Host "Server stopped or error occurred: $_" -ForegroundColor Red
}
finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
