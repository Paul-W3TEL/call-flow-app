import express from "express";
import cors from "cors";
import apiContract from "./api.json" with { type: "json" };

import { getEzvmsCompany, getCompanyMenus } from "./ezvms/ezvmsClient.js";
import { mapCompanyMenusToCallFlow  } from "./ezvms/ezvmsMapper.js";

const app = express();
const port = 3000;
const sipExtension = 8933100000001

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

app.get("/api/ezvms/company/:companyId/", async (req, res) => {
  try {
    const xml = await getEzvmsCompany(req.params.companyId);

    res.type("application/xml");
    res.send(xml);
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

app.listen(port, () => {
  console.log(`Call Flow API running on http://localhost:${port}`);
});
