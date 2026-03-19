const fs = require('fs');
const topojson = require('topojson-client');
const world = require('world-atlas/countries-110m.json');
const d3 = require('d3-geo');

const width = 1000;
const height = 500;

const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);

const path = d3.geoPath(projection);
const land = topojson.feature(world, world.objects.land);

const pathString = path(land);

const hqCoords = [83.3, 17.7];
const nepalCoords = [84.0, 28.0];
const slCoords = [80.7, 7.8];
const phCoords = [121.7, 12.8];

const [hqX, hqY] = projection(hqCoords);
const [neX, neY] = projection(nepalCoords);
const [slX, slY] = projection(slCoords);
const [phX, phY] = projection(phCoords);

const svgContent = `
                    <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg"
                        style="width:100%;height:auto;display:block;">
                        <style>
                            .continent { fill: #eef2f7; stroke: #1B3A7A; stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; }
                            @keyframes mapPulse {
                                0%,100% { r: 6; opacity: 0.9; }
                                50% { r: 10; opacity: 0.5; }
                            }
                            @keyframes mapPulseYellow {
                                0%,100% { r: 4.5; opacity: 0.9; }
                                50% { r: 7.5; opacity: 0.5; }
                            }
                            .dot-green-ring { animation: mapPulse 2s ease-in-out infinite; }
                            .dot-yellow-ring { animation: mapPulseYellow 2.3s ease-in-out infinite; }
                        </style>

                        <!-- The Beautiful High-Quality Blunt World Map -->
                        <path class="continent" d="${pathString}" />

                        <!-- ── LOCATION DOTS ── -->

                        <!-- AP, India (HQ) -->
                        <circle cx="${hqX}" cy="${hqY}" r="10" fill="#39B54A" opacity="0.25"/>
                        <circle class="dot-green-ring" cx="${hqX}" cy="${hqY}" r="6" fill="#39B54A" opacity="0.9"/>
                        <circle cx="${hqX}" cy="${hqY}" r="3" fill="#ffffff"/>

                        <!-- Nepal -->
                        <circle cx="${neX}" cy="${neY}" r="8" fill="#FDB813" opacity="0.25"/>
                        <circle class="dot-yellow-ring" cx="${neX}" cy="${neY}" r="4.5" fill="#FDB813" opacity="0.9"/>
                        <circle cx="${neX}" cy="${neY}" r="2" fill="#ffffff"/>

                        <!-- Sri Lanka -->
                        <circle cx="${slX}" cy="${slY}" r="8" fill="#FDB813" opacity="0.25"/>
                        <circle class="dot-yellow-ring" cx="${slX}" cy="${slY}" r="4.5" fill="#FDB813" opacity="0.9"/>
                        <circle cx="${slX}" cy="${slY}" r="2" fill="#ffffff"/>

                        <!-- Philippines -->
                        <circle cx="${phX}" cy="${phY}" r="8" fill="#FDB813" opacity="0.25"/>
                        <circle class="dot-yellow-ring" cx="${phX}" cy="${phY}" r="4.5" fill="#FDB813" opacity="0.9"/>
                        <circle cx="${phX}" cy="${phY}" r="2" fill="#ffffff"/>

                        <!-- Legend -->
                        <g transform="translate(18,460)">
                            <circle cx="8" cy="8" r="6" fill="#39B54A"/>
                            <circle cx="8" cy="8" r="3" fill="#fff"/>
                            <text x="20" y="13" font-family="Plus Jakarta Sans,sans-serif" font-size="12" fill="#5f6368">Andhra Pradesh, India (HQ)</text>
                            <circle cx="8" cy="26" r="6" fill="#FDB813"/>
                            <circle cx="8" cy="26" r="3" fill="#fff"/>
                            <text x="20" y="31" font-family="Plus Jakarta Sans,sans-serif" font-size="12" fill="#5f6368">Client Locations — Nepal · Sri Lanka · Philippines</text>
                        </g>
                    </svg>
`;

let html = fs.readFileSync('index.html', 'utf8');

const startTag = '<svg viewBox="0 0 1000 500"';
const endTag = '</svg>';

const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag, startIndex) + endTag.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Tags not found");
    process.exit(1);
}

const newHtml = html.substring(0, startIndex) + svgContent.trim() + html.substring(endIndex);

fs.writeFileSync('index.html', newHtml, 'utf8');
console.log("Successfully injected accurate d3-geo world map!");
