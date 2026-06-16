Get-ChildItem -Path "${PWD}/src" -Recurse -Include *.tsx,*.ts,*.js,*.jsx | ForEach-Object {
    $content = Get-Content $_ -Raw
    $content = $content -replace '\\u003e','>'
    $content = $content -replace '\\u003c','<'
    $content = $content -replace '\\u0022','"'
    Set-Content $_ -Value $content
}
