# Load environment variables from .env file
$envFilePath = "../.env"
if (Test-Path $envFilePath) {
    Get-Content $envFilePath | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Start the Pocketbase server with the specified HTTP address
$publicDbAddress = $env:PUBLIC_DB_ADDRESS
$httpPort = "8090"
Start-Process -NoNewWindow -File "./pocketbase" -ArgumentList "serve", "--http=${publicDbAddress}:$httpPort"
