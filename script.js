const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        let selectedNode = null;
        let isDragging = false;

        const grafo = {
            numVertices: 8,
            listaAdyacencia: [
                [{ destino: 1, peso: 16 }, { destino: 2, peso: 10 }, { destino: 3, peso: 5 }],
                [{ destino: 2, peso: 2 }, { destino: 0, peso: 16 }, { destino: 6, peso: 6 }, { destino: 5, peso: 4 }],
                [{ destino: 3, peso: 24 }, { destino: 0, peso: 10 }, { destino: 1, peso: 2 }, { destino: 4, peso: 10 }, { destino: 5, peso: 12 }],
                [{ destino: 4, peso: 15 }, { destino: 0, peso: 5 }],
                [{ destino: 5, peso: 3 },{ destino: 3, peso: 15 },{ destino: 2, peso: 10 }, { destino: 7, peso: 5 }],
                [{ destino: 6, peso: 8 }, { destino: 7, peso: 16 }, { destino: 4, peso: 3 }, { destino: 1, peso: 4 },{ destino: 2, peso: 12 }],
                [{ destino: 7, peso: 7 },{ destino: 1, peso: 6 },{ destino: 5, peso: 8 }],
                [{ destino: 6, peso: 7 },{ destino: 4, peso: 5 },{ destino: 5, peso: 16 }],
                []
            ],
            Posx: [100, 200, 200, 200, 400, 400, 400, 500],
            Posy: [250, 100, 250, 400, 400, 250, 100, 250]
        };

        const circleOffset = 5;

        function updateNodePosition(nodeIndex, x, y) {
            grafo.Posx[nodeIndex] = x;
            grafo.Posy[nodeIndex] = y;
            redrawCanvas();
        }

        function getDistance(x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function checkNodeClicked(x, y) {
            for (let i = 0; i < grafo.numVertices; i++) {
                const posX = grafo.Posx[i];
                const posY = grafo.Posy[i];
                const distance = getDistance(x, y, posX, posY);
                if (distance <= circleOffset) {
                    return i;
                }
            }
            return null;
        }

        canvas.addEventListener('mousedown', function (event) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            selectedNode = checkNodeClicked(mouseX, mouseY);
            isDragging = true;
        });

        function handleMouseMove(event) {
            if (selectedNode !== null && isDragging) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                updateNodePosition(selectedNode, mouseX, mouseY);
            }
        }

        function handleMouseUp() {
            selectedNode = null;
            isDragging = false;
        }

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        function redrawCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < grafo.numVertices; i++) {
                const posX = grafo.Posx[i];
                const posY = grafo.Posy[i];

                ctx.beginPath();
                ctx.arc(posX, posY, circleOffset, 0, 2 * Math.PI);
                ctx.fillStyle = 'black'; 
                ctx.fill();
                ctx.closePath();

                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(i, posX+12, posY-10);
            }

            for (let i = 0; i < grafo.numVertices; i++) {
                const posX1 = grafo.Posx[i];
                const posY1 = grafo.Posy[i];
                const adyacentes = grafo.listaAdyacencia[i];

                for (let j = 0; j < adyacentes.length; j++) {
                    const destino = adyacentes[j].destino;
                    const peso = adyacentes[j].peso;
                    const posX2 = grafo.Posx[destino];
                    const posY2 = grafo.Posy[destino];

                    // Dibujar la línea
                    ctx.beginPath();
                    ctx.moveTo(posX1, posY1);
                    ctx.lineTo(posX2, posY2);
                    ctx.stroke();
                    ctx.closePath();

                    const centerX = (posX1 + posX2) / 2;
                    const centerY = (posY1 + posY2) / 2;

                    ctx.font = '14px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(peso, centerX+8, centerY-8);
                }
            }
        }

        redrawCanvas();

        function dijkstra(inicio, fin) {
            const distancia = Array(grafo.numVertices).fill(Infinity);
            const visitado = Array(grafo.numVertices).fill(false);
            const padres = Array(grafo.numVertices).fill(null);

            distancia[inicio] = 0;

            for (let i = 0; i < grafo.numVertices - 1; i++) {
                let nodoMinDist = -1;
                for (let j = 0; j < grafo.numVertices; j++) {
                    if (!visitado[j] && (nodoMinDist === -1 || distancia[j] < distancia[nodoMinDist])) {
                        nodoMinDist = j;
                    }
                }

                visitado[nodoMinDist] = true;

                const adyacentes = grafo.listaAdyacencia[nodoMinDist];
                for (let j = 0; j < adyacentes.length; j++) {
                    const destino = adyacentes[j].destino;
                    const peso = adyacentes[j].peso;
                    const nuevaDistancia = distancia[nodoMinDist] + peso;
                    if (nuevaDistancia < distancia[destino]) {
                        distancia[destino] = nuevaDistancia;
                        padres[destino] = nodoMinDist;
                    }
                }
            }

            const ruta = obtenerRuta(padres, inicio, fin);
            return { distancia: distancia[fin], ruta };
        }

        function obtenerRuta(padres, inicio, fin) {
            const ruta = [];
            let actual = fin;
            while (actual !== null) {
                ruta.unshift(actual);
                actual = padres[actual];
            }
            return ruta;
        }

        function drawShortestPath(path) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;

            for (let i = 0; i < path.length - 1; i++) {
                const origen = path[i];
                const destino = path[i + 1];

                const posX1 = grafo.Posx[origen];
                const posY1 = grafo.Posy[origen];
                const posX2 = grafo.Posx[destino];
                const posY2 = grafo.Posy[destino];

                ctx.beginPath();
                ctx.moveTo(posX1, posY1);
                ctx.lineTo(posX2, posY2);
                ctx.stroke();
                ctx.closePath();
            }
        }

        document.getElementById('calcular').addEventListener('click', function () {
            const inicio = parseInt(prompt('Ingrese el nodo de inicio:'));
            const fin = parseInt(prompt('Ingrese el nodo de fin:'));

            const resultado = dijkstra(inicio, fin);
            alert(`Distancia más corta: ${resultado.distancia}`);
            drawShortestPath(resultado.ruta);
        });