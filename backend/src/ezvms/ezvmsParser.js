export function extractTag(xml, tagName) {
  const regex = new RegExp(`<[^:>]*:?${tagName}>(.*?)<\\/[^:>]*:?${tagName}>`, "s");
  const match = xml.match(regex);
  return match ? decodeXml(match[1].trim()) : null;
}

export function extractIndexedTags(xml, baseName) {
  const regex = new RegExp(`<[^:>]*:?${baseName}(\\d+)>(.*?)<\\/[^:>]*:?${baseName}\\1>`, "gs");
  const results = [];

  for (const match of xml.matchAll(regex)) {
    results.push({
      index: Number(match[1]),
      value: decodeXml(match[2].trim())
    });
  }

  return results;
}

export function parseSoapResult(xml) {
  return {
    result_code: extractTag(xml, "result_code"),
    result_msg: extractTag(xml, "result_msg"),
    provision_ticket: extractTag(xml, "provision_ticket")
  };
}

export function parseGetCompanyResponse(xml, companyId) {
  return {
    ...parseSoapResult(xml),

    company_id: companyId,
    company_name: extractTag(xml, "company_name"),
    working_hour_menu: extractTag(xml, "working_hour_menu"),
    after_work_menu: extractTag(xml, "after_work_menu"),
    holiday_menu: extractTag(xml, "holiday_menu"),
    priority_menu: extractTag(xml, "priority_menu"),
    black_list_menu: extractTag(xml, "black_list_menu"),

    working_time_menu_id1: extractTag(xml, "working_time_menu_id1"),
    working_time_menu_id2: extractTag(xml, "working_time_menu_id2"),
    working_time_menu_id3: extractTag(xml, "working_time_menu_id3"),
    working_time_menu_id4: extractTag(xml, "working_time_menu_id4"),
    working_time_menu_id5: extractTag(xml, "working_time_menu_id5"),
    working_time_menu_id6: extractTag(xml, "working_time_menu_id6"),
    working_time_menu_id7: extractTag(xml, "working_time_menu_id7")
  };
}

function decodeXml(value) {
  return String(value ?? "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}
