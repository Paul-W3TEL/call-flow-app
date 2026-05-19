import express from "express";
import cors from "cors";
import exampleData from "./exampleData.json" assert { type: "json" };
import apiContract from "./api.json" assert { type: "json" };

import { getEzvmsSoapVersion } from "./ezvms/ezvmsClient.js";
import { parseGetCompanyResponse } from "./ezvms/ezvmsParser.js";
import { mapGetCompanyToCallFlow } from "./ezvms/ezvmsMapper.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

function isMatchingCallFlow(companyId, pilotNumber) {
  return (
    exampleData.company.company_id === companyId &&
    exampleData.entry_point.pilot_number === pilotNumber
  );
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/contract", (req, res) => {
  res.json(apiContract);
});

app.get("/api/call-flows/:companyId/:pilotNumber", (req, res) => {
  const { companyId, pilotNumber } = req.params;

  if (!isMatchingCallFlow(companyId, pilotNumber)) {
    return res.status(404).json({
      error: "CALL_FLOW_NOT_FOUND"
    });
  }

  res.json(exampleData);
});

app.get("/api/ezvms/config", (req, res) => {
  res.json({
    soap_url: process.env.EZVMS_SOAP_URL || "not set",
    provision_id: process.env.EZVMS_PROVISION_ID || "not set",
    password_set: Boolean(process.env.EZVMS_PROVISION_PASSWORD)
  });
});

app.get("/api/ezvms/version/raw", async (req, res) => {
  try {
    const xml = await getEzvmsSoapVersion();
    res.type("application/xml");
    res.send(xml);
  } catch (error) {
    res.status(502).json({
      error: "EZVMS_SOAP_ERROR",
      message: error.message
    });
  }
});

app.post("/api/call-flows/validate", (req, res) => {
  res.json({
    status: "valid",
    errors: [],
    warnings: []
  });
});

app.get("/api/call-flows", (req, res) => {
  res.json([
    {
      company_id: "1001",
      company_name: "Example Company",
      pilot_number: "0123456789",
      label: "Main Call Flow"
    },
    {
      company_id: "1001",
      company_name: "Example Company",
      pilot_number: "0987654321",
      label: "Night Call Flow"
    }
  ]);
});

app.patch("/api/call-flows/:companyId/:pilotNumber/nodes/:nodeId", (req, res) => {
  const { companyId, pilotNumber, nodeId } = req.params;

  if (!isMatchingCallFlow(companyId, pilotNumber)) {
    return res.status(404).json({
      error: "CALL_FLOW_NOT_FOUND"
    });
  }

  const node = exampleData.nodes.find((item) => item.id === nodeId);

  if (!node) {
    return res.status(404).json({
      error: "NODE_NOT_FOUND"
    });
  }

  const allowedFields = ["prompt", "dtmf", "settings"];

  for (const key of Object.keys(req.body)) {
    if (!allowedFields.includes(key)) {
      return res.status(400).json({
        error: "READ_ONLY_FIELD"
      });
    }
  }

  const updatedNode = {
    ...node,
    ...req.body
  };

  const updatedCallFlow = {
    ...exampleData,
    nodes: exampleData.nodes.map((item) =>
      item.id === nodeId ? updatedNode : item
    )
  };

  res.json({
    status: "draft_saved",
    call_flow: updatedCallFlow
  });
});

app.post("/api/call-flows/:companyId/:pilotNumber/apply", (req, res) => {
  const { companyId, pilotNumber } = req.params;

  if (!isMatchingCallFlow(companyId, pilotNumber)) {
    return res.status(404).json({
      error: "CALL_FLOW_NOT_FOUND"
    });
  }

  if (req.body.confirmed !== true) {
    return res.status(400).json({
      error: "CONFIRMATION_REQUIRED"
    });
  }

  res.json({
    status: "applied",
    message: "Mock apply only. No EZVMS SOAP call was made."
  });
});

app.listen(port, () => {
  console.log(`Call Flow API running on http://localhost:${port}`);
});
