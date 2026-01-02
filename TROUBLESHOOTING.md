# Troubleshooting Guide

## Installation Issues

### Extension Won't Load

**Problem**: Error when loading the extension

**Solutions**:
1. Make sure all files are present (check `manifest.json` exists)
2. Check that manifest.json is valid JSON
3. Ensure you're using Chrome/Edge 88+ (Manifest V3 support)
4. Try reloading the extension: Extensions page → Reload button

### Icons Not Showing

**Problem**: Extension icon appears as default puzzle piece

**Solutions**:
1. Check that `icons/` directory exists
2. Verify PNG files are present: `icon16.png`, `icon48.png`, `icon128.png`
3. Run `npm run build` to regenerate icons
4. Reload the extension

## Runtime Issues

### Sidecar Won't Open

**Problem**: Pressing `Ctrl+Shift+Space` does nothing

**Solutions**:
1. Check browser console for errors (F12)
2. Verify content script is loaded: Check in DevTools → Sources
3. Try clicking the extension icon instead
4. Reload the page and try again
5. Check that JavaScript is enabled on the page

### Tasks Not Executing

**Problem**: Task execution fails or does nothing

**Solutions**:

1. **Element Not Found**
   - Use "View Accessibility Tree" to see how page is structured
   - Try more specific descriptions: "login button" instead of "button"
   - Check if element is visible (scroll into view first)

2. **Task Hangs**
   - Check browser console for errors
   - Break task into smaller steps
   - Increase wait time between steps

3. **Wrong Element Selected**
   - Be more specific in task description
   - Use quotes for exact text: 'Click "Submit Form"'
   - Use role + name: "Click the submit button"

### Research Results Empty

**Problem**: Research returns no results

**Solutions**:
1. Ensure page content is loaded (wait for page to fully render)
2. Try more specific queries
3. Check if API is configured (if using external service)
4. Verify page has actual text content (not all images)

## Configuration Issues

### API Not Working

**Problem**: API calls fail or timeout

**Solutions**:
1. Verify API endpoint URL is correct
2. Check API key is valid
3. Ensure API service is running
4. Check network tab in DevTools for error details
5. Enable "Use local first" to fall back to local inference

### Settings Not Saving

**Problem**: Configuration doesn't persist

**Solutions**:
1. Check browser sync is enabled
2. Look for errors in browser console
3. Try saving again
4. Clear extension data and reconfigure:
   - Extensions page → Remove → Reinstall

## Performance Issues

### Slow Execution

**Problem**: Tasks take too long to execute

**Solutions**:
1. Enable "Use local first" in settings (faster)
2. Reduce wait times in complex tasks
3. Clear execution history if it's very large
4. Close other tabs to free up resources

### High Memory Usage

**Problem**: Browser becomes slow

**Solutions**:
1. Clear execution history regularly
2. Close sidecar when not in use
3. Disable extension on pages where not needed
4. Restart browser periodically

## Compatibility Issues

### Doesn't Work on Specific Sites

**Problem**: Extension fails on certain websites

**Possible Reasons**:
1. **Content Security Policy**: Site blocks extension scripts
2. **Dynamic Content**: Page uses heavy client-side rendering
3. **Shadow DOM**: Content is in shadow roots (not accessible)
4. **iFrames**: Content is in cross-origin iframes

**Solutions**:
1. Wait longer for page to fully load
2. Refresh the page
3. Try after disabling other extensions
4. Some sites may not be compatible (rare)

### Firefox/Safari Support

**Problem**: Extension doesn't work in Firefox or Safari

**Solution**:
Currently, Comet requires Manifest V3 and is designed for Chrome/Edge. Firefox and Safari support would require adaptation.

## Error Messages

### "Failed to establish connection"

**Cause**: Content script not loaded or page not ready

**Solution**:
1. Refresh the page
2. Wait a few seconds and try again
3. Check if extension is enabled

### "Element not found"

**Cause**: Target element doesn't exist or isn't visible

**Solution**:
1. Make sure element exists on page
2. Scroll to make element visible
3. Use more specific description
4. Check accessibility tree to see available elements

### "Task execution timeout"

**Cause**: Task took too long

**Solution**:
1. Break into smaller tasks
2. Check if page is responding
3. Increase timeout in hybrid-inference.js config

## Debug Mode

### Enable Debug Logging

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for messages prefixed with `[Comet]`, `[AgenticExecutor]`, etc.

### Check Extension Status

1. Go to `chrome://extensions/`
2. Find Comet extension
3. Click "Details"
4. Check "Inspect views: background page" for service worker logs

### Test Individual Components

From browser console on any page:

```javascript
// Test accessibility tree
chrome.runtime.sendMessage({action: 'getAccessibilityTree'}, console.log);

// Test interactive elements
chrome.runtime.sendMessage({action: 'getInteractiveElements'}, console.log);

// Test execution history
chrome.runtime.sendMessage({action: 'getExecutionHistory'}, console.log);
```

## Common Fixes

### Nuclear Option: Complete Reset

If nothing works:

1. Go to `chrome://extensions/`
2. Remove the Comet extension
3. Clear browser cache
4. Restart browser
5. Reinstall extension
6. Reconfigure settings

### Report Issues

If you've tried everything:

1. Note the exact error message
2. Check browser console for errors
3. Note what task/action you were attempting
4. Open issue on GitHub with:
   - Browser version
   - Extension version
   - Steps to reproduce
   - Error messages
   - Console logs

## Performance Tips

1. **Close sidecar when not in use**
2. **Clear history periodically** (History tab → Clear button if added)
3. **Use local inference** for simple tasks
4. **Disable on media-heavy sites** if not needed
5. **Keep browser updated** for best performance

## Security Notes

- Comet only accesses pages you're actively viewing
- No data is sent anywhere unless you configure an API
- All processing happens in your browser
- Settings are stored in browser sync storage (encrypted)
- Review permissions in extension details page

## Getting Help

- Check [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed guides
- See [EXAMPLES.md](./EXAMPLES.md) for usage examples
- Open issue on GitHub: https://github.com/YorkieB/Jarvis-Extension/issues
- Include debug information when reporting issues
