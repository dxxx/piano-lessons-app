# Starts the Piano Lessons remote-lock switch (tools/remote-lock-server.py) at every login, hidden,
# restarted if it stops. Run once as the normal user (no admin needed):
#   powershell -NoProfile -ExecutionPolicy Bypass -File E:\Home-Apps\piano-player\tools\install-remote-lock-task.ps1
# Remove: Unregister-ScheduledTask PianoRemoteLock -Confirm:$false
$py = (Get-Command python.exe).Source
$script = Join-Path $PSScriptRoot 'remote-lock-server.py'
$a = New-ScheduledTaskAction -Execute 'C:\Windows\System32\conhost.exe' -Argument "--headless `"$py`" -I `"$script`" --port 47902"
$t = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$s = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 99 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable
Register-ScheduledTask -TaskName PianoRemoteLock -Action $a -Trigger $t -Settings $s -Force -Description 'Piano Lessons remote lock switch (LAN :47902). State: E:\Home-Apps\_staging\remote-lock\state.json' | Out-Null
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object { $_.CommandLine -like '*remote-lock-server.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Start-ScheduledTask PianoRemoteLock
Start-Sleep 3
try { Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:47902/ping' | Out-Null; "Switch answers" }
catch { if ($_.Exception.Response) { "Switch answers (task PianoRemoteLock installed)" } else { "Switch NOT answering: $_" } }
