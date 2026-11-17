import { Skin, CaseDefinition } from '../types';

// Curated high quality weapon renders map (Steam CDN & verified assets)
export const WEAPON_FALLBACK_IMAGES: Record<string, string> = {
  // Rifles & Heavies
  ak47: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyUE6ZMn2rqXoYit3gW3rhdoazrydYSTclc_M1jS-lG2wbzqhZW67czLnHcx6XZ252GdwUJ9U8t4FA/360fx360f',
  m4a4: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09izh5SEhcj5Nr_Yg2Yf65xP2ezF_Jn4xlW2_kQ5Yzvzd47HcQc6MlqF-wTtwLvrh8e-7cvOzXU16XI8pSGK6eD6wXU/360fx360f',
  m4a1: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITBhGJf_NZlmOzA-LP5gVO8v11vYGymcISUclc6MlzRqVO-k-7t15K5uJ_ByXE3uiB3-z-DyH3p0o01/360fx360f',
  galil: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbupIgthwczbYD9N4927q4KGnvTmNr_Qg1Rd4cJ5nqfAotSn3ALg_EdoZTymJNOde1RsNQ3QqFe2wO7nhpXu6c7KmyRkviB0t3rUnAv330_nUu69sg/360fx360f',
  sg553: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopb-zJAtt2uvbcczV4N21nLmHnvD8J_WEwz9Tu8Emj7yR8dqk0AXk-UJrYGr6IdSSc1M6Y1HR-lO9yLu6hpLu6prXiSw04uMsdw/360fx360f',
  mag7: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvdmJmo-ZkuPzKqnUnm5Q_tw_2bCY8dr22gKy_kVtNT_7JNeQI1A3MwqDrle7xuvt0ZC67pzNyCQx7nM8pSGKQ2Wl5pA/360fx360f',

  // Snipers
  awp: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G9Q65xOh-zF_Jn4xlWwqUVtYm33coSQJwRvYQuErFXrxr_vgJW0vczLmyA2u3J2-z-DyP2h8t9y/360fx360f',
  ssg08: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopamie19f0Ob3Yi5FvISJmIGZqOf8PL3flWdc-cJ5nqfA9Iiniwfnr0RtZmnzJdOQdwBqMlnR-VS6w-7shZG07ZyamiBiuiRz7X2InAv330-8a_l64Q/360fx360f',

  // Pistols
  deagle: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH_9mkgL-OlvD4NoTck29Y_cg_3uuU99qkiwO3-kFtZWGmctPBegFsZwvRqFC_xOy-18Xqu8-bnXBkuiMmsHnfnBaxhEpSLrs4c-uN9e8/360fx360f',
  glock: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJmo-Chcj5Nr_Yg2Yf6sMl2-qUp4qk2gCy_kY_NWihctPHcwQ6N1yC_AS6wLvrhMS575rPyHQx6SY8pSGK5K2-i2o/360fx360f',
  usp: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGCzhQ09-jq5WYh8j_OrfcZdBh_Pp5j-jX7MKsd25i3hpuNW-lINPBclNvZ1yE-1W5lLi9gZW66ZqfnWwj5Hco6_GOmg/360fx360f',
  p250: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhjxszYI2gS09-5lpKKqPrxN7LEmyUG7ZAn3-iRo9yl3wW1-kVvYmr6cNOdcAU-YQ2BqVfrybvogZK_7Z_NnHdnuiQ8pSGK0K-6K5o/360fx360f',
  cz75: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovrG1eVcwg8zbYQJO7c6_mr-HnvD8J_WEwjsGu8Rz2L-Vpdin2wHk-0E_NWrzLdTEewU8Ml-C_AW9kLy8gZG1uJ3LnHpgvHQn-z-DyGzTq0Yp/360fx360f',

  // SMGs
  mp9: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FABt17DbfgJP0925mIGZqOf8PL3flWdc-cJ5nqfEp9yg21Cx_EJoZ2_zctOSd1VsZ13ZqVG8x-a808e0uJuYm3di6XVw-z-DyP2h8t9y/360fx360f',
  mac10: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvdmJmo-ZkuPzKqnUnm5Q_tw_2bCY8dr22gKy_kVtNT_7JNeQI1A3MwqDrle7xuvt0ZC67pzNyCQx7nM8pSGKQ2Wl5pA/360fx360f',

  // Knives
  knife: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20hPbkI7PYhG5u5Mx2gv2PoI-n3gC1rhFvMGj7cIGTdwFsZwzT_1K9xr28hcDtupTMnCExviUrsWGdwUJEh8d0-Q/360fx360f',
  butterfly: '/src/assets/images/butterfly_knife_fade_1791561104295.jpg',
  karambit: '/src/assets/images/karambit_doppler_skin_1791559774637.jpg',
  skeleton: '/src/assets/images/skeleton_knife_crimson_1791563130859.jpg',

  // Gloves
  gloves: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DAQ1h3LTwbv6v8FlVfwOP3fDxBvdmJlo-HnvD8J_WEwjsBu8Ek2LuUp9r22QC3-hA_amzwJo_AcARvZAzQq1Tsy-u9g5Dq7p-cz2wj5HclGjX8kg/360fx360f',
};

// Case Box 3D Artwork
export const CASE_BOX_IMAGES: Record<string, string> = {
  free_daily: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU4naefIT8Wv9ril5SOh8m6ZrmHw2lQuJ0p372Wp4n0jVG2-Uc_Z2CmIo6LMlhplvXk8g/360fx360f',
  tg_subscribe_case: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFUxnaPLJz5H74y1xtTcz6etNumIx29U68ch3uuUpYin2w22qkQ6NT3yd4eLMlhpgJJnIzA/360fx360f',
  student_drop: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFUxnaPLJz5H74y1xtTcz6etNumIx29U68ch3uuUpYin2w22qkQ6NT3yd4eLMlhpgJJnIzA/360fx360f',
  apex_starter: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFY5naqQIz4Xu4q3lNnbxfOmZ-iGxDgJu5Jy2b2Wrdmg3g23r0o_Zj_xJtScJgQ8Y1mE_1O2wvCv28FvH88U/360fx360f',
  starter_boost_69: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFY5naqQIz4Xu4q3lNnbxfOmZ-iGxDgJu5Jy2b2Wrdmg3g23r0o_Zj_xJtScJgQ8Y1mE_1O2wvCv28FvH88U/360fx360f',
  pistol_rush: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQxnaecIT8Wv9ril5SOh8m6ZrmHw2lQuJ0p372Wp4n0jVG2-Uc_Z2CmIo6LMlhplvXk8g/360fx360f',
  standoff_origin: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFY1naTKIT8Wv9ril5SOh8m6ZrmHw2lQuJ0p372Wp4n0jVG2-Uc_Z2CmIo6LMlhplvXk8g/360fx360f',
  standoff_sharp: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFY1naTKIT8Wv9ril5SOh8m6ZrmHw2lQuJ0p372Wp4n0jVG2-Uc_Z2CmIo6LMlhplvXk8g/360fx360f',
  standoff_revival: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFY1naTKIT8Wv9ril5SOh8m6ZrmHw2lQuJ0p372Wp4n0jVG2-Uc_Z2CmIo6LMlhplvXk8g/360fx360f',
  standoff_chameleon: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFY1naTKIT8Wv9ril5SOh8m6ZrmHw2lQuJ0p372Wp4n0jVG2-Uc_Z2CmIo6LMlhplvXk8g/360fx360f',
  standoff_space: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFY1naTKIT8Wv9ril5SOh8m6ZrmHw2lQuJ0p372Wp4n0jVG2-Uc_Z2CmIo6LMlhplvXk8g/360fx360f',
  default_knife: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU1nbaZIT8Wv9ril5SOh8m6ZrmHw2lQuJ0p372Wp4n0jVG2-Uc_Z2CmIo6LMlhplvXk8g/360fx360f',
  default_case: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQxnaecIT8Wv9ril5SOh8m6ZrmHw2lQuJ0p372Wp4n0jVG2-Uc_Z2CmIo6LMlhplvXk8g/360fx360f',
};

export function getSkinImageUrl(skin?: Skin | null): string {
  if (!skin) return WEAPON_FALLBACK_IMAGES.ak47;

  // 1. If explicitly set and valid
  if (skin.imageUrl) return skin.imageUrl;

  const w = (skin.weapon || '').toLowerCase();
  const id = (skin.id || '').toLowerCase();

  // Special knives & gloves
  if (id.includes('butterfly') || w.includes('бабочка')) return WEAPON_FALLBACK_IMAGES.butterfly;
  if (id.includes('karambit') || w.includes('керамбит')) return WEAPON_FALLBACK_IMAGES.karambit;
  if (id.includes('skeleton') || w.includes('скелет')) return WEAPON_FALLBACK_IMAGES.skeleton;
  if (skin.iconType === 'knife' || w.includes('нож') || w.includes('байонет') || w.includes('тычковые')) return WEAPON_FALLBACK_IMAGES.knife;
  if (skin.iconType === 'gloves' || w.includes('перчатки')) return WEAPON_FALLBACK_IMAGES.gloves;

  // Specific weapons
  if (w.includes('ak-47') || w.includes('ak47') || id.includes('ak47')) return WEAPON_FALLBACK_IMAGES.ak47;
  if (w.includes('awp') || id.includes('awp')) return WEAPON_FALLBACK_IMAGES.awp;
  if (w.includes('m4a4') || id.includes('m4a4')) return WEAPON_FALLBACK_IMAGES.m4a4;
  if (w.includes('m4a1') || id.includes('m4a1')) return WEAPON_FALLBACK_IMAGES.m4a1;
  if (w.includes('deagle') || w.includes('desert eagle') || id.includes('deagle')) return WEAPON_FALLBACK_IMAGES.deagle;
  if (w.includes('glock') || id.includes('glock')) return WEAPON_FALLBACK_IMAGES.glock;
  if (w.includes('usp') || id.includes('usp')) return WEAPON_FALLBACK_IMAGES.usp;
  if (w.includes('p250') || id.includes('p250')) return WEAPON_FALLBACK_IMAGES.p250;
  if (w.includes('mp9') || id.includes('mp9')) return WEAPON_FALLBACK_IMAGES.mp9;
  if (w.includes('mag-7') || w.includes('mag7') || id.includes('mag7')) return WEAPON_FALLBACK_IMAGES.mag7;
  if (w.includes('galil') || id.includes('galil')) return WEAPON_FALLBACK_IMAGES.galil;
  if (w.includes('sg553') || id.includes('sg553')) return WEAPON_FALLBACK_IMAGES.sg553;

  // By iconType
  if (skin.iconType === 'sniper') return WEAPON_FALLBACK_IMAGES.awp;
  if (skin.iconType === 'pistol') return WEAPON_FALLBACK_IMAGES.deagle;
  if (skin.iconType === 'smg') return WEAPON_FALLBACK_IMAGES.mp9;

  return WEAPON_FALLBACK_IMAGES.ak47;
}

export function getCaseImageUrl(caseDef?: CaseDefinition | null): string {
  if (!caseDef) return CASE_BOX_IMAGES.default_case;
  if (CASE_BOX_IMAGES[caseDef.id]) return CASE_BOX_IMAGES[caseDef.id];
  if (caseDef.category === 'knives' || caseDef.id.startsWith('knife_')) return CASE_BOX_IMAGES.default_knife;
  if (caseDef.category === 'standoff' || caseDef.id.startsWith('standoff_')) return CASE_BOX_IMAGES.standoff_origin;
  return CASE_BOX_IMAGES.default_case;
}
