// API Configuration EXAMPLE
// Make a copy of this file, rename it to config.js, and fill in the correct values

const API_CONFIG = {
    // API Base URL (without trailing slash)
    BASE_URL: "http://localhost",
    
    // API paths
    PATHS: {
        STATUS: "/api",                        // Path for status check (expects 202 response for OK)
        IMPORT: "/api/inventorycounts/import"  // Path for importing data
    },
    
    // API Authentication - Basic Auth credentials
    USERNAME: "api_username",
    PASSWORD: "api_password",
    
    // Timeout in milliseconds
    TIMEOUT: 10000, // 10 seconds
    
    // Extra options (if needed)
    OPTIONS: {
        // Any additional headers or configuration
    }
};

// Export for use in scripts.js
export default API_CONFIG;