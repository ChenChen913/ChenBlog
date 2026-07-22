# WeChat Cover HTML/CSS Layout Template

Use this structure when the user requests a code-based layout solution.

## Requirements
- **Ratio**: 3.35:1 (Overall), 2.35:1 (Main), 1:1 (Share).
- **Typography**: Dominant (70% space).
- **Responsive**: Tailwind CSS via CDN.

## Template Code

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WeChat Cover Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        body { font-family: 'Noto Sans SC', sans-serif; }
        .cover-container {
            aspect-ratio: 3.35 / 1;
            width: 100%;
            max-width: 1200px;
            display: flex;
            background-color: {{BackgroundColor}}; /* e.g., #f3f4f6 */
            color: {{TextColor}}; /* e.g., #1f2937 */
        }
        .main-cover {
            flex: 2.35;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: {{Align}}; /* center or flex-start */
            padding: 2rem;
        }
        .share-cover {
            flex: 1;
            aspect-ratio: 1 / 1;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-left: 1px solid rgba(0,0,0,0.1);
        }
        /* Style Specific Classes */
        /* Refer to references/tailwind-styles.md for values */
    </style>
</head>
<body class="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">

    <div id="capture" class="cover-container shadow-2xl rounded-lg overflow-hidden">
        <!-- Main Cover (2.35:1) -->
        <div class="main-cover {{StyleClasses}}">
            <!-- {{StyleClasses}} should come from references/tailwind-styles.md -->
            <h1 class="text-6xl font-black tracking-tight leading-tight">
                {{MainTitle}}
            </h1>
            <!-- Optional Decoration -->
            <div class="absolute top-0 right-0 p-4 opacity-50">
                <!-- Icon or Shape -->
            </div>
        </div>

        <!-- Share Cover (1:1) -->
        <div class="share-cover {{StyleClasses}}">
            <div class="text-4xl font-bold">{{ShareTextTop}}</div>
            <div class="text-4xl font-bold">{{ShareTextBottom}}</div>
        </div>
    </div>

    <button onclick="downloadImage()" class="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
        Download Cover
    </button>

    <script>
        function downloadImage() {
            html2canvas(document.getElementById('capture')).then(canvas => {
                const link = document.createElement('a');
                link.download = 'wechat-cover.png';
                link.href = canvas.toDataURL();
                link.click();
            });
        }
    </script>
</body>
</html>
```
