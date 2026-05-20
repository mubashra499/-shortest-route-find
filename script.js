
        // ========== ROAD NETWORK ==========
        const roadNetwork = {
            "Karachi": [{ to: "Landhi", weight: 25 }, { to: "Thatta", weight: 85 }],
            "Landhi": [{ to: "Karachi", weight: 25 }, { to: "Thatta", weight: 55 }, { to: "Hyderabad", weight: 130 }],
            "Thatta": [{ to: "Karachi", weight: 85 }, { to: "Landhi", weight: 55 }, { to: "Hyderabad", weight: 80 }],
            "Hyderabad": [{ to: "Landhi", weight: 130 }, { to: "Thatta", weight: 80 }]
        };

        // City Coordinates
        const cityCoords = {
            "Karachi": [24.8607, 67.0011],
            "Landhi": [24.8800, 67.2000],
            "Thatta": [24.7473, 67.9235],
            "Hyderabad": [25.3960, 68.3578]
        };

        const cities = ["Karachi", "Landhi", "Thatta", "Hyderabad"];
        const cityIndex = {
            "Karachi": 0,
            "Landhi": 1,
            "Thatta": 2,
            "Hyderabad": 3
        };

        // Toll Data in PKR
        const tollData = {
            "Karachi-Landhi": 30, "Landhi-Karachi": 30,
            "Landhi-Thatta": 50, "Thatta-Landhi": 50,
            "Thatta-Hyderabad": 80, "Hyderabad-Thatta": 80,
            "Karachi-Thatta": 70, "Thatta-Karachi": 70,
            "Landhi-Hyderabad": 120, "Hyderabad-Landhi": 120
        };

        // Vehicle Data with PKR
        const vehicles = [
            { name: "🚗 Car", speed: 60, mileage: 18, fuelPrice: 280 },
            { name: "🛵 Bike", speed: 50, mileage: 40, fuelPrice: 280 },
            { name: "🚚 Truck", speed: 40, mileage: 8, fuelPrice: 280 },
            { name: "🚌 Bus", speed: 45, mileage: 6, fuelPrice: 280 }
        ];

        // Floyd-Warshall Matrices
        let distMatrix = [];
        let nextMatrix = [];

        // Path Type (shortest or longest)
        let currentPathType = "shortest";

        // ========== SELECT PATH TYPE ==========
        function selectPathType(type) {
            currentPathType = type;
            
            // Update button styles
            const shortestBtn = document.getElementById('shortestBtn');
            const longestBtn = document.getElementById('longestBtn');
            
            if (type === 'shortest') {
                shortestBtn.classList.add('active');
                longestBtn.classList.remove('active');
            } else {
                longestBtn.classList.add('active');
                shortestBtn.classList.remove('active');
            }
            
            // Automatically recalculate
            findPath();
        }

        // ========== FIND ALL PATHS USING DFS ==========
        function findAllPaths(start, end, path = [], visited = new Set()) {
            path.push(start);
            visited.add(start);
            
            let paths = [];
            
            if (start === end) {
                paths.push([...path]);
            } else {
                for (let edge of roadNetwork[start]) {
                    if (!visited.has(edge.to)) {
                        paths = paths.concat(findAllPaths(edge.to, end, path, visited));
                    }
                }
            }
            
            path.pop();
            visited.delete(start);
            return paths;
        }

        // ========== CALCULATE PATH DISTANCE ==========
        function calculatePathDistance(path) {
            let distance = 0;
            for (let i = 0; i < path.length - 1; i++) {
                const from = path[i];
                const to = path[i+1];
                const edge = roadNetwork[from].find(e => e.to === to);
                if (edge) distance += edge.weight;
            }
            return distance;
        }

        // ========== GET PATH BASED ON USER CHOICE (Shortest OR Longest) ==========
        function getPathByChoice(start, end, choice) {
            const allPaths = findAllPaths(start, end);
            
            if (allPaths.length === 0) return null;
            
            // Calculate distances for all paths
            const pathsWithDistances = allPaths.map(path => ({
                path: path,
                distance: calculatePathDistance(path)
            }));
            
            // Sort by distance
            pathsWithDistances.sort((a, b) => a.distance - b.distance);
            
            if (choice === 'shortest') {
                return pathsWithDistances[0];
            } else {
                return pathsWithDistances[pathsWithDistances.length - 1];
            }
        }

        // ========== FLOYD-WARSHALL FOR MATRIX DISPLAY ==========
        function floydWarshall() {
            const n = cities.length;
            
            distMatrix = Array(n).fill().map(() => Array(n).fill(Infinity));
            nextMatrix = Array(n).fill().map(() => Array(n).fill(null));
            
            for (let i = 0; i < n; i++) {
                distMatrix[i][i] = 0;
            }
            
            for (let city of cities) {
                const u = cityIndex[city];
                for (let edge of roadNetwork[city]) {
                    const v = cityIndex[edge.to];
                    distMatrix[u][v] = edge.weight;
                    nextMatrix[u][v] = v;
                }
            }
            
            for (let k = 0; k < n; k++) {
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        if (distMatrix[i][k] + distMatrix[k][j] < distMatrix[i][j]) {
                            distMatrix[i][j] = distMatrix[i][k] + distMatrix[k][j];
                            nextMatrix[i][j] = nextMatrix[i][k];
                        }
                    }
                }
            }
        }

        // ========== DISPLAY DISTANCE MATRIX ==========
        function displayDistanceMatrix() {
            const matrixDiv = document.getElementById('distanceMatrixTable');
            const matrixSection = document.getElementById('matrixSection');
            
            if (!distMatrix.length) {
                matrixSection.style.display = 'none';
                return;
            }
            
            matrixSection.style.display = 'block';
            
            let html = '<table class="distance-matrix">';
            html += '<thead><tr><th>↓ From / To →</th>';
            for (let city of cities) {
                html += `<th>${city}</th>`;
            }
            html += '</tr></thead><tbody>';
            
            for (let i = 0; i < cities.length; i++) {
                html += `<tr><th style="background:rgba(46,204,113,0.2);">${cities[i]}</th>`;
                for (let j = 0; j < cities.length; j++) {
                    const dist = distMatrix[i][j];
                    let displayDist = (dist === Infinity) ? '∞' : dist;
                    html += `<td>${displayDist}</td>`;
                }
                html += '</tr>';
            }
            
            html += '</tbody></table>';
            matrixDiv.innerHTML = html;
        }

        // ========== CALCULATE COSTS IN PKR ==========
        function calculateCosts(distance, path) {
            let tollTotal = 0;
            for (let i = 0; i < path.length - 1; i++) {
                const edgeKey = `${path[i]}-${path[i+1]}`;
                if (tollData[edgeKey]) tollTotal += tollData[edgeKey];
            }
            
            const vehicleCosts = vehicles.map(v => {
                const fuelLiters = distance / v.mileage;
                const fuelCost = fuelLiters * v.fuelPrice;
                const timeHours = distance / v.speed;
                return {
                    ...v,
                    fuelCost: fuelCost.toFixed(2),
                    timeHours: timeHours.toFixed(2),
                    totalCost: (fuelCost + tollTotal).toFixed(2)
                };
            });
            
            return { tollTotal, vehicleCosts };
        }

        // ========== MAP VARIABLES ==========
        let map;
        let currentRouteLayer = null;
        let markers = {};
        let chartInstance = null;

        // ========== UPDATE MAP WITH COLOR ==========
        function updateMap(path, color) {
            if (!map) return;
            
            if (currentRouteLayer) {
                map.removeLayer(currentRouteLayer);
            }
            
            const latlngs = path.map(city => cityCoords[city]);
            currentRouteLayer = L.polyline(latlngs, {
                color: color,
                weight: 6,
                opacity: 0.9,
                dashArray: '8, 8'
            }).addTo(map);
            
            map.fitBounds(currentRouteLayer.getBounds(), { padding: [30, 30] });
            
            Object.values(markers).forEach(m => map.removeLayer(m));
            markers = {};
            
            for (let i = 0; i < path.length; i++) {
                const city = path[i];
                let popupText = city;
                if (i === 0) popupText = `🚀 Start: ${city}`;
                else if (i === path.length - 1) popupText = `🏁 Destination: ${city}`;
                else popupText = `📍 Stop: ${city}`;
                
                markers[city] = L.marker(cityCoords[city]).bindPopup(popupText).addTo(map);
            }
        }

        // ========== UPDATE VEHICLE TABLE ==========
        function updateVehicleTable(vehicleCosts) {
            const tbody = document.getElementById('vehicleBody');
            tbody.innerHTML = vehicleCosts.map(v => `
                <tr>
                    <td>${v.name}</td>
                    <td>${v.speed} km/h</td>
                    <td>${v.mileage} km/L</td>
                    <td>${v.timeHours} hrs</td>
                    <td style="color:#2ecc71;">₨ ${parseInt(v.fuelCost).toLocaleString()}</td>
                    <td style="color:#2ecc71; font-weight:bold;">₨ ${parseInt(v.totalCost).toLocaleString()}</td>
                </tr>
            `).join('');
        }

        // ========== UPDATE CHART ==========
        function updateChart(vehicleCosts) {
            const ctx = document.getElementById('costChart').getContext('2d');
            if (chartInstance) chartInstance.destroy();
            
            const isLightMode = document.body.classList.contains('light-mode');
            const textColor = isLightMode ? '#1e2a3a' : 'white';
            const gridColor = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
            
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: vehicleCosts.map(v => v.name),
                    datasets: [{
                        label: 'Total Cost (PKR)',
                        data: vehicleCosts.map(v => parseFloat(v.totalCost)),
                        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'],
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: 'top', labels: { color: textColor, font: { size: 11 } } }
                    },
                    scales: {
                        y: { 
                            ticks: { color: textColor, callback: function(value) { return '₨ ' + value; } }, 
                            grid: { color: gridColor } 
                        },
                        x: { ticks: { color: textColor } }
                    }
                }
            });
        }

        // ========== MAIN FUNCTION: FIND PATH (Shortest OR Longest) ==========
        function findPath() {
            const start = document.getElementById('startLocation').value;
            const dest = document.getElementById('destLocation').value;
            
            if (start === dest) {
                alert("❌ Start and destination cannot be same!");
                return;
            }
            
            // Run Floyd-Warshall for matrix
            floydWarshall();
            displayDistanceMatrix();
            
            // Get path based on user choice
            const result = getPathByChoice(start, dest, currentPathType);
            
            if (!result) {
                document.getElementById('routePath').innerHTML = "❌ No path found!";
                document.getElementById('distanceValue').innerHTML = "--";
                return;
            }
            
            const path = result.path;
            const distance = result.distance;
            const pathTypeText = currentPathType === 'shortest' ? 'Shortest Path' : 'Longest Path';
            const routeColor = currentPathType === 'shortest' ? '#2ecc71' : '#e74c3c';
            
            // Update UI
            document.getElementById('distanceValue').innerHTML = distance;
            document.getElementById('routePath').innerHTML = `📍 ${pathTypeText}: ${path.join(' → ')} | Distance: ${distance} km`;
            
            // Update map with color
            updateMap(path, routeColor);
            
            // Calculate costs
            const costs = calculateCosts(distance, path);
            
            const carCost = costs.vehicleCosts[0];
            document.getElementById('fuelValue').innerHTML = `₨ ${parseInt(carCost.fuelCost).toLocaleString()}`;
            document.getElementById('tollValue').innerHTML = `₨ ${costs.tollTotal.toLocaleString()}`;
            document.getElementById('timeValue').innerHTML = carCost.timeHours;
            
            // Update table and chart
            updateVehicleTable(costs.vehicleCosts);
            updateChart(costs.vehicleCosts);
        }

        // ========== EXPORT PDF ==========
        function exportPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const start = document.getElementById('startLocation').value;
            const dest = document.getElementById('destLocation').value;
            const distance = document.getElementById('distanceValue').innerHTML;
            const fuel = document.getElementById('fuelValue').innerHTML;
            const toll = document.getElementById('tollValue').innerHTML;
            const time = document.getElementById('timeValue').innerHTML;
            const routeText = document.getElementById('routePath').innerHTML;
            const pathType = currentPathType === 'shortest' ? 'Shortest Path' : 'Longest Path';
            
            doc.setFontSize(20);
            doc.text("RouteMaster Pro - Trip Report", 20, 20);
            doc.setFontSize(12);
            doc.text(`Path Type: ${pathType}`, 20, 35);
            doc.text(`Algorithm: Floyd-Warshall + DFS`, 20, 45);
            doc.text(`Currency: Pakistani Rupee (PKR)`, 20, 55);
            doc.text(`From: ${start}`, 20, 70);
            doc.text(`To: ${dest}`, 20, 80);
            doc.text(`Total Distance: ${distance} km`, 20, 90);
            doc.text(`Estimated Time: ${time} hours`, 20, 100);
            doc.text(`Fuel Cost: ${fuel}`, 20, 110);
            doc.text(`Toll Tax: ${toll}`, 20, 120);
            
            const fuelNum = parseFloat(fuel.replace('₨', '').replace(',', '')) || 0;
            const tollNum = parseFloat(toll.replace('₨', '').replace(',', '')) || 0;
            doc.text(`Total Cost: ₨ ${(fuelNum + tollNum).toLocaleString()}`, 20, 130);
            doc.text(`Route: ${routeText.replace('📍 Shortest Path: ', '').replace('📍 Longest Path: ', '')}`, 20, 140);
            
            doc.save("route_report.pdf");
        }

        // ========== INITIALIZE MAP ==========
        function initMap() {
            map = L.map('map').setView([25.0, 67.5], 8);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        }

        // ========== THEME TOGGLE ==========
        function toggleTheme() {
            const body = document.body;
            const toggleBtn = document.getElementById('themeToggleBtn');
            
            if (body.classList.contains('dark-mode')) {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                toggleBtn.innerHTML = '☀️';
                localStorage.setItem('route_theme', 'light');
            } else {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                toggleBtn.innerHTML = '🌙';
                localStorage.setItem('route_theme', 'dark');
            }
            
            if (chartInstance) {
                const isLightMode = body.classList.contains('light-mode');
                const textColor = isLightMode ? '#1e2a3a' : 'white';
                const gridColor = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
                chartInstance.options.plugins.legend.labels.color = textColor;
                chartInstance.options.scales.y.ticks.color = textColor;
                chartInstance.options.scales.x.ticks.color = textColor;
                chartInstance.options.scales.y.grid.color = gridColor;
                chartInstance.update();
            }
        }

        // ========== LOAD SAVED THEME ==========
        function loadSavedTheme() {
            const savedTheme = localStorage.getItem('route_theme');
            const body = document.body;
            const toggleBtn = document.getElementById('themeToggleBtn');
            
            if (savedTheme === 'light') {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                toggleBtn.innerHTML = '☀️';
            } else {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                toggleBtn.innerHTML = '🌙';
            }
        }

        // ========== INITIALIZE ==========
        function init() {
            initMap();
            loadSavedTheme();
            floydWarshall();
            displayDistanceMatrix();
            setTimeout(() => {
                findPath();
            }, 500);
        }
        
        init();
        
        window.findPath = findPath;
        window.selectPathType = selectPathType;
        window.toggleTheme = toggleTheme;
        window.exportPDF = exportPDF;
