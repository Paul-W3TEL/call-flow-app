
export function mapCompanyMenusToCallFlow(apiResponse, companyId, sipExtension) {
  const companyInfo =
    apiResponse.header?.[0]?.provisioning?.[0] || {};

  const menus = apiResponse.companyMenus || [];

  return {
    company: {
      company_id: companyId,
      name: apiResponse.header.user.name || `Company ${companyId}`
    },

    entry_point: {
      pilot_number: apiResponse.header.provisioning.callerNum || null,
      start_node_id: menus[0]?.menu_id || null
    },

    nodes: menus.map((menu) => ({
      id: menu.menu_id,
      type: "menu",
      label: menu.f_display_name || menu.menu_desc || menu.menu_id,
      prompt: menu.main_prompt || null,
      dtmf: mapDtmf(menu),
      settings: {
        timeout: Number(menu.noans_timeout ?? 0),
        retries: Number(menu.retry_cnt ?? 0)
      },
      position: {
        x: Number(menu.xpos ?? 0),
        y: Number(menu.ypos ?? 0)
      },
      ezvms: menu
    })),

    targets: buildTargetsFromMenus(menus),

    source: {
      system: "EZVMS_IVR_API",
      mode: "companyMenus",
      fetched_at: new Date().toISOString()
    }
  };
}

function mapDtmf(menu) {
  const dtmf = {};

  for (let i = 0; i <= 9; i++) {
    const value = menu[`key${i}_value`];
    if (value && value !== "string") {
      dtmf[String(i)] = value;
    }
  }

  if (menu["key_star_action_value"]) dtmf["*"] = menu["key_star_action_value"];
  if (menu["key_hashtag_action_value"]) dtmf["#"] = menu["key_hashtag_action_value"];
  if (menu["default_action_value"]) {
    dtmf["default"] = menu["default_action_value"];
  } else if (menu["default_action_value_str"]) { 
    dtmf["default"] = menu["default_action_value_str"];
  }

  return dtmf;
}

function buildTargetsFromMenus(menus) {
  const menuIds = new Set(menus.map((menu) => menu.menu_id));
  const targetIds = new Set();

  menus.forEach((menu) => {
    Object.values(mapDtmf(menu)).forEach((destination) => {
      if (!menuIds.has(destination)) {
        targetIds.add(destination);
      }
    });
  });

  return [...targetIds].map((id) => ({
    id,
    type: "extension",
    label: `Extension ${id}`,
    number: id
  }));
}

