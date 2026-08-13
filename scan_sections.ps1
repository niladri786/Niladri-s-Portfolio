Add-Type -AssemblyName System.Drawing

$srcPath = "d:\Portfolio\Portfolio Website\Untitled-1.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $bmp.Width
$height = $bmp.Height

# We will sample every 5 pixels vertically down X=350 (left column) and X=1000 (right column)
# and find contiguous blocks of non-black/non-dark pixels.

$inBlock = $false
$blockStart = 0
$blocks = @()

for ($y = 0; $y -lt $height; $y += 2) {
    # Check pixels across X=100 to X=1200
    $hasColor = $false
    for ($x = 100; $x -lt 1250; $x += 100) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check if pixel is distinctly non-black (R>45 or G>45 or B>45)
        if ($pixel.R -gt 45 -or $pixel.G -gt 45 -or $pixel.B -gt 45) {
            $hasColor = $true
            break
        }
    }

    if ($hasColor -and -not $inBlock) {
        $inBlock = $true
        $blockStart = $y
    } elseif (-not $hasColor -and $inBlock) {
        $inBlock = $false
        $blockH = $y - $blockStart
        if ($blockH -gt 40) { # filter small noise
            $blocks += [PSCustomObject]@{ Y = $blockStart; H = $blockH; EndY = $y }
        }
    }
}

$bmp.Dispose()

Write-Host "Found $($blocks.Count) blocks:"
$blocks | Format-Table -AutoSize
