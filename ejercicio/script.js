const DATA_SOURCE_URL = "https://proyecto-ia-30fcd-default-rtdb.firebaseio.com/customers.json";

let allCustomers = [];

async function fetchCustomers() {
  try {
    const response = await fetch(DATA_SOURCE_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const customersObj = data.customers || data;
    allCustomers = Object.entries(customersObj).map(([id, record]) => ({
      id,
      ...record,
    }));

    setConnectionStatus(true);
    renderAll(allCustomers);
  } catch (error) {
    console.error("Error al obtener datos de TrendGear:", error);
    setConnectionStatus(false);
    showEmptyState("No fue posible cargar los datos. Revisa la consola para más detalle.");
  }
}

function setConnectionStatus(isLive) {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  if (isLive) {
    dot.classList.add("live");
    text.textContent = `Conectado · ${allCustomers.length} registros sincronizados`;
  } else {
    dot.classList.remove("live");
    text.textContent = "Sin conexión a la fuente de datos";
  }
}
function renderKPIs(customers) {
  const total = customers.length;
  const revenue = customers.reduce((sum, c) => sum + parseFloat(c["Amount Spent"]), 0);
  const avgTicket = total ? revenue / total : 0;
  const avgAge = total
    ? customers.reduce((sum, c) => sum + Number(c["Age"]), 0) / total
    : 0;

  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiRevenue").textContent = formatCurrency(revenue);
  document.getElementById("kpiAvgTicket").textContent = formatCurrency(avgTicket);
  document.getElementById("kpiAvgAge").textContent = `${avgAge.toFixed(1)} años`;
}

function formatCurrency(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const AVATAR_PALETTE = ["#007bff", "#34c471", "#f2a541", "#e05d8f", "#8a63d2", "#2bb6c4"];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function avatarColor(name) {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function renderAvatar(name) {
  return `<div class="avatar" style="background:${avatarColor(name)}">${getInitials(name)}</div>`;
}
const PRODUCT_ICONS = {
  laptop: `<path d="M4 5h16v10H4z"/><path d="M2 19h20l-1.5-2h-17z"/>`,
  earbuds: `<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M8 12v3a2 2 0 0 0 2 2"/><path d="M16 12v3a2 2 0 0 1-2 2"/>`,
  smartwatch: `<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 3h6v4H9zM9 17h6v4H9z"/>`,
  keyboard: `<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/>`,
  monitor: `<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>`,
  mouse: `<rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 3v7"/>`,
  speaker: `<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="15" r="3"/><path d="M12 6h.01"/>`,
  tablet: `<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>`,
  hub: `<rect x="4" y="9" width="16" height="6" rx="2"/><path d="M8 15v3M16 15v3M8 9V6M16 9V6"/>`,
  headphones: `<path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="6" rx="1"/><rect x="17" y="13" width="4" height="6" rx="1"/>`,
  ssd: `<rect x="4" y="7" width="16" height="10" rx="2"/><path d="M8 12h8"/>`,
  webcam: `<circle cx="12" cy="10" r="5"/><circle cx="12" cy="10" r="1.5"/><path d="M8 20h8M12 15v5"/>`,
};

function matchProductCategory(productName) {
  const name = productName.toLowerCase();
  if (name.includes("laptop")) return "laptop";
  if (name.includes("earbud")) return "earbuds";
  if (name.includes("smartwatch")) return "smartwatch";
  if (name.includes("keyboard")) return "keyboard";
  if (name.includes("monitor")) return "monitor";
  if (name.includes("mouse")) return "mouse";
  if (name.includes("speaker")) return "speaker";
  if (name.includes("tablet")) return "tablet";
  if (name.includes("hub")) return "hub";
  if (name.includes("headphone")) return "headphones";
  if (name.includes("ssd")) return "ssd";
  if (name.includes("webcam")) return "webcam";
  return "laptop";
}

function renderProductIcon(productName) {
  const category = matchProductCategory(productName);
  const paths = PRODUCT_ICONS[category];
  return `
    <svg class="product-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      ${paths}
    </svg>
  `;
}
function renderCustomerCards(customers) {
  const grid = document.getElementById("customerGrid");
  grid.innerHTML = "";

  if (customers.length === 0) {
    showEmptyState("No se encontraron clientes con esos filtros.");
    return;
  }

  customers.forEach((c) => {
    const card = document.createElement("article");
    card.className = "customer-card";
    card.innerHTML = `
      <div class="card-top">
        ${renderAvatar(c["Name"])}
        <div class="card-heading">
          <div class="card-name">${c["Name"]}</div>
          <div class="card-id">${c.id}</div>
        </div>
        <span class="membership-chip ${c["Membership Status"]}">${c["Membership Status"]}</span>
      </div>
      <div class="card-body">
        <div class="card-product">
          ${renderProductIcon(c["Product Purchased"])}
          <strong>${c["Product Purchased"]}</strong>
        </div>
        <div>${c["City"]} · ${c["Age"]} años</div>
        <div>${c["Payment Method"]}</div>
        <div>Compra: ${c["Purchase Date"]} · Último acceso: ${c["Last Login Date"]}</div>
      </div>
      <div class="card-amount">${formatCurrency(parseFloat(c["Amount Spent"]))}</div>
    `;
    grid.appendChild(card);
  });
}

function showEmptyState(message) {
  const grid = document.getElementById("customerGrid");
  grid.innerHTML = `<div class="empty-state">${message}</div>`;
}
function renderAgeHistogram(customers) {
  const buckets = [
    { label: "13-24", min: 13, max: 24, count: 0 },
    { label: "25-34", min: 25, max: 34, count: 0 },
    { label: "35-44", min: 35, max: 44, count: 0 },
    { label: "45-54", min: 45, max: 54, count: 0 },
    { label: "55-64", min: 55, max: 64, count: 0 },
    { label: "65+",   min: 65, max: 200, count: 0 },
  ];

  customers.forEach((c) => {
    const age = Number(c["Age"]);
    const bucket = buckets.find((b) => age >= b.min && age <= b.max);
    if (bucket) bucket.count += 1;
  });

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  const container = document.getElementById("ageHistogram");

  container.innerHTML = buckets
    .map(
      (b) => `
      <div class="bar-group">
        <div class="bar" style="height:${(b.count / maxCount) * 100}%"></div>
        <span class="bar-label">${b.label}</span>
      </div>
    `
    )
    .join("");
}

function renderAll(customers) {
  renderKPIs(customers);
  renderCustomerCards(customers);
  renderAgeHistogram(customers);
}

function applyFilters() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const membership = document.getElementById("membershipFilter").value;

  const filtered = allCustomers.filter((c) => {
    const matchesQuery =
      !query ||
      c["Name"].toLowerCase().includes(query) ||
      c["Product Purchased"].toLowerCase().includes(query) ||
      c["City"].toLowerCase().includes(query);

    const matchesMembership = !membership || c["Membership Status"] === membership;

    return matchesQuery && matchesMembership;
  });

  renderCustomerCards(filtered);
}

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("membershipFilter").addEventListener("change", applyFilters);

const hamburgerBtn = document.getElementById("hamburgerBtn");
const mainNav = document.getElementById("mainNav");

hamburgerBtn.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  hamburgerBtn.classList.toggle("open", isOpen);
  hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    mainNav.classList.remove("open");
    hamburgerBtn.classList.remove("open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
  });
});
fetchCustomers();