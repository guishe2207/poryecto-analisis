import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg p-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">Turno {label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : '—'}
        </p>
      ))}
    </div>
  );
};

export default function PerformanceChart({ chartData, showDerivatives = true }) {
  if (!chartData || chartData.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-600 text-sm italic">
        Jugando… los datos aparecerán aquí
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gráfico de f(x) */}
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">f(x) — Índice de Rendimiento</p>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="turno" tick={{ fill: '#6b7280', fontSize: 10 }} label={{ value: 'Turno (x)', position: 'insideBottomRight', offset: -4, fill: '#6b7280', fontSize: 9 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="fx" name="f(x)"
              stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de derivadas */}
      {showDerivatives && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">f′(x) — Métodos de Derivación Numérica</p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="turno" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="forward"  name="Adelante"  stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="5 2" connectNulls={false} />
              <Line type="monotone" dataKey="backward" name="Atrás"     stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="central"  name="Central"   stroke="#a78bfa" strokeWidth={2}   dot={{ r: 2 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
