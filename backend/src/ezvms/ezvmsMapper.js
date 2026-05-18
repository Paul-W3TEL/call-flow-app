export function mapGetCompanyToCallFlow(companyData, pilotNumber) {
  const startNodeId =
    companyData.priority_menu ||
    companyData.working_hour_menu ||
    companyData.after_work_menu ||
    companyData.holiday_menu ||
    "unknown_start_menu";

  const menuIds = collectMenuIds(companyData);

  return {
    company: {
      company_id: companyData.company_id,
      name: companyData.company_name || `Company ${companyData.company_id}`
    },

    entry_point: {
      pilot_number: pilotNumber,
      start_node_id: startNodeId
    },

    nodes: menuIds.map((menuId) => ({
      id: menuId,
      type: "menu",
      label: `Menu ${menuId}`,
      prompt: null,
      dtmf: {},
      settings: {
        timeout: 6,
        retries: 3
      }
    })),

    targets: [],

    source: {
      system: "EZVMS",
      mode: "partial_get_company_mapping",
      note: "This is a partial Call Flow reconstructed from GetCompany menu references only."
    }
  };
}

function collectMenuIds(companyData) {
  const rawValues = [
    companyData.working_hour_menu,
    companyData.after_work_menu,
    companyData.holiday_menu,
    companyData.priority_menu,
    companyData.black_list_menu,
    companyData.working_time_menu_id1,
    companyData.working_time_menu_id2,
    companyData.working_time_menu_id3,
    companyData.working_time_menu_id4,
    companyData.working_time_menu_id5,
    companyData.working_time_menu_id6,
    companyData.working_time_menu_id7
  ];

  const ids = new Set();

  rawValues.forEach((value) => {
    if (!value) return;

    String(value)
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item && item !== "-1")
      .forEach((item) => ids.add(item));
  });

  return [...ids];
}
