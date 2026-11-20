document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'bitego_carrito_v1';
    const IVA_RATE = 0.16;

    let carrito = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Elementos del DOM
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    const tarjetas = document.querySelectorAll('.tarjeta-producto');
    const addBtns = document.querySelectorAll('.btn-anadir-carrito');

    const panelCarrito = document.getElementById('panel-carrito');
    const backdrop = document.getElementById('backdrop-carrito');
    const btnAbrir = document.getElementById('btn-abrir-carrito');
    const btnCerrar = document.getElementById('btn-cerrar-carrito');

    const itemsContainer = document.getElementById('carrito-items');
    const contadorEl = document.getElementById('contador-carrito');
    const subtotalEl = document.getElementById('carrito-subtotal');
    const ivaEl = document.getElementById('carrito-iva');
    const totalEl = document.getElementById('carrito-total');
    const formPedido = document.getElementById('form-pedido');

    // Filtro por categorias
    filtroBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filtroBtns.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');

            const filtro = btn.dataset.filter;
            tarjetas.forEach(tarjeta => {
                const catId = tarjeta.dataset.category;
                if (filtro === 'todos' || catId === filtro) {
                    tarjeta.style.display = '';
                } else {
                    tarjeta.style.display = 'none';
                }
            });
        });
    });

    // Abrir / Cerrar panel del carrito
    function abrirCarrito() {
        panelCarrito?.classList.remove('oculto');
        backdrop?.classList.remove('oculto');
    }

    function cerrarCarrito() {
        panelCarrito?.classList.add('oculto');
        backdrop?.classList.add('oculto');
    }

    btnAbrir?.addEventListener('click', abrirCarrito);
    btnCerrar?.addEventListener('click', cerrarCarrito);
    backdrop?.addEventListener('click', cerrarCarrito);

    // Guardar y renderizar carrito
    function guardarYRenderizar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
        renderCarrito();
    }

    function renderCarrito() {
        const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        if (contadorEl) contadorEl.textContent = totalUnidades;

        if (!itemsContainer) return;

        if (carrito.length === 0) {
            itemsContainer.innerHTML = '<p class="carrito-vacio">Aún no has añadido platillos.</p>';
            if (subtotalEl) subtotalEl.textContent = '$0.00';
            if (ivaEl) ivaEl.textContent = '$0.00';
            if (totalEl) totalEl.textContent = '$0.00';
            return;
        }

        itemsContainer.innerHTML = carrito.map(item => `
            <div class="item-carrito" data-id="${item.id}">
                <div class="item-info">
                    <strong>${item.nombre}</strong>
                    <span>$${item.precio.toFixed(2)} c/u</span>
                </div>
                <div class="item-controles">
                    <button type="button" class="btn-qty menos" data-id="${item.id}">−</button>
                    <span class="qty-valor">${item.cantidad}</span>
                    <button type="button" class="btn-qty mas" data-id="${item.id}">+</button>
                </div>
            </div>
        `).join('');

        const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        const iva = subtotal * IVA_RATE;
        const total = subtotal + iva;

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (ivaEl) ivaEl.textContent = `$${iva.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    }

    // Añadir producto
    addBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const nombre = btn.dataset.nombre;
            const precio = Number(btn.dataset.precio);

            const existente = carrito.find(item => item.id === id);
            if (existente) {
                existente.cantidad += 1;
            } else {
                carrito.push({ id, nombre, precio, cantidad: 1 });
            }

            guardarYRenderizar();
            abrirCarrito();
        });
    });

    // Sumar / restar cantidades dentro del carrito
    itemsContainer?.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-qty');
        if (!btn) return;

        const id = Number(btn.dataset.id);
        const idx = carrito.findIndex(item => item.id === id);
        if (idx === -1) return;

        if (btn.classList.contains('mas')) {
            carrito[idx].cantidad += 1;
        } else if (btn.classList.contains('menos')) {
            carrito[idx].cantidad -= 1;
            if (carrito[idx].cantidad <= 0) {
                carrito.splice(idx, 1);
            }
        }

        guardarYRenderizar();
    });

    // Envio del pedido
    formPedido?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (carrito.length === 0) {
            alert('Añade al menos un platillo antes de enviar el pedido.');
            return;
        }

        const numero_mesa = document.getElementById('numero-mesa')?.value.trim();
        const mesero_nombre = document.getElementById('mesero-nombre')?.value.trim();
        const notas = document.getElementById('notas-pedido')?.value.trim();

        const btnSubmit = document.getElementById('btn-procesar-pedido');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Enviando a cola...';
        }

        try {
            const respuesta = await fetch('/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numero_mesa,
                    mesero_nombre,
                    notas,
                    items: carrito
                })
            });

            const data = await respuesta.json();

            if (!respuesta.ok || !data.ok) {
                alert(data.mensaje || 'Error al registrar el pedido.');
                return;
            }

            // Limpiar carrito y formulario
            carrito = [];
            localStorage.removeItem(STORAGE_KEY);
            formPedido.reset();
            renderCarrito();
            cerrarCarrito();

            alert(
                `Pedido ${data.pedido.codigo_comprobante} enviado a la cola.\n` +
                `Mesa: ${data.pedido.numero_mesa} | Atendió: ${data.pedido.mesero_nombre}\n` +
                `Estado: ${data.pedido.estado.toUpperCase()} | Total: $${data.pedido.total.toFixed(2)}`
            );

            window.location.reload();
        } catch (err) {
            console.error('Error de red al enviar pedido:', err);
            alert('No hubo conexión con el servidor al enviar el pedido.');
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Enviar a cola →';
            }
        }

    });

    // Carrusel de destacados
const track = document.getElementById('carrusel-track');
const btnPrev = document.getElementById('btn-carrusel-prev');
const btnNext = document.getElementById('btn-carrusel-next');

if (track && btnPrev && btnNext) {
    const paso = 320;
    btnNext.addEventListener('click', () => {
        track.scrollBy({ left: paso, behavior: 'smooth' });
    });
    btnPrev.addEventListener('click', () => {
        track.scrollBy({ left: -paso, behavior: 'smooth' });
    });
}

// Efecto parallax 
const heroParallaxImg = document.querySelector('.hero-image-box img');
if (heroParallaxImg) {
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        const offset = Math.min(Math.max(y * 0.18, 0), 55);
        heroParallaxImg.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
}
});