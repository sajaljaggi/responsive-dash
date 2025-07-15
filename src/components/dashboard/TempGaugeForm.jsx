import React, { useState } from "react";

const TempGaugeForm = ({ onSubmit, onCancel, defaultConfig, defaultTitle, isEditing }) => {
  const [label, setLabel] = useState(defaultTitle || "");
  const [current, setCurrent] = useState(
    defaultConfig?.series?.[0]?.data?.[0]?.value?.toString() || ""
  );
  const [min, setMin] = useState(
    defaultConfig?.series?.[0]?.min?.toString() || ""
  );
  const [max, setMax] = useState(
    defaultConfig?.series?.[0]?.max?.toString() || ""
  );
  const [unit, setUnit] = useState(
    defaultConfig?.series?.[0]?.data?.[0]?.name || "Celsius"
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const numericValue = Number(current.trim());
    const numericMin = Number(min.trim());
    const numericMax = Number(max.trim());

    if (numericMin >= numericMax) {
    alert("Minimum temperature must be less than maximum temperature.");
    return;
  }

    const isFahrenheit = unit === "Fahrenheit";
    const formatter = isFahrenheit ? "{value}°F" : "{value}°C";

    const chartOption = {
      title: {
        text: label || "Temperature Gauge",
        left: "center",
      },
      tooltip: {
        formatter: `{a} <br/>{b}: {c}°${isFahrenheit ? "F" : "C"}`,
      },
      series: [
        {
          name: "Temperature",
          type: "gauge",
          min: numericMin,
          max: numericMax,
          splitNumber: 5,
          axisLine: {
            lineStyle: {
              width: 10,
            },
          },
          detail: {
            formatter,
            fontSize: 16,
          },
          data: [
            {
              value: numericValue,
              name: unit,
            },
          ],
        },
      ],
    };

    onSubmit(chartOption, label);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Temperature Gauge Configuration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chart Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. Temperature Gauge"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Temperature
            </label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. 25"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Temperature
            </label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. -30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Temperature
            </label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. 50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="Celsius">Celsius (°C)</option>
              <option value="Fahrenheit">Fahrenheit (°F)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEditing ? "Update Chart" : "Add Chart"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TempGaugeForm;

