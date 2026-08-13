Add-Type -AssemblyName System.Drawing

$srcPath = "d:\Portfolio\Portfolio Website\Untitled-1.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $bmp.Width
$height = $bmp.Height

Write-Host "Image size: $width x $height"

# Let's inspect horizontal scan lines to find exact Y ranges of images.
# Work images generally have content (non-dark background) across X=50 to X=600 and X=700 to X=1300.
# Background color is dark purple / black (~ RGB 10, 5, 20 to RGB 30, 10, 40).

$yMap = @()
for ($y = 0; $y -lt $height; $y += 10) {
    # check average brightness or color at x=350 and x=1000
    $c1 = $bmp.GetPixel(350, $y)
    $c2 = $bmp.GetPixel(1000, $y)
    $avgR = ($c1.R + $c2.R) / 2
    $avgG = ($c1.G + $c2.G) / 2
    $avgB = ($c1.B + $c2.B) / 2
    
    # If not dark background
    if ($avgR -gt 50 -or $avgG -gt 50 -or $avgB -gt 50) {
        # Active content line
    }
}

$bmp.Dispose()
