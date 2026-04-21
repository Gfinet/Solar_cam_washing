// src/Chart.jsx
import { LabelList, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Outlet } from 'react-router-dom';

export function MyBarChart({data, valx, valy, unit})
{
  return (
    <div style={styles.chart}>
      <ResponsiveContainer>
        <BarChart data = {data}>
          {/* <CartesianGrid strokeDasharray="3 3" />2. Les axes (dataKey doit correspondre aux noms dans tes objets) */}
          <XAxis dataKey={valx} interval={1} style={{ fontSize: '20px' }} />
          <YAxis dataKey={valy}/>{/* 3. La bulle qui apparaît au survol */}
          <Tooltip />{/* 4. La ligne de données */}
          <Bar type="monotone" dataKey={valy} stroke="#8884d8" strokeWidth={2} dot={false} >
            <LabelList 
              dataKey={valy} 
              position="top"   // Place la valeur au-dessus de la barre
              offset={10}      // Petit espace entre la barre et le texte
              style={{ fontSize: '10px', fill: '#666', fontWeight: 'bold' }}
              formatter={(value) => `${value}${unit}`} // Ajoute l'unité si tu veux
            />
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MyLineChart ({data, valx, valy})
{
  return (
    <div style={styles.chart}>
      <ResponsiveContainer>
        <LineChart data = {data}>
          {/* <CartesianGrid strokeDasharray="3 3" />2. Les axes (dataKey doit correspondre aux noms dans tes objets) */}
          <XAxis dataKey={valx} interval={238} style={{ fontSize: '20px' }} />
          <YAxis dataKey={valy}/>{/* 3. La bulle qui apparaît au survol */}
          <Tooltip />{/* 4. La ligne de données */}
          <Line type="monotone" dataKey={valy} stroke="#8884d8" strokeWidth={2} dot={false} >
            {/* <LabelList 
              dataKey={valy} 
              position="top"   // Place la valeur au-dessus de la barre
              offset={10}      // Petit espace entre la barre et le texte
              style={{ fontSize: '10px', fill: '#666', fontWeight: 'bold' }}
              formatter={(value) => `${value}°`} // Ajoute l'unité si tu veux
            /> */}
            </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const styles = {
  chart: { width: '100%', height: 300 }
};

