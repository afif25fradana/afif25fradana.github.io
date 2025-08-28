# FOR FUTURE ME!

This repository is where I keep the code for my personal website and portfolio. Think of it as my digital home base, built with some good old HTML, styled up with the magic of Tailwind CSS, and brought to life with a touch of JavaScript.

## 📁 Project Structure

```
repo-root/
│
├── public/              # Static assets (favicon, 404.html, etc.)
│   ├── favicon.ico
│   └── 404.html
│
├── src/                 # Source files
│   ├── data/            # JSON data files
│   │   ├── hobbies.json
│   │   └── music.json
│   │
│   ├── js/              # JavaScript files
│   │   ├── components/  # Reusable components (starfield, music player, etc.)
│   │   ├── pages/       # Page-specific functionality
│   │   └── main.js      # Main entry point
│   │
│   ├── styles/          # CSS/Tailwind files
│   │   ├── input.css
│   │   └── style.css
│   │
│   └── index.html       # Main HTML entry point
│
├── dist/                # Built/output files
│
├── tests/               # Unit tests for JavaScript modules
│   ├── github.test.js
│   ├── utils.test.js
│   └── README.md
│
├── package.json
├── tailwind.config.js
├── eslint.config.js
├── README.md
├── LICENSE
└── .gitignore
```

### Directories explained:

- **`public/`** - Static files that are served directly without processing
- **`src/`** - All source code organized by type
  - **`data/`** - JSON files containing content data for easy updates
  - **`js/`** - JavaScript files organized into:
    - **`components/`** - Reusable UI components and modules
    - **`pages/`** - Page-specific functionality
    - **`main.js`** - Main entry point that coordinates all functionality
  - **`styles/`** - CSS and Tailwind configuration files
- **`dist/`** - Generated output files (CSS build output)
- **`tests/`** - Unit tests for JavaScript modules

## 🛠️ Development

### Prerequisites
- Node.js (or pnpm)
- A modern web browser

### Setup
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start the development server: `pnpm run dev`
4. Build for production: `pnpm run build`

### Scripts
- `pnpm run dev` - Watch for changes and rebuild automatically
- `pnpm run build` - Build the project for production

## 🧪 Testing

Unit tests are located in the `tests/` directory. To run the tests:

1. Open the test files directly in a browser, or
2. Run them in a Node.js environment

Current test coverage includes:
- Utility functions (`Utils.debounce`, `Utils.formatErrorMessage`)
- GitHub repository fetching functionality

For more detailed information about testing, see [tests/README.md](tests/README.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.