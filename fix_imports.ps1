$files = Get-ChildItem -Path src/components/ui -Filter *.tsx -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace '@\d+(\.\d+)*', ''
    $newContent | Set-Content $file.FullName
}
