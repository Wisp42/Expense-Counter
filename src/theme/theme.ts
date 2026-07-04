export interface Theme {
  background: string;
  text: string;
  accent: string;
  green: string;
  red: string;
  buttonBg: string;
  overlay: string;
}

export const lightTheme: Theme = {
  background: '#F7F1DE',
  text: '#4E220F',
  accent: '#B0BA99',
  green: '#6B8F5C',
  red: '#B5533C',
  buttonBg: '#FBF7EA',
  overlay: 'rgba(78,34,15,0.35)',
};

export const darkTheme: Theme = {
  background: '#231409',
  text: '#F7EFE0',
  accent: '#B7C0A2',
  green: '#7FA86D',
  red: '#D9765A',
  buttonBg: '#2F1D10',
  overlay: 'rgba(0,0,0,0.5)',
};

export function getTheme(name: 'light' | 'dark'): Theme {
  return name === 'dark' ? darkTheme : lightTheme;
}
