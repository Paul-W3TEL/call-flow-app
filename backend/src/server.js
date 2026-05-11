import express from "express";
import cors from "cors";
import exampleData from "./exampleData.json" assert { type: "json" };
import apiContract from "./api.json" assert { type: "json" };

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/contract", (req, res) => {
  res.json(apiContract);
});

app.get("/api/call-flows/:companyId/:pilotNumber", (req, res) => {
  const { companyId, pilotNumber } = req.params;

  if (
    exampleData.company.company_id !== companyId ||
    exampleData.entry_point.pilot_number !== pilotNumber
  ) {
    return res.status(404).json({
      error: "CALL_FLOW_NOT_FOUND"
    });
  }

  res.json(exampleData);
});

app.listen(port, () => {
  console.log(`Call Flow API running on http://localhost:${port}`);
});