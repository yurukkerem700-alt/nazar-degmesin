export const Storage = {
  get(key: string, defaultValue: any = null): any {
    try {
      const val = localStorage.getItem(key);
      if (val === null) return defaultValue;
      return JSON.parse(val);
    } catch {
      return defaultValue;
    }
  },
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getInt(key: string, defaultValue = 0): number {
    return parseInt(this.get(key, defaultValue.toString()), 10) || defaultValue;
  },
};

export const KEYS = {
  HIGH_SCORE: 'nazar_highscore',
  COINS: 'nazar_coins',
  SKIN: 'nazar_skin',
  BG: 'nazar_bg',
  UNLOCKED_SKINS: 'nazar_unlocked_skins',
  UNLOCKED_BGS: 'nazar_unlocked_bgs',
  SOUND: 'nazar_sound',
  GAMES_PLAYED: 'nazar_games_played',
  TOTAL_COINS: 'nazar_total_coins',
  // Efektler
  WING: 'nazar_wing',
  CROWN: 'nazar_crown',
  TRAIL: 'nazar_trail',
  UNLOCKED_WINGS: 'nazar_unlocked_wings',
  UNLOCKED_CROWNS: 'nazar_unlocked_crowns',
  UNLOCKED_TRAILS: 'nazar_unlocked_trails',
};

export const SKINS = [
  { key: 'player', name: 'Klasik', price: 0 },
  { key: 'player_red', name: 'Kizil', price: 400 },
  { key: 'player_gold', name: 'Altin', price: 800 },
  { key: 'player_green', name: 'Yesil', price: 600 },
  { key: 'player_purple', name: 'Mor', price: 700 },
];

export const BACKGROUNDS = [
  { key: 'bg', name: 'Istanbul', price: 0 },
  { key: 'bg_kapadokya', name: 'Kapadokya', price: 300 },
  { key: 'bg_pamukkale', name: 'Pamukkale', price: 400 },
  { key: 'bg_efes', name: 'Efes', price: 500 },
];

export const WINGS = [
  { key: 'none', name: 'Yok', price: 0 },
  { key: 'wing_blue', name: 'Melek', price: 350 },
  { key: 'wing_gold', name: 'Altin Kanat', price: 700 },
  { key: 'wing_dark', name: 'Karanlik', price: 600 },
];

export const CROWNS = [
  { key: 'none', name: 'Yok', price: 0 },
  { key: 'crown_gold', name: 'Altin Tac', price: 400 },
  { key: 'crown_silver', name: 'Gumus Tac', price: 300 },
];

export const TRAILS = [
  { key: 'none', name: 'Yok', price: 0 },
  { key: 'trail_sparkle', name: 'Parilti', price: 450 },
  { key: 'trail_rainbow', name: 'Gokkusagi', price: 650 },
  { key: 'trail_fire', name: 'Ates', price: 550 },
];
