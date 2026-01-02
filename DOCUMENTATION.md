# Comet Browser Extension

🌟 **AI-Powered Browser Assistant with Accessibility Tree Perception and Hybrid Inference**

Comet is an advanced browser extension that brings intelligent automation to your browsing experience through:

- **Accessibility Tree Perception**: Deep understanding of page structure
- **Hybrid Inference**: Local heuristics combined with optional AI API integration
- **Agentic Execution**: Multi-step task chaining and autonomous execution
- **Deep Research**: Contextual analysis via on-page sidecar UI

## Features

### 🌳 Accessibility Tree Perception
- Automatically extracts and processes the accessibility tree from any webpage
- Identifies interactive elements, their roles, names, and states
- Provides semantic understanding of page structure
- Enables precise element targeting for automation

### 🤖 Hybrid Inference System
- **Local-First Approach**: Uses built-in heuristics for common tasks
- **API Integration**: Optional connection to external AI services
- **Intelligent Planning**: Breaks down high-level tasks into executable steps
- **Recovery Strategies**: Automatically handles failures and finds alternatives

### ⚡ Agentic Execution
- **Multi-Step Tasks**: Chain multiple actions together
- **Smart Element Discovery**: Finds elements using multiple strategies (CSS, XPath, accessibility)
- **Action Types**:
  - Click elements
  - Fill forms
  - Scroll to locations
  - Extract data
  - Navigate pages
  - Perform research

### 🔬 Deep Research
- Analyze current page content
- Extract relevant information based on queries
- Provide contextual insights and summaries
- Support for multi-source research

### 🎨 Contextual Sidecar UI
- Beautiful, unobtrusive sidebar interface
- Three main tabs:
  - **Task**: Execute natural language commands
  - **Research**: Perform deep analysis
  - **History**: View execution history
- Keyboard shortcut: `Ctrl+Shift+Space`

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/YorkieB/Jarvis-Extension.git
   cd Jarvis-Extension
   ```

2. Install dependencies (optional, for development):
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in your browser:
   - Open Chrome/Edge and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory (or root directory if not built)

### Manual Installation

Alternatively, you can load the extension directly without building:
- Follow step 4 above, but select the root directory instead of `dist`

## Usage

### Quick Start

1. **Open the Sidecar**
   - Click the Comet icon in your browser toolbar, OR
   - Press `Ctrl+Shift+Space` on any webpage

2. **Execute a Task**
   ```
   Example tasks:
   - "Search for machine learning tutorials"
   - "Click the Sign In button"
   - "Fill the email field with test@example.com"
   - "Scroll to the footer"
   ```

3. **Perform Research**
   - Switch to the Research tab
   - Enter your query
   - Get instant insights from the current page

### Configuration

Access the popup by clicking the extension icon:

- **API Endpoint**: URL for external AI service (optional)
- **API Key**: Authentication key for API service (optional)
- **Use Local First**: Enable local heuristics before API calls

Settings are automatically saved and synced across devices.

### Advanced Usage

#### Accessibility Tree

View the complete accessibility tree of any page:
1. Click the extension icon
2. Select "View Accessibility Tree"
3. Tree structure opens in a new tab

#### Interactive Elements

List all interactive elements:
1. Click the extension icon
2. Select "List Interactive Elements"
3. Elements list opens in a new tab

## Architecture

### Core Modules

#### 1. Accessibility Tree Perception (`accessibility-tree.js`)
- Recursively builds accessibility tree from DOM
- Extracts ARIA attributes and implicit roles
- Identifies interactive elements
- Provides XPath and CSS selectors
- Calculates element positions and visibility

#### 2. Hybrid Inference Engine (`hybrid-inference.js`)
- Plans tasks using local heuristics
- Falls back to API for complex tasks
- Generates executable step sequences
- Handles recovery from failures
- Performs deep research analysis

#### 3. Agentic Executor (`agentic-executor.js`)
- Executes planned task steps
- Handles multiple action types
- Manages execution history
- Implements retry logic
- Coordinates with other modules

#### 4. Content Script (`content.js`)
- Runs on all webpages
- Integrates all modules
- Manages sidecar UI
- Handles message passing

#### 5. Background Service Worker (`background.js`)
- Manages cross-tab coordination
- Stores configuration
- Handles extension-wide state

#### 6. Popup UI (`popup.html`, `popup.js`)
- Extension configuration
- Quick access to features
- Status display

### Data Flow

```
User Input → Content Script → Accessibility Tree Perception
                ↓
          Hybrid Inference (Task Planning)
                ↓
          Agentic Executor (Step Execution)
                ↓
          DOM Manipulation / Research Results
```

## API Integration (Optional)

Comet can integrate with external AI services for enhanced capabilities:

### Endpoints

**POST /api/plan**
- Plans a task into executable steps
- Request: `{ task: string, context: object }`
- Response: `{ plan: { task, steps[], source } }`

**POST /api/research**
- Performs deep research
- Request: `{ query: string, context: string, url: string }`
- Response: `{ summary: string, insights: string[], sources: object[] }`

### Local-First Design

- All basic functionality works without API
- API is optional enhancement
- Local heuristics handle common patterns
- Privacy-focused: minimal data sent to API

## Development

### Project Structure

```
Jarvis-Extension/
├── manifest.json              # Extension configuration
├── package.json               # NPM configuration
├── build.js                   # Build script
├── accessibility-tree.js      # Accessibility perception
├── hybrid-inference.js        # Inference engine
├── agentic-executor.js        # Task execution
├── content.js                 # Content script
├── background.js              # Service worker
├── popup.html                 # Popup UI
├── popup.js                   # Popup logic
├── sidecar.css               # Sidecar styles
├── icons/                     # Extension icons
└── README.md                  # Documentation
```

### Building

```bash
npm run build       # Build for production
npm run dev         # Build and watch for changes
```

### Linting

```bash
npm run lint        # Check code style
npm run format      # Format code
```

## Examples

### Example 1: Web Search
```javascript
Task: "Search for 'artificial intelligence' on this page"

Execution:
1. Find search box (role: searchbox)
2. Click to focus
3. Type query: "artificial intelligence"
4. Find and click search button
```

### Example 2: Form Filling
```javascript
Task: "Fill the login form"

Execution:
1. Find email field (role: textbox, name contains "email")
2. Enter email address
3. Find password field (role: textbox, name contains "password")
4. Enter password
5. Find submit button (role: button, name contains "sign in")
6. Click submit
```

### Example 3: Research
```javascript
Task: "Research the main topic of this article"

Execution:
1. Extract page content via accessibility tree
2. Identify headings and key sections
3. Analyze text for main themes
4. Generate summary and insights
```

## Browser Support

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ✅ Opera
- ⚠️ Firefox (requires manifest v2 adaptation)
- ⚠️ Safari (requires Safari-specific build)

## Security & Privacy

- **No Data Collection**: Comet doesn't collect or store personal data
- **Local Processing**: All core functionality runs locally
- **Optional API**: External API is opt-in only
- **Secure Storage**: Configuration stored in browser sync storage
- **Content Security**: Runs in isolated context

## Limitations

- Requires JavaScript-enabled pages
- Some dynamic content may need additional wait time
- API integration requires external service setup
- Complex SPAs may need specific handling

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [Repository Issues](https://github.com/YorkieB/Jarvis-Extension/issues)

## Roadmap

- [ ] Firefox compatibility
- [ ] Safari support
- [ ] Visual task recorder
- [ ] Advanced error recovery
- [ ] Multi-tab orchestration
- [ ] Natural language improvements
- [ ] Browser automation recipes
- [ ] Cloud sync for history
- [ ] Team collaboration features

## Changelog

### v1.0.0 (2026-01-02)
- Initial release
- Accessibility Tree Perception
- Hybrid Inference System
- Agentic Execution Engine
- Deep Research capabilities
- Sidecar UI
- Multi-step task chaining

---

**Built with ❤️ for the future of browser automation**
