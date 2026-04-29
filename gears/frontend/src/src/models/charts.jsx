// src/Chart.jsx
import { LabelList, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Outlet } from 'react-router-dom';

export function MyBarChart({title, data, valx, valy, unit})
{
  return (
    <div style={styles.chart}>
      <h2>{title}</h2>
      <ResponsiveContainer>
        <BarChart data = {data} margin={{ top: 0, right: 0, left: -25, bottom: 25 }}>
          <XAxis dataKey={valx} interval={1} tick={{ fontSize: "15px" }} />
          <YAxis dataKey={valy} tick={{ fontSize: "10px" }}/>{/* 3. La bulle qui apparaît au survol */}
          <Tooltip />{/* 4. La ligne de données */}
          <Bar type="monotone" dataKey={valy} stroke="#8884d8" strokeWidth={2} dot={false} >
            <LabelList 
              dataKey={valy} 
              position="top"   // Place la valeur au-dessus de la barre
              offset={10}      // Petit espace entre la barre et le texte
              style={{ fontSize: '7px', fill: '#666', fontWeight: 'bold' }}
              formatter={(value) => `${value}${unit}`} 
            />
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MyLineChart ({title, data, valx, valy})
{
  return (
    <div style={styles.chart}>
      <h2>{title}</h2>
      <ResponsiveContainer>
        <LineChart data = {data} margin={{ top: 0, right: 0, left: -25, bottom: 25 }}>
          <XAxis dataKey={valx} interval={238} tick={{ fontSize: "15px" }} />
          <YAxis dataKey={valy} tick={{ fontSize: "10px" }}/>{/* 3. La bulle qui apparaît au survol */}
          <Tooltip />{/* 4. La ligne de données */}
          <Line type="monotone" dataKey={valy} stroke="#8884d8" strokeWidth={2} dot={false} >
            {/* <LabelList 
              dataKey={valy} 
              position="top"   // Place la valeur au-dessus de la barre
              offset={10}      // Petit espace entre la barre et le texte
              style={{ fontSize: '10px', fill: '#666', fontWeight: 'bold' }}
              formatter={(value) => `${value}°`} 
            /> */}
            </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const styles = {
  chart: { width: "100%", height: 300 }
};

