param(
  [int]$Port = 8000,
  [string]$Bind = '127.0.0.1'
)

try {
  $cmd = if (Get-Command py -ErrorAction SilentlyContinue) { 'py' } else { 'python' }
  Write-Output "Using $cmd"
  $args = "-m http.server $Port --bind $Bind"
  $p = Start-Process -FilePath $cmd -ArgumentList $args -WorkingDirectory $PSScriptRoot -PassThru
  Set-Content -Path (Join-Path $PSScriptRoot '.server_pid') -Value $p.Id -Encoding ascii
  Write-Output ("Started {0} on http://{1}:{2} (PID={3})" -f $cmd, $Bind, $Port, $p.Id)
} catch {
  Write-Error $_
  exit 1
}
