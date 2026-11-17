export type ItemRarity = 'rare' | 'super_rare' | 'epic' | 'legendary' | 'arcana' | 'secret';

export interface Skin {
  id: string;
  name: string;
  weapon: string;
  skinName: string;
  rarity: ItemRarity;
  price: number; // in Acoin
  wear: 'FN' | 'MW' | 'FT' | 'WW' | 'BS';
  color: string;
  gradient: string;
  iconType: 'rifle' | 'sniper' | 'pistol' | 'knife' | 'gloves' | 'smg';
  imageUrl?: string;
  bgTheme?: string;
}

export interface CaseItemWeight {
  skin: Skin;
  weight: number; // probability weight
}

export interface CaseDefinition {
  id: string;
  name: string;
  category: 'popular' | 'cheap' | 'premium' | 'standoff' | 'special' | 'knives';
  price: number; // in Acoin
  image: string;
  accentColor: string;
  description: string;
  items: CaseItemWeight[];
}

export interface InventoryItem extends Skin {
  instanceId: string;
  acquiredAt: number;
  fromCase?: string;
}

export interface DropEvent {
  id: string;
  username: string;
  avatarSeed: string;
  skin: Skin;
  caseName: string;
  timestamp: number;
}

export interface SimResult {
  totalOpens: number;
  totalSpent: number;
  totalWon: number;
  netProfit: number;
  rtpPercentage: number;
  bestDrop: Skin | null;
  dropsByRarity: Record<ItemRarity, number>;
  history: { openIndex: number; balance: number; won: number }[];
}
