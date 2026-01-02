# Comet Extension Examples

## Task Execution Examples

### Web Search
```
Task: "Search for artificial intelligence"
```
Comet will:
1. Find the search input field
2. Type "artificial intelligence"
3. Submit the search (click button or press Enter)

### Navigation
```
Task: "Click on the About Us link"
```
Comet will:
1. Locate links with text containing "About Us"
2. Click the most relevant one

### Form Filling
```
Task: "Fill email with test@example.com"
```
Comet will:
1. Find an input field with role "textbox" and name containing "email"
2. Enter the specified email address

### Multi-Step Tasks
```
Task: "Search for 'machine learning', then click the first result"
```
Comet will:
1. Execute the search
2. Wait for results to load
3. Click the first search result

### Data Extraction
```
Task: "Extract all article titles"
```
Comet will:
1. Identify elements with role "article" or "heading"
2. Extract their text content
3. Return structured data

## Research Examples

### Page Analysis
```
Query: "What is this page about?"
```
Comet will:
1. Analyze the accessibility tree
2. Identify main headings and content
3. Generate a summary

### Specific Information
```
Query: "Find contact information on this page"
```
Comet will:
1. Search for email addresses, phone numbers
2. Look for contact-related sections
3. Extract and present findings

### Comparison
```
Query: "What are the key features mentioned?"
```
Comet will:
1. Scan for feature lists
2. Extract bullet points or numbered items
3. Summarize key features

## Advanced Examples

### Complex Navigation
```
Task: "Go to the pricing page and find the premium plan"
```
Comet will:
1. Find and click "Pricing" link
2. Wait for page load
3. Locate "Premium" plan section
4. Provide information about it

### Interactive Forms
```
Task: "Fill the registration form with John Doe, john@example.com"
```
Comet will:
1. Parse the task to extract name and email
2. Find relevant form fields
3. Fill each field appropriately
4. Optionally submit if requested

### Scrolling and Discovery
```
Task: "Scroll to the footer and find social media links"
```
Comet will:
1. Scroll to the bottom of the page
2. Identify footer section
3. Find links to social media platforms
4. List them

## API Integration Example

If you have an external AI service:

```javascript
// Configure in popup
API Endpoint: https://your-api.com/v1
API Key: your-api-key-here

// Then complex tasks are enhanced
Task: "Analyze the sentiment of user reviews on this page"
```
The API will provide advanced analysis beyond local capabilities.

## Keyboard Shortcuts

- `Ctrl+Shift+Space` - Toggle sidecar
- `Ctrl+Enter` (in task input) - Execute task
- `Enter` (in research input) - Perform research

## Tips for Best Results

1. **Be Specific**: "Click the blue Submit button" is better than "click button"
2. **Use Quotes**: For exact text matches, use quotes: "Sign In"
3. **Break Down Complex Tasks**: Start with simple steps, then combine
4. **Check Results**: Use the History tab to see what worked
5. **Provide Context**: "Fill the email field in the login form" is clearer

## Common Patterns

### Authentication
```
"Click Sign In"
"Fill email with user@example.com"
"Fill password with mypassword"
"Click Login button"
```

### Shopping
```
"Search for wireless headphones"
"Click on the first product"
"Add to cart"
```

### Research
```
"Research the main features"
"Extract pricing information"
"Find customer testimonials"
```

## Troubleshooting Task Execution

If a task fails:

1. **Check the Page**: Is the element visible?
2. **Simplify**: Break into smaller steps
3. **Use Different Names**: Try "Login" instead of "Sign In"
4. **Check History**: See what went wrong in previous attempts
5. **Manual Inspection**: Use "View Accessibility Tree" to see how Comet sees the page
