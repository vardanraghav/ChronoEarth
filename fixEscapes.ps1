Get-ChildItem -Path "${PWD}\src" -Recurse -File -Include *.tsx,*.ts,*.js,*.jsx | ForEach-Object {
    $lines = Get-Content $_ -ErrorAction SilentlyContinue
    $content = $lines -join "`n"
    $content = $content -replace '\\u003e','>'
    $content = $content -replace '\\u003c','<'
    $content = $content -replace '\\u0022','"'
    Set-Content -Path $_ -Value $content
}
