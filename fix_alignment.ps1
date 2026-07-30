Get-ChildItem -Path "lib" -Recurse -Include "*.dart" | ForEach-Object {
    $path = $_.FullName
    $content = Get-Content $path -Raw
    $updated = $content -replace 'crossAxisAlignment: CrossAlignment\.', 'crossAxisAlignment: CrossAxisAlignment.'
    $updated = $updated -replace 'crossAlignment: CrossAlignment\.', 'crossAxisAlignment: CrossAxisAlignment.'
    if ($content -ne $updated) {
        Set-Content $path -Value $updated -NoNewline
        Write-Host "Fixed: $($_.Name)"
    }
}
Write-Host "Done."
