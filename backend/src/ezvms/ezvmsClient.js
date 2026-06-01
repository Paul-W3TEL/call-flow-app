const EZVMS_CONFIG = {
  endpoint:
    process.env.EZVMS_SOAP_URL ||
    "https://46.28.168.31:8082/soap/services/ExtensionProvisioning",

  provisionId:
    process.env.EZVMS_PROVISION_ID ||
    "paul_soap",

    provisionPassword:
    process.env.EZVMS_PROVISION_PASSWORD ||
    "2AwMSx5CN",

  namespace: "http://ezvms.product.ezvoicetek.com"
};

const EZVMS_REST_CONFIG = {
  baseUrl:
    process.env.EZVMS_REST_URL ||
    "https://46.28.168.31:8082"
};


function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildSoapEnvelope(operationName, parameters) {
  const xmlParameters = Object.entries(parameters)
    .map(([key, value]) => {
      return `<ns:${key}>${escapeXml(value)}</ns:${key}>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ns:${operationName} xmlns:ns="${EZVMS_CONFIG.namespace}">
      ${xmlParameters}
    </ns:${operationName}>
  </soapenv:Body>
</soapenv:Envelope>`;
}

export async function getCompanyMenus(sipExtension, companyId) {
  const url =
    `https://demo.phoneportal.fr/api/voip/v1/IVR/companyMenus/` +
    `${encodeURIComponent(sipExtension)}/` +
    `${encodeURIComponent(companyId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.EZVMS_REST_TOKEN}`,
      Accept: "application/json"
    }
  });
  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `IVR companyMenus did not return JSON. HTTP ${response.status}. ` +
      `URL: ${url}. Response starts with: ${text.slice(0, 120)}`
    );
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      `IVR companyMenus failed: HTTP ${response.status} ${data.message || ""}`
    );
  }

  return data;
}

export async function callEzvmsSoap(operationName, parameters = {}) {
  const ticket = `ticket-${Date.now()}`;

  const body = buildSoapEnvelope(operationName, {
    provision_id: EZVMS_CONFIG.provisionId,
    provision_pwd: EZVMS_CONFIG.provisionPassword,
    provision_ticket: ticket,
    ...parameters
  });

  try {
    const response = await fetch(EZVMS_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `urn:${operationName}`
      },
      body
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `HTTP_${response.status}: ${responseText.slice(0, 500)}`
      );
    }

    return responseText;
  } catch (error) {
    throw new Error(
      `SOAP request failed for ${operationName} at ${EZVMS_CONFIG.endpoint}: ${error.cause?.code || error.code || error.message}`
    );
  }
}

export async function getEzvmsCompany(companyId) {
  return callEzvmsSoap("GetCompany", {
    company_id: companyId
  });
}

export async function modifyCompanyMenuFromNode(companyId, node) {
  const raw = node.ezvms || {};

  const payload = {
    ...raw,

    company_id: companyId,
    menu_id: node.id,

    menu_desc: node.label,
    main_prompt: node.prompt || null,
    retry_cnt: node.settings?.retries ?? raw.retry_cnt,
    noans_timeout: node.settings?.timeout ?? raw.noans_timeout
  };

  for (let i = 0; i <= 9; i++) {
    const key = String(i);
    payload[`key${key}_value`] = node.dtmf?.[key] || null;
  }

  return callEzvmsSoap("ModifyCompanyMenu", payload);
}
