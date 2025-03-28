# Inventory Count Tool

Een eenvoudige webapplicatie waarmee je een Excel-bestand kunt uploaden en converteren naar een specifiek JSON-formaat, met de mogelijkheid om de data te downloaden.

## Wat doet deze tool?

De Inventory Count Tool is ontworpen om het eenvoudig te maken om gegevens uit een Excel-bestand om te zetten naar een gestandaardiseerd JSON-formaat voor inventarisatie-doeleinden. De tool verwerkt specifieke ID's uit kolom A van je Excel-bestand en voegt deze toe aan een voorgedefinieerde JSON-structuur.

### Gebruikssituaties

- **Voorbereiding van data voor ERP- of inventarissystemen**: Bereid data voor die geïmporteerd moet worden in systemen die JSON-input accepteren
- **Datavalidatie**: Controleer of de ID's uit je Excel-bestand correct worden geconverteerd voor gebruik in andere systemen
- **Gestandaardiseerde gegevensuitwisseling**: Maak het delen van inventarisatiegegevens gemakkelijker door een consistente datastructuur te gebruiken

### Hoe werkt het?

1. Je kiest het type ID dat je wilt gebruiken: ExtLocationId (voor locaties) of ExtProductId (voor producten)
2. Je uploadt een Excel-bestand waarin kolom A de ID-waarden bevat die je wilt verwerken
3. De tool leest alleen kolom A en negeert andere kolommen
4. De tool genereert een JSON-object met de ID's in de vereiste structuur
5. Je kunt het resultaat kopiëren of downloaden voor verder gebruik

## Functies

- Excel-bestand uploaden (.xlsx, .xls)
- Referentie-identifier invoeren (automatisch ingevuld met bestandsnaam)
- Keuze tussen ID-types (ExtLocationId of ExtProductId)
- Excel-data (alleen kolom A) naar JSON converteren
- JSON-uitvoer naar klembord kopiëren
- JSON-uitvoer als bestand downloaden
- Ondersteuning voor donkere modus (inclusief systeemvoorkeursdetectie)
- Responsief ontwerp met Tailwind CSS

## Projectstructuur

```
inventory-count-tool/
├── index.html           # De hoofdpagina van de applicatie
├── styles.css           # Extra CSS-stijlen met ondersteuning voor donkere modus
├── scripts.js           # JavaScript-functionaliteit
├── favicon.ico          # Website-favicon
└── README.md            # Projectdocumentatie
```

## Lokaal testen

Om de applicatie lokaal te testen:

1. Download of clone deze repository
2. Open `index.html` via een lokale webserver, bijvoorbeeld:
   - Met Visual Studio Code: Installeer de "Live Server" extensie en klik op "Go Live"
   - Met Node.js: Installeer http-server (`npm install -g http-server`) en run `http-server` in de project map
   - Met Python: Run `python -m http.server` in de project map

**Opmerking**: Vanwege de ES6-modules is het openen van `index.html` direct in een browser niet mogelijk. Je moet een lokale webserver gebruiken.

## Vereisten

De applicatie gebruikt de volgende externe bronnen:

- [Tailwind CSS](https://tailwindcss.com/) (CDN)
- [SheetJS](https://sheetjs.com/) (XLSX-bibliotheek via CDN)

## Gebruiksaanwijzing

1. Kies het gewenste ID-type (ExtLocationId of ExtProductId)
2. Voer een referentie-identifier in (of gebruik de automatisch ingevulde bestandsnaam)
3. Upload een Excel-bestand door op het uploadgebied te klikken of door een bestand te slepen
4. Klik op de knop "Convert to JSON"
5. De gegenereerde JSON wordt weergegeven in het resultaatvak
6. Gebruik de knop "Copy JSON" om de JSON naar het klembord te kopiëren
7. Gebruik de knop "Download JSON" om de JSON als bestand op te slaan

## JSON-structuur

De gegenereerde JSON heeft een van de volgende structuren, afhankelijk van het geselecteerde ID-type:

1. Met ExtLocationId (standaard):
```json
{
    "ImportOperation": {
        "Lines": {
            "InventoryLine": [
                {
                    "ReferenceName": "ingevoerde referentie-identifier",
                    "ExtLocationId": "waarde uit Excel-kolom A"
                },
                ...
            ]
        }
    }
}
```

2. Met ExtProductId:
```json
{
    "ImportOperation": {
        "Lines": {
            "InventoryLine": [
                {
                    "ReferenceName": "ingevoerde referentie-identifier",
                    "ExtProductId": "waarde uit Excel-kolom A"
                },
                ...
            ]
        }
    }
}
```

## Donkere modus

De applicatie ondersteunt een donkere modus die kan worden ingeschakeld via:
- De maan/zon-knop in de rechterbovenhoek
- Automatisch door systeemvoorkeur (indien ingesteld op donker)
- De voorkeur wordt opgeslagen in de lokale opslag van de browser

## Versiegeschiedenis

- **v1.0.0**: Basis Excel naar JSON conversie met download- en kopieerfunctionaliteit

## Licentie

Dit project is open-source en beschikbaar onder de MIT-licentie.

## Bijdragen

Bijdragen aan dit project zijn welkom! Voel je vrij om een issue te openen of een pull request te sturen.