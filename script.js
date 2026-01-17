async function carregarPainel() {
  const pendentes = await fetch("/pendentes").then(r => r.json());
  const motoristas = await fetch("/motoristas").then(r => r.json());
  const painel = document.getElementById("painel");
  painel.innerHTML = "";

  if (pendentes.length === 0) {
    painel.innerHTML = "<p>Nenhum cliente aguardando.</p>";
    return;
  }

  pendentes.forEach(cliente => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>Cliente:</strong> ${cliente}<br>
      <select id="sel-${cliente}">
        <option value="">Escolher Motorista</option>
        ${motoristas.map(m => `<option value="${m.telefone}">${m.nome}</option>`).join("")}
      </select>
      <button onclick="atribuir('${cliente}')">Atribuir</button>
      <hr>
    `;
    painel.appendChild(div);
  });
}

async function atribuir(cliente) {
  const motorista = document.getElementById(`sel-${cliente}`).value;
  if (!motorista) return alert("Escolha um motorista primeiro.");

  await fetch("/atribuir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cliente, motorista })
  });

  alert("Motorista atribuído!");
  carregarPainel();
}

carregarPainel();
setInterval(carregarPainel, 5000);
