const EZVMS_CONFIG = {
  endpoint:
    process.env.EZVMS_SOAP_URL ||
    "http://172.16.100.1:8080/soap/services/ExtensionProvisioning",

  provisionId:
    process.env.EZVMS_PROVISION_ID ||
    "vmssoap",

    provisionPassword:
    process.env.EZVMS_PROVISION_PASSWORD ||
    "2AwMSx5CN",

  namespace: "http://ezvms.product.ezvoicetek.com"
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
        SOAPAction: operationName
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
