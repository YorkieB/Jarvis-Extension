# Quick Installation Guide

## Step-by-Step Installation

### 1. Download the Extension

Option A: Clone from GitHub
```bash
git clone https://github.com/YorkieB/Jarvis-Extension.git
cd Jarvis-Extension
```

Option B: Download ZIP
- Go to the repository
- Click "Code" → "Download ZIP"
- Extract the ZIP file

### 2. Build the Extension (Optional)

If you want to use the built version:

```bash
npm install  # Optional, only for linting tools
node build.js
```

This creates a `dist` folder with the extension files.

### 3. Load in Chrome/Edge

1. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`

2. Enable **Developer mode** (toggle in top-right corner)

3. Click **"Load unpacked"**

4. Select the folder:
   - If you ran build: Select the `dist` folder
   - If not: Select the root `Jarvis-Extension` folder

5. The Comet extension should now appear in your extensions list! 🎉

### 4. Verify Installation

You should see:
- ✅ Comet icon in your browser toolbar
- ✅ Extension listed in chrome://extensions/
- ✅ No error messages

### 5. First Use

1. Navigate to any webpage (or open the included `test-page.html`)

2. Click the Comet icon in toolbar OR press `Ctrl+Shift+Space`

3. The sidecar UI should slide in from the right side

4. Try a simple task:
   ```
   Search for machine learning
   ```

## Troubleshooting Installation

### "Manifest file is missing or unreadable"

**Solution**: Make sure you selected the correct folder containing `manifest.json`

### "Extension failed to load"

**Solutions**:
1. Check that all files are present (run `ls -la` or check folder)
2. Verify your browser version (Chrome/Edge 88+)
3. Try reloading: Extensions page → Click reload button on Comet

### Icons not showing

**Solution**: 
```bash
# Regenerate icons
python3 -c "from build_icons import create_icons; create_icons()"
# Or manually check that icons/icon16.png, icon48.png, icon128.png exist
```

### Extension loads but sidecar won't open

**Solutions**:
1. Refresh the webpage
2. Check browser console for errors (F12)
3. Try a different webpage
4. Verify extension is enabled in chrome://extensions/

## Configuration

After installation, click the Comet icon to configure:

1. **API Endpoint** (optional): URL for external AI service
2. **API Key** (optional): Your API key
3. **Use Local First**: Keep enabled for best performance

## Testing the Extension

Use the included `test-page.html`:

1. Open the file in your browser:
   ```bash
   # On Linux/Mac
   open test-page.html
   
   # On Windows
   start test-page.html
   
   # Or just drag the file into your browser
   ```

2. Press `Ctrl+Shift+Space` to open Comet

3. Try these test tasks:
   - "Search for artificial intelligence"
   - "Fill email with test@example.com"
   - "Click on About Us"

4. Switch to Research tab and try:
   - "What is this page about?"

## Next Steps

1. Read [DOCUMENTATION.md](./DOCUMENTATION.md) for full features
2. Check [EXAMPLES.md](./EXAMPLES.md) for usage examples
3. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if you encounter issues

## Quick Reference

### Keyboard Shortcuts
- `Ctrl+Shift+Space` - Toggle sidecar
- `Ctrl+Enter` - Execute task (in task input)
- `Enter` - Research (in research input)

### Quick Actions (from popup)
- Toggle Sidecar
- View Accessibility Tree
- List Interactive Elements

### Common Tasks
```
Search for [query]
Click [button/link name]
Fill [field name] with [value]
Scroll to [element]
Research [topic]
```

## Uninstallation

To remove Comet:

1. Go to `chrome://extensions/`
2. Find Comet extension
3. Click "Remove"
4. Confirm removal

Your configuration and history will be deleted.

## Support

- Issues: https://github.com/YorkieB/Jarvis-Extension/issues
- Documentation: [DOCUMENTATION.md](./DOCUMENTATION.md)
- Examples: [EXAMPLES.md](./EXAMPLES.md)

---

**Happy automating! 🌟**
