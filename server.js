import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

import { pendentes, motoristas, atribuicoes, atribuirCliente } from "./database.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ZAPI_BASE = "https://api.z-api.io/instances/3ED5449C491BB12A2910D66739CEE648/token/99865543D794C144ECA83BC3";

async function sendText(phone, text) {
  try {
    await axios.post(`${ZAPI_BASE}/send-text`, {
      phone,
      message: text
    });
  } catch (e) {
    console.error("Erro enviando mensagem:", e.response?.data || e.message);
  }
}

app.post("/webhook", async (req, res) => {
  // Extrai informações da mensagem recebida
  const from = req.body.from || "número-desconhecido";
  const message = req.body.message?.text || req.body.text || "mensagem-desconhecida";

  // Log para debug
  console.log(`Mensagem recebida de ${from}: ${message}`);

  // Verifica se o número ainda não foi atribuído
  if (!atribuicoes[from]) {
    if (!pendentes.includes(from)) pendentes.push(from);
    return res.sendStatus(200);
  }

  // Já está atribuído, encaminha a mensagem
  const target = atribuicoes[from];
  await sendText(target, message);

  res.sendStatus(200);
});

// Endpoints de visualização e controle
app.get("/pendentes", (req, res) => res.json(pendentes));
app.get("/motoristas", (req, res) => res.json(motoristas));

app.post("/atribuir", (req, res) => {
  const { cliente, motorista } = req.body;
  atribuirCliente(cliente, motorista);
  res.json({ ok: true });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));
