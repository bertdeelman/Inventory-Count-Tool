# Excel naar JSON Converter

Een eenvoudige webapplicatie waarmee je een Excel-bestand kunt uploaden en converteren naar een specifiek JSON-formaat.

## Functionaliteiten

- Excel-bestand uploaden (.xlsx, .xls)
- Referentienaam invoeren
- Converteren van Excel-data (alleen kolom A) naar JSON
- Kopiëren van JSON-output naar klembord
- Downloaden van JSON-output als bestand (met referentienaam als bestandsnaam)
- Responsive design met Tailwind CSS

## Projectstructuur

```
excel-to-json-converter/
├── index.html      # De hoofdpagina van de applicatie
├── styles.css      # Aanvullende CSS-stijlen
├── scripts.js      # JavaScript functionaliteit
├── favicon.ico     # Website favicon
└── README.md       # Projectdocumentatie
```

## Lokaal testen

Om de applicatie lokaal te testen:

1. Download of kloon deze repository
2. Open `index.html` in een moderne webbrowser (Chrome, Firefox, Edge, etc.)

Voor de beste ervaring wordt aanbevolen om een lokale webserver te gebruiken, bijvoorbeeld met de Live Server extensie in Visual Studio Code.

## Vereisten

De applicatie maakt gebruik van de volgende externe bronnen:

- [Tailwind CSS](https://tailwindcss.com/) (CDN)
- [SheetJS](https://sheetjs.com/) (XLSX bibliotheek via CDN)

Er is geen installatie van afhankelijkheden nodig omdat alle benodigde bibliotheken via CDN worden geladen.

## Gebruiksaanwijzing

1. Vul een referentienaam in (bijvoorbeeld "123INKT-week 9")
2. Upload een Excel-bestand door te klikken op het uploadgebied of door een bestand te slepen
3. Klik op de knop "Converteer naar JSON"
4. De gegenereerde JSON wordt getoond in het resultaatvak
5. Gebruik de "Kopieer JSON" knop om de JSON naar het klembord te kopiëren
6. Gebruik de "Download JSON" knop om de JSON als bestand op te slaan (de bestandsnaam is gebaseerd op de referentienaam)

## JSON-structuur

De gegenereerde JSON heeft de volgende structuur:

```json
{
    "ImportOperation": {
        "Lines": {
            "InventoryLine": [
                {
                    "ReferenceName": "ingevoerde referentienaam",
                    "ExtLocationId": "waarde uit Excel kolom A"
                },
                ...
            ]
        }
    }
}
```

## Deployment

Deze applicatie kan worden gedeployed op elk webhosting platform, inclusief:

- GitHub Pages
- Render
- Netlify
- Vercel

Voor deployment instructies, zie de deployment sectie hieronder.

## Deployment naar Render

1. Maak een GitHub repository aan
2. Push alle projectbestanden naar de repository
3. Maak een account aan op [Render](https://render.com/)
4. Klik op "New" en selecteer "Static Site"
5. Verbind met je GitHub repository
6. Configureer de deployment instellingen:
   - Build Command: laat leeg (niet nodig voor statische HTML/CSS/JS)
   - Publish Directory: `.` (huidige directory)
7. Klik op "Create Static Site"

## Licentie

Dit project is open-source en beschikbaar onder de MIT-licentie.