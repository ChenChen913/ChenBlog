# WeChat Cover Isometric Layout Template (HTML/CSS)

Use this structure when the user requests a "Code-based" or "Isometric" layout solution.

## Requirements
- **Ratio**: 3.35:1 (Overall), 2.35:1 (Main), 1:1 (Share).
- **Style**: CSS-drawn Isometric shapes (Cubes, Bubbles).
- **Responsive**: Tailwind CSS via CDN.

## Template Code

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WeChat Cover: {{PageTitle}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        body { font-family: 'Noto Sans SC', sans-serif; }
        .cover-container {
            aspect-ratio: 3.35 / 1;
            width: 100%;
            max-width: 1200px;
            display: flex;
            background-color: {{BackgroundColor}};
            color: {{TextColor}};
            position: relative;
        }
        .main-cover {
            flex: 2.35;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 3rem;
            background: linear-gradient(135deg, {{GradientStart}} 0%, {{GradientEnd}} 100%);
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
            background-color: {{ShareBgColor}};
            border-left: 4px solid {{BorderColor}};
        }
        
        /* Custom Isomertric-ish Shapes */
        .prompt-bubble {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 8px 16px;
            font-size: 0.8rem;
            color: #6b7280;
            box-shadow: 4px 4px 0px #cbd5e1;
            transform: rotate(-3deg);
        }
        
        .skill-cube {
            width: 60px;
            height: 60px;
            background: rgba({{CubeRGB}}, 0.1);
            border: 2px solid rgb({{CubeRGB}});
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgb({{CubeRGB}});
            font-weight: bold;
            box-shadow: 4px 4px 0px rgba({{CubeRGB}}, 0.2);
            transition: all 0.3s ease;
        }

        .cube-3d {
            width: 100px;
            height: 100px;
            background: rgb({{CubeRGB}});
            transform: rotate(45deg);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: -10px 10px 20px rgba({{CubeRGB}}, 0.3);
            position: relative;
        }
        .cube-3d::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 16px;
            border: 4px solid rgba(255,255,255,0.3);
        }
    </style>
</head>
<body class="bg-gray-200 min-h-screen flex flex-col items-center justify-center p-8">

    <div class="mb-4 text-gray-600">
        {{SchemeDescription}}
    </div>

    <div id="capture" class="cover-container shadow-2xl rounded-xl overflow-hidden">
        <!-- Main Cover (2.35:1) -->
        <div class="main-cover relative">
            <!-- Background Decoration: Grid -->
            <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient({{GridColor}} 1px, transparent 1px); background-size: 20px 20px;"></div>

            <!-- Content Container -->
            <div class="z-10 flex flex-col justify-center h-full w-1/2 pr-8">
                <div class="flex items-center space-x-2 mb-4">
                    <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold tracking-wider uppercase">{{TagText}}</span>
                </div>
                <h1 class="text-5xl font-black text-gray-900 leading-tight mb-2 tracking-tight">
                    {{MainTitleHTML}}
                </h1>
                <p class="text-gray-500 font-medium text-lg mt-2">{{SubTitle}}</p>
            </div>

            <!-- Visual Metaphor: Chaos to Order -->
            <div class="z-10 w-1/2 h-full flex items-center justify-center relative">
                <!-- Left: Chaos (Inputs) -->
                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-40 relative">
                    <div class="prompt-bubble absolute top-0 left-0 rotate-[-6deg] z-10">{{BubbleText1}}</div>
                    <div class="prompt-bubble absolute top-12 left-8 rotate-[12deg] z-20 bg-gray-50">{{BubbleText2}}</div>
                    <div class="prompt-bubble absolute bottom-4 left-2 rotate-[-15deg] z-0 opacity-70">{{BubbleText3}}</div>
                </div>

                <!-- Arrow -->
                <div class="absolute left-32 text-blue-300 text-4xl animate-pulse">
                    ➔
                </div>

                <!-- Right: Order (Outputs) -->
                <div class="absolute right-0 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-3 transform rotate-y-12">
                    <div class="skill-cube bg-white border-blue-400 text-blue-500 shadow-blue-100">{{CubeText1}}</div>
                    <div class="skill-cube bg-orange-50 border-orange-400 text-orange-500">{{CubeText2}}</div>
                    <div class="skill-cube bg-white border-purple-400 text-purple-500 shadow-purple-100">{{CubeText3}}</div>
                    <div class="skill-cube bg-green-50 border-green-400 text-green-500">{{CubeText4}}</div>
                </div>
            </div>
        </div>

        <!-- Share Cover (1:1) -->
        <div class="share-cover">
            <div class="cube-3d mb-4">
                <!-- Icon SVG -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div class="text-2xl font-black text-gray-800 tracking-widest">{{ShareTitle}}</div>
            <div class="text-xs text-{{ThemeColor}}-500 font-bold mt-1 uppercase tracking-wider">{{ShareSubtitle}}</div>
        </div>
    </div>

    <div class="mt-8 flex gap-4">
        <button onclick="downloadImage()" class="px-8 py-3 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition flex items-center font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载封面图
        </button>
    </div>

    <script>
        function downloadImage() {
            const captureElement = document.getElementById('capture');
            html2canvas(captureElement, {
                scale: 2, // High resolution
                backgroundColor: null,
                useCORS: true
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'wechat-cover-isometric.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    </script>
</body>
</html>
```
