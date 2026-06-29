import "dotenv/config";
import express from "express";
import cors from "cors";
import apiContract from "./api.json" with { type: "json" };

import {
  getEzvmsCompany,
  getCompanyMenus,
  modifyCompanyMenuFromNode,
  modifyCompanyFromEntryPoint
} from "./ezvms/ezvmsClient.js";
import { mapCompanyMenusToCallFlow } from "./ezvms/ezvmsMapper.js";
import { parseGetCompanyResponse } from "./ezvms/ezvmsParser.js";

const app = express();
const port = process.env.BACKEND_PORT || 3000;
const sipExtension = 8933100000001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/contract", (req, res) => {
  res.json(apiContract);
});

app.get("/api/call-flows/:companyId/", async (req, res) => {
  try {
    const { companyId } = req.params;

    const rawData = await getCompanyMenus(sipExtension, companyId);
    const callFlow = mapCompanyMenusToCallFlow(
      rawData,
      companyId,
      sipExtension
    );

    res.json(callFlow);
  } catch (error) {
    res.status(502).json({
      error: "CALL_FLOW_FETCH_FAILED",
      message: error.message
    });
  }
});

app.get("/api/ezvms/config", (req, res) => {
  res.json({
    soap_url: process.env.EZVMS_SOAP_URL || "not set",
    provision_id: process.env.EZVMS_PROVISION_ID || "not set",
    password_set: Boolean(process.env.EZVMS_PROVISION_PASSWORD)
  });
});

// Returns the company's EZVMS routing fields (working_hour_menu, holiday_menu,
// etc.) as parsed JSON, not raw SOAP XML, so the frontend can consume it directly.
app.get("/api/ezvms/company/:companyId/", async (req, res) => {
  try {
    const { companyId } = req.params;
    const xml = await getEzvmsCompany(companyId);
    const parsed = parseGetCompanyResponse(xml, companyId);

    res.json(parsed);
  } catch (error) {
    res.status(502).json({
      error: "EZVMS_COMPANY_ERROR",
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

// Applies node-level and entry-point-level changes to EZVMS. Both are sent in
// the same request body; previously entry_point was silently ignored here.
app.post("/api/call-flows/:companyId/apply", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { nodes = [], entry_point = null } = req.body;

    const results = [];

    for (const node of nodes) {
      const xml = await modifyCompanyMenuFromNode(companyId, node);

      results.push({
        node_id: node.id,
        status: "sent",
        raw: xml
      });
    }

    if (entry_point) {
      const xml = await modifyCompanyFromEntryPoint(companyId, entry_point);

      results.push({
        node_id: "entry_point",
        status: "sent",
        raw: xml
      });
    }

    res.json({
      success: true,
      message: "Sent modifs!",
      results
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      error: "EZVMS_APPLY_FAILED",
      message: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Call Flow API running on http://localhost:${port}`);
});
