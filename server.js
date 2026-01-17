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
 console.log("Webhook recebido:", req.body);

const from = req.body.from || "número-desconhecido";
const message = req.body.message?.text || req.body.text || "mensagem-desconhecida";

console.log(`Mensagem de ${from}: ${message}`);

  if (!atribuicoes[from]) {
    if (!pendentes.includes(from)) pendentes.push(from);
    return res.sendStatus(200);
  }

  const target = atribuicoes[from];
  await sendText(target, body);
  res.sendStatus(200);
});

app.get("/pendentes", (req, res) => res.json(pendentes));
app.get("/motoristas", (req, res) => res.json(motoristas));

app.post("/atribuir", (req, res) => {
  const { cliente, motorista } = req.body;
  atribuirCliente(cliente, motorista);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));
