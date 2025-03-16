# Inventory Count Tool

A simple web application that allows you to upload an Excel file and convert it to a specific JSON format, with the ability to send the data to an API.

## Features

- Upload Excel file (.xlsx, .xls)
- Enter reference identifier (automatically filled with filename)
- Choose between ID types (ExtLocationId or ExtProductId)
- Convert Excel data (column A only) to JSON
- Copy JSON output to clipboard
- Download JSON output as a file
- Send JSON data to an API via Basic Auth
- API status indicator with live connectivity check
- Dark mode support (incl. system preference detection)
- Multilingual support (English, Dutch, Norwegian, Swedish, Danish)
- Responsive design with Tailwind CSS

## Project Structure

```
inventory-count-tool/
├── index.html           # The main page of the application
├── styles.css           # Additional CSS styles with dark mode support
├── scripts.js           # JavaScript functionality
├── config.js            # API configuration (not checked in to Git)
├── sample-config.js     # Example configuration
├── favicon.ico          # Website favicon
├── i18n/                # Multilingual support
│   ├── i18n.js          # Internationalization handler
│   ├── en.json          # English translations
│   ├── nl.json          # Dutch translations
│   ├── no.json          # Norwegian translations
│   ├── sv.json          # Swedish translations
│   └── da.json          # Danish translations
├── .gitignore           # Git ignore file
└── README.md            # Project documentation
```

## API Configuration

1. Make a copy of `sample-config.js` and rename it to `config.js`
2. Fill in the correct API base URL, username and password
3. The `config.js` file is not checked into Git (listed in .gitignore) to protect sensitive data

Example of `config.js`:
```javascript
const API_CONFIG = {
    // API Base URL (without path/endpoint)
    BASE_URL: "https://api.example.local",
    
    // API paths
    PATHS: {
        STATUS: "/api",         // Path for status check
        IMPORT: "/import"       // Path for importing data
    },
    
    // API Authentication (Replace with the correct credentials)
    USERNAME: "your_username",
    PASSWORD: "your_password",
    
    // Timeout in milliseconds
    TIMEOUT: 10000, // 10 seconds
    
    // Extra options (if needed)
    OPTIONS: {}
};

export default API_CONFIG;
```

## Local Testing

To test the application locally:

1. Download or clone this repository
2. Create a `config.js` file (see above)
3. Use a local web server to open `index.html`

For the best experience, it is recommended to use a local web server, for example with the Live Server extension in Visual Studio Code.

**Note**: Due to ES6 modules (import/export), opening `index.html` directly in a browser does not work. You must use a local web server.

## Requirements

The application uses the following external resources:

- [Tailwind CSS](https://tailwindcss.com/) (CDN)
- [SheetJS](https://sheetjs.com/) (XLSX library via CDN)

## Usage Instructions

1. Select your preferred language by clicking on the flag buttons
2. Choose the desired ID type (ExtLocationId or ExtProductId)
3. Enter a reference identifier (or use the automatically filled filename)
4. Upload an Excel file by clicking on the upload area or by dragging a file
5. Click the "Convert to JSON" button
6. The generated JSON is shown in the result box
7. Use the "Copy JSON" button to copy the JSON to the clipboard
8. Use the "Download JSON" button to save the JSON as a file
9. Use the "Send to API" button to send the JSON to the configured API (only available if the API is online)

## JSON Structure

The generated JSON has one of the following structures depending on the selected ID type:

1. With ExtLocationId (default):
```json
{
    "ImportOperation": {
        "Lines": {
            "InventoryLine": [
                {
                    "ReferenceName": "entered reference identifier",
                    "ExtLocationId": "value from Excel column A"
                },
                ...
            ]
        }
    }
}
```

2. With ExtProductId:
```json
{
    "ImportOperation": {
        "Lines": {
            "InventoryLine": [
                {
                    "ReferenceName": "entered reference identifier",
                    "ExtProductId": "value from Excel column A"
                },
                ...
            ]
        }
    }
}
```

## Deployment to GitHub and Render

### GitHub

1. Create a GitHub repository
2. Push all project files to the repository (except `config.js`)

```bash
git init
git add .
git commit -m "First version of Inventory Count Tool"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inventory-count-tool.git
git push -u origin main
```

### Render Deployment

1. Create an account on [Render](https://render.com/)
2. Click on "New" and select "Static Site"
3. Connect to your GitHub repository
4. Configure the deployment settings:
   - Build Command: leave empty (not needed for static HTML/CSS/JS)
   - Publish Directory: `.` (current directory)
5. Add environment variables for the API configuration:
   - `API_ENDPOINT`
   - `API_USERNAME`
   - `API_PASSWORD`
6. Click on "Create Static Site"

To push updates to GitHub:

```bash
git add .
git commit -m "Description of your changes"
git push
```

## Multilingual Support

The application supports the following languages:
- English (en) - Default
- Dutch (nl)
- Norwegian (no)
- Swedish (sv)
- Danish (da)

The language files are located in the `i18n/` folder. To add a new language:
1. Create a new JSON file in the `i18n/` folder (e.g., `fr.json` for French)
2. Copy the structure of an existing language file
3. Translate all text values
4. Add the new language to the `SUPPORTED_LANGUAGES` object in `i18n/i18n.js`
5. Add a language button in `index.html`

## Dark Mode

The application supports a dark mode that can be enabled via:
- The moon/sun button in the top right corner
- Automatically by system preference (if set to dark)
- The preference is saved in the browser's local storage

## Version History

- **v1.0.0**: Basic Excel to JSON conversion
- **v1.1.0**: Added JSON download and reference name auto-fill
- **v1.2.0**: API integration with status indicator and dark mode
- **v1.3.0**: Added multilingual support
- **v1.4.0**: Added choice between ExtLocationId and ExtProductId

## License

This project is open-source and available under the MIT license.

## Contributing

Contributions to this project are welcome! Feel free to open an issue or send a pull request.