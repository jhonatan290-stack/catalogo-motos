const catalogo = document.getElementById("catalogo");
const buscador = document.getElementById("buscador");
const selectMarca = document.getElementById("marca");
const selectTipo = document.getElementById("tipo");
const sinResultados = document.getElementById("sin-resultados");

// Color representativo por marca
const COLORES_MARCA = {
  "Honda": "#E10600",
  "Yamaha": "#0033A0",
  "Kawasaki": "#00A651",
  "Ducati": "#FF1E1E",
  "BMW": "#0091FF",
  "Suzuki": "#FFD60A",
  "KTM": "#FF6600",
  "Triumph": "#7B2CBF",
  "Aprilia": "#FF006E",
  "MV Agusta": "#00B4D8"
};

// Color por tipo de moto
const COLORES_TIPO = {
  "Deportiva": "#FF006E",
  "Naked": "#4CC9F0",
  "Aventura": "#FB8500",
  "Custom": "#B5179E"
};

// Llenar el filtro de marcas dinámicamente
const marcas = [...new Set(MOTOS.map(m => m.marca))].sort();
marcas.forEach(marca => {
  const opcion = document.createElement("option");
  opcion.value = marca;
  opcion.textContent = marca;
  selectMarca.appendChild(opcion);
});

// Llenar el filtro de tipos dinámicamente
const tipos = [...new Set(MOTOS.map(m => m.tipo))].sort();
tipos.forEach(tipo => {
  const opcion = document.createElement("option");
  opcion.value = tipo;
  opcion.textContent = tipo;
  selectTipo.appendChild(opcion);
});

function renderizar(motos) {
  catalogo.innerHTML = "";
  sinResultados.hidden = motos.length > 0;

  motos.forEach(moto => {
    const colorMarca = COLORES_MARCA[moto.marca] || "#FFFFFF";
    const colorTipo = COLORES_TIPO[moto.tipo] || "#FFFFFF";
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";
    tarjeta.style.borderTop = `5px solid ${colorMarca}`;
    tarjeta.innerHTML = `
      <img src="${moto.imagen}" alt="${moto.marca} ${moto.modelo}">
      <div class="tarjeta-info">
        <span class="badge" style="background-color:${colorTipo};border-color:${colorTipo};color:white;">${moto.tipo}</span>
        <h2 style="color:${colorMarca}">${moto.marca}</h2>
        <p class="modelo">${moto.modelo}</p>
        <ul>
          <li><strong>Motor:</strong> ${moto.motor}</li>
          <li><strong>Cilindraje:</strong> ${moto.cilindraje} cc</li>
          <li><strong>Potencia:</strong> ${moto.potencia}</li>
          <li><strong>Torque:</strong> ${moto.torque}</li>
          <li><strong>Peso:</strong> ${moto.peso}</li>
          <li><strong>Precio:</strong> ${moto.precio}</li>
        </ul>
      </div>
    `;
    catalogo.appendChild(tarjeta);
  });
}

function filtrar() {
  const texto = buscador.value.toLowerCase();
  const marca = selectMarca.value;
  const tipo = selectTipo.value;

  const filtradas = MOTOS.filter(moto => {
    const coincideTexto = moto.modelo.toLowerCase().includes(texto) ||
                          moto.marca.toLowerCase().includes(texto);
    const coincideMarca = marca === "todas" || moto.marca === marca;
    const coincideTipo = tipo === "todos" || moto.tipo === tipo;
    return coincideTexto && coincideMarca && coincideTipo;
  });

  renderizar(filtradas);
}

buscador.addEventListener("input", filtrar);
selectMarca.addEventListener("change", filtrar);
selectTipo.addEventListener("change", filtrar);

renderizar(MOTOS);

// ========== COMPARADOR ==========
const selectMotoA = document.getElementById("motoA");
const selectMotoB = document.getElementById("motoB");
const selectMarcaA = document.getElementById("marcaA");
const selectMarcaB = document.getElementById("marcaB");
const resultado = document.getElementById("resultadoComparacion");

// Llenar selects de marcas
[...new Set(MOTOS.map(m => m.marca))].sort().forEach(marca => {
  selectMarcaA.insertAdjacentHTML("beforeend", `<option value="${marca}">${marca}</option>`);
  selectMarcaB.insertAdjacentHTML("beforeend", `<option value="${marca}">${marca}</option>`);
});

// Cuando eliges marca, llenar modelos agrupados por tipo (Naked, Deportiva, Aventura, Custom)
function llenarModelos(selectMarca, selectModelo) {
  selectModelo.innerHTML = '<option value="">Elige un modelo</option>';
  const marca = selectMarca.value;
  if (!marca) {
    selectModelo.innerHTML = '<option value="">Primero elige marca</option>';
    return;
  }
  const modelos = MOTOS.filter(m => m.marca === marca);
  const tipos = [...new Set(modelos.map(m => m.tipo))].sort();
  tipos.forEach(tipo => {
    let optgroup = `<optgroup label="${tipo}">`;
    modelos.filter(m => m.tipo === tipo).forEach(m => {
      optgroup += `<option value="${m.modelo}">${m.modelo}</option>`;
    });
    optgroup += `</optgroup>`;
    selectModelo.insertAdjacentHTML("beforeend", optgroup);
  });
}

selectMarcaA.addEventListener("change", () => { llenarModelos(selectMarcaA, selectMotoA); renderComparador(); });
selectMarcaB.addEventListener("change", () => { llenarModelos(selectMarcaB, selectMotoB); renderComparador(); });

function num(str) {
  return parseFloat(String(str).replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
}

function hp(moto) { return num(moto.potencia.split(" hp")[0]); }
function nm(moto) { return num(moto.torque.split(" Nm")[0]); }
function kg(moto) { return num(moto.peso); }
function cop(moto) { return num(moto.precio.replace(/\./g, "")); }
function cc(moto) { return moto.cilindraje; }

function modeloSeleccionado(selectMarca, selectModelo) {
  const marca = selectMarca.value;
  const modelo = selectModelo.value;
  if (!marca || !modelo) return null;
  return MOTOS.find(m => m.marca === marca && m.modelo === modelo) || null;
}

function renderComparador() {
  const a = modeloSeleccionado(selectMarcaA, selectMotoA);
  const b = modeloSeleccionado(selectMarcaB, selectMotoB);

  if (!a || !b) {
    resultado.innerHTML = "<p>Selecciona marca y modelo en ambos lados para comparar.</p>";
    return;
  }

  const filas = [
    { nombre: "Cilindraje (cc)", va: cc(a), vb: cc(b), mejor: "igual" },
    { nombre: "Potencia (hp)", va: hp(a), vb: hp(b), mejor: "mayor" },
    { nombre: "Torque (Nm)", va: nm(a), vb: nm(b), mejor: "mayor" },
    { nombre: "Peso (kg)", va: kg(a), vb: kg(b), mejor: "menor" },
    { nombre: "Precio (COP)", va: cop(a), vb: cop(b), mejor: "menor" }
  ];

  let html = `<table>
    <tr><th>Característica</th><th>${a.marca} ${a.modelo}</th><th>${b.marca} ${b.modelo}</th></tr>`;

  filas.forEach(f => {
    let claseA = "", claseB = "";
    if (f.mejor === "mayor") {
      if (f.va > f.vb) claseA = "ganador";
      else if (f.vb > f.va) claseB = "ganador";
    } else if (f.mejor === "menor") {
      if (f.va < f.vb) claseA = "ganador";
      else if (f.vb < f.va) claseB = "ganador";
    }
    const fmt = (v) => f.nombre.includes("Precio") ? v.toLocaleString("es-CO").replace(/,/g, ".") : v;
    html += `<tr><td>${f.nombre}</td><td class="${claseA}">${fmt(f.va)}</td><td class="${claseB}">${fmt(f.vb)}</td></tr>`;
  });

  html += `</table>`;
  resultado.innerHTML = html;
}

selectMotoA.addEventListener("change", renderComparador);
selectMotoB.addEventListener("change", renderComparador);
renderComparador();

// Duplicar selects de marca para B ya está; también permitir cambiar modelo actualiza
