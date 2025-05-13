import React from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  type: 'bar' | 'pie';
  data: ChartData[];
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, type, data }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-yellow-500', 'bg-red-500', 'bg-indigo-500',
    'bg-pink-500', 'bg-teal-500'
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {type === 'bar' ? (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">{item.name}</span>
                <span className="text-sm font-medium text-gray-900">{item.value.toLocaleString()} €</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${colors[index % colors.length]}`} 
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center mt-4">
          <div className="relative w-40 h-40">
            {data.map((item, index) => {
              const total = data.reduce((sum, i) => sum + i.value, 0);
              const percentage = (item.value / total) * 100;
              let startAngle = 0;
              
              // Calculate starting angle based on previous segments
              for (let i = 0; i < index; i++) {
                startAngle += (data[i].value / total) * 360;
              }
              
              return (
                <div 
                  key={item.name}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    clipPath: `conic-gradient(from ${startAngle}deg, transparent ${percentage}%, transparent 0)`
                  }}
                >
                  <div className={`w-full h-full ${colors[index % colors.length]}`}></div>
                </div>
              );
            })}
            <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-800">{data.length} catégories</span>
            </div>
          </div>
        </div>
      )}

      {type === 'pie' && (
        <div className="grid grid-cols-2 gap-2 mt-6">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`}></div>
              <div>
                <span className="text-xs text-gray-600">{item.name}</span>
                <span className="text-xs text-gray-800 ml-1">({item.value}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartCard;