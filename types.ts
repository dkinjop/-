export interface CPData {
  name: string;
  role: string; // e.g. "Fixer x Hacker"
  vibe: string; // e.g. "Doomed Yuri", "Rivalry"
  description: string;
}

export interface IPData {
  id: string;
  title: string;
  category: string; // e.g. "GAME", "ANIME", "NOVEL"
  entryDate: string;
  colorTheme: 'green' | 'pink' | 'blue';
  summary: string;
  cps: CPData[];
  tags: string[];
}