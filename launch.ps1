Write-Host 'STARTING: PHAN MEM 4T'

# Get the IP address
$IP = (Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Select-Object -First 1).NextHop

# Update the .env file
(Get-Content .env) -replace '.*PUBLIC_DB_ADDRESS.*', "PUBLIC_DB_ADDRESS=$IP" | Set-Content .env

Write-Host 'IP ADDRESS HAS BEEN SET UP'

# Start npm in the background
Start-Job -ScriptBlock {
    npm run dev -- --host --port=4444
}

# Change directory and start the database
Set-Location pocketbase_linux
Start-Job -ScriptBlock {
    .\launchDB.ps1
}

# Wait for all background jobs to complete
Get-Job | Wait-Job
