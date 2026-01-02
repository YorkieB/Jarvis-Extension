# Comet Extension - Quick Reference Card

## 🚀 Getting Started

### Installation
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select Comet folder

### First Use
Press `Ctrl+Shift+Space` on any webpage to open the sidecar

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Space` | Toggle sidecar |
| `Ctrl+Enter` | Execute task (in task input) |
| `Enter` | Research (in research input) |

---

## 🎯 Common Tasks

### Search
```
Search for [query]
```
Example: `Search for machine learning`

### Click
```
Click [element name]
Click the [button/link]
```
Example: `Click the Sign In button`

### Form Filling
```
Fill [field] with [value]
```
Example: `Fill email with test@example.com`

### Navigation
```
Click on [link name]
Scroll to [element]
```
Example: `Click on About Us`

### Research
```
Research [topic]
What is [question]
Find [information]
```
Example: `What is this page about?`

---

## 🎨 Sidecar Interface

### Task Tab
- Enter natural language commands
- Click "Execute Task" or press `Ctrl+Enter`
- View execution progress and results

### Research Tab
- Enter research queries
- Get instant insights and summaries
- See sources and findings

### History Tab
- View past executions
- Check success/failure status
- Review completed tasks

---

## ⚙️ Configuration

Click the extension icon to configure:

- **API Endpoint**: URL for external AI (optional)
- **API Key**: Your API key (optional)
- **Use Local First**: ✓ Recommended

---

## 🔍 Debug Tools

From the extension popup:

1. **View Accessibility Tree**
   - See how Comet understands the page
   - Opens in new tab

2. **List Interactive Elements**
   - Shows all clickable/interactive items
   - Useful for targeting elements

---

## 💡 Tips for Best Results

1. **Be Specific**: "Click the blue Submit button" > "click button"
2. **Use Quotes**: For exact matches: 'Click "Sign In"'
3. **Break Down**: Complex tasks → simple steps
4. **Check Visibility**: Element must be visible on page
5. **Wait for Loading**: Let dynamic content load first

---

## 🐛 Quick Troubleshooting

### Sidecar Won't Open
- Refresh the page
- Check if extension is enabled
- Try clicking the extension icon

### Task Fails
- Verify element exists and is visible
- Try more specific description
- Use "View Accessibility Tree" to inspect

### Slow Execution
- Enable "Use Local First" in settings
- Close unnecessary tabs
- Clear execution history

---

## 📚 More Help

- Full docs: `DOCUMENTATION.md`
- Examples: `EXAMPLES.md`
- Troubleshooting: `TROUBLESHOOTING.md`
- Installation: `INSTALLATION.md`

---

## 🌟 Example Workflows

### Login Flow
```
1. "Click Sign In"
2. "Fill email with user@example.com"
3. "Fill password with mypassword"
4. "Click Login button"
```

### Search & Click
```
1. "Search for wireless headphones"
2. Wait for results
3. "Click the first product"
```

### Page Research
```
1. "Research the main features"
2. "Find pricing information"
3. "Extract customer testimonials"
```

---

## 🔒 Privacy

- ✅ Runs locally in your browser
- ✅ No data collection
- ✅ API is optional
- ✅ You control what's shared

---

**Comet v1.0.0** | Made with ❤️ for intelligent browser automation
