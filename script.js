// script.js

document.addEventListener('DOMContentLoaded', () => {
    const CART_KEY = 'koperasi_cart_v1';

    // Utility: format angka ke Rupiah
    function formatRupiah(angka) {
        return 'Rp ' + Number(angka).toLocaleString('id-ID');
    }

    // Load / Save cart to localStorage
    function loadCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Gagal membaca cart dari localStorage', e);
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error('Gagal menyimpan cart ke localStorage', e);
        }
    }

    // Add item to cart
    function addToCart(nama, harga, jumlah = 1) {
        const cart = loadCart();
        const idx = cart.findIndex(i => i.nama === nama);
        if (idx > -1) {
            cart[idx].jumlah = (cart[idx].jumlah || 0) + jumlah;
        } else {
            cart.push({ nama, harga: Number(harga), jumlah });
        }
        saveCart(cart);
        // Minimal feedback
        try { alert(`${nama} berhasil ditambahkan ke keranjang.`); } catch (e) {}
        updateCartUI();
    }

    // Remove item
    function removeFromCart(nama) {
        let cart = loadCart();
        cart = cart.filter(i => i.nama !== nama);
        saveCart(cart);
        updateCartUI();
    }

    // Update quantity
    function updateQuantity(nama, jumlah) {
        const cart = loadCart();
        const idx = cart.findIndex(i => i.nama === nama);
        if (idx > -1) {
            cart[idx].jumlah = Math.max(1, Number(jumlah) || 1);
            saveCart(cart);
            updateCartUI();
        }
    }

    // Render functions for different page layouts
    function renderListWidget() {
        const keranjangList = document.getElementById('keranjang-list');
        const totalHargaDisplay = document.getElementById('total-harga');
        if (!keranjangList || !totalHargaDisplay) return;

        const cart = loadCart();
        keranjangList.innerHTML = '';
        if (cart.length === 0) {
            keranjangList.innerHTML = '<li>Keranjang belanja Anda kosong.</li>';
            totalHargaDisplay.textContent = 'Total Belanja: Rp 0';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            const li = document.createElement('li');
            const subtotal = item.harga * item.jumlah;
            li.innerHTML = `<span>${item.nama} (${item.jumlah}x)</span> <strong>${formatRupiah(subtotal)}</strong>`;
            keranjangList.appendChild(li);
            total += subtotal;
        });
        totalHargaDisplay.textContent = `Total Belanja: ${formatRupiah(total)}`;
    }

    function renderCartTable() {
        const tbody = document.getElementById('cart-items');
        const totalSpan = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout');
        if (!tbody || !totalSpan) return;

        const cart = loadCart();
        tbody.innerHTML = '';
        if (cart.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="4">Keranjang kosong.</td>`;
            tbody.appendChild(tr);
            totalSpan.textContent = '0';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        cart.forEach(item => {
            const tr = document.createElement('tr');
            const subtotal = item.harga * item.jumlah;
            total += subtotal;

            tr.innerHTML = `
                <td>${item.nama}</td>
                <td>${formatRupiah(item.harga)}</td>
                <td><input class="qty-input" data-nama="${escapeHtml(item.nama)}" type="number" min="1" value="${item.jumlah}" style="width:60px"></td>
                <td>${formatRupiah(subtotal)} <button class="remove-item" data-nama="${escapeHtml(item.nama)}" style="margin-left:10px">Hapus</button></td>
            `;
            tbody.appendChild(tr);
        });

        totalSpan.textContent = `${total}`;
        if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
    }

    // Small helper to avoid breaking HTML attributes when names contain quotes
    function escapeHtml(str) {
        return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Update all UI widgets available on the page
    function updateCartUI() {
        renderListWidget();
        renderCartTable();
    }

    // Attach handlers to product buttons
    document.querySelectorAll('.btn-beli').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const nama = btn.getAttribute('data-nama');
            const harga = Number(btn.getAttribute('data-harga')) || 0;
            if (!nama || !harga) {
                console.error('Data produk tidak valid pada tombol ini.');
                return;
            }
            addToCart(nama, harga, 1);
        });
    });

    // Event delegation for remove buttons and qty changes in cart table
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('remove-item')) {
            const nama = e.target.getAttribute('data-nama');
            if (nama) removeFromCart(nama);
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target && e.target.classList.contains('qty-input')) {
            const nama = e.target.getAttribute('data-nama');
            const jumlah = Number(e.target.value);
            if (nama) updateQuantity(nama, jumlah);
        }
    });

    // Optional: checkout button handler (currently just clears cart)
    const checkoutBtn = document.getElementById('checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = loadCart();
            if (cart.length === 0) return;
            // In a real app you'd send cart to server; here we clear and confirm
            if (confirm('Lanjutkan ke checkout? (demo akan mengosongkan keranjang)')) {
                localStorage.removeItem(CART_KEY);
                updateCartUI();
                alert('Terima kasih! Keranjang dikosongkan (demo).');
            }
        });
    }

    // Initialize UI on page load
    updateCartUI();
});
