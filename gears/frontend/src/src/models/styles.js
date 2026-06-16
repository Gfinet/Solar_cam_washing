// Styles partagés entre toutes les pages

// --- Layouts ---
export const globalDiv = {
  display: 'flex',
  flexDirection: 'column',
  padding: '2rem',
};

export const buttonDiv = {
  display: 'flex',
  gap: '1rem',
  padding: '1rem',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
};

export const rowDiv = {
  display: 'flex',
  flexDirection: 'row',
  gap: '1rem',
  margin: '0 auto',
};

export const chartDiv = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
};

// --- Boutons ---
const button = {
  padding: '10px',
  border: 'none',
  color: 'black',
  borderRadius: '5px',
  cursor: 'pointer',
  width: '150px',
  height: '75px',
  fontSize : '100%'
};

export const blueButton  = { ...button, background: '#007bff'};
export const greenButton = { ...button, background: '#00ff33'};
export const redButton   = { ...button, background: '#ff0000'};
export const greyButton   = { ...button, background: '#727272ff'};

