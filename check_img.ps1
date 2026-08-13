Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("d:\Portfolio\Portfolio Website\Untitled-1.jpg")
Write-Output "Untitled-1.jpg dimensions: $($img.Width) x $($img.Height)"
$img.Dispose()
