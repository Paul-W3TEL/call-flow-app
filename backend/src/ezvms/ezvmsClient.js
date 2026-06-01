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
    company_id: companyId,
    menu_id: node.id,

    description: node.label,
    max_dtmf: raw.max_dtmf ?? "10",
    retry_count: node.settings?.retries ?? raw.retry_cnt ?? "2",

    main_prompt: node.prompt || raw.main_prompt || "",
    retry_prompt: raw.retry_prompt || "",
    invalid_prompt: raw.invalid_prompt || "",
    ext_not_found_prompt: raw.ext_notfound_prompt || "",
    transfer_prompt: raw.transfer_prompt || "",
    default_leave_message_prompt: raw.default_leave_msg_prompt || "",
    ext_no_vms_prompt: raw.ext_novms_prompt || "",

    ext_busy_menu: raw.ext_busy_menu || "",
    ext_no_answer_menu: raw.ext_noanswer_menu || "",
    ext_unavailable_menu: raw.ext_unavailable_menu || "",
    operator_busy_menu: raw.operator_busy_menu || "",

    no_answer_timeout: node.settings?.timeout ?? raw.noans_timeout ?? "0",

    x_position: node.position?.x ?? raw.xpos ?? "0",
    y_position: node.position?.y ?? raw.ypos ?? "0",

    remote_ip: process.env.EZVMS_REMOTE_IP || "127.0.0.1"
  };

  for (let i = 0; i <= 9; i++) {
    const value = node.dtmf?.[String(i)] || "";

    payload[`key${i}_action`] = value ? "5" : "0";
    payload[`key${i}_action_value`] = value;
  }

  console.log("SOAP ModifyCompanyMenu payload:");
  console.log(JSON.stringify(payload, null, 2));

  const xml = await callEzvmsSoap("ModifyCompanyMenu", payload);

  console.log("SOAP ModifyCompanyMenu response:");
  console.log(xml);

  return xml;
}