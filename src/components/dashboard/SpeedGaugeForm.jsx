import React, { useState } from "react";

const SpeedGaugeForm = ({ onSubmit, onCancel, defaultConfig, defaultTitle, isEditing }) => {
  const [label, setLabel] = useState(defaultTitle || ""); // Chart title
  const [current, setCurrent] = useState(defaultConfig?.series?.[0]?.data?.[0]?.value?.toString() || "");
  const [min, setMin] = useState(defaultConfig?.series?.[0]?.min?.toString() || "");
  const [max, setMax] = useState(defaultConfig?.series?.[0]?.max?.toString() || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericValue = Number(current.trim());
    const numericMin = Number(min.trim());
    const numericMax = Number(max.trim());

    if (numericMin >= numericMax) {
      setError("Minimum speed must be less than maximum speed.");
      return;
    }

    const chartOption = {
      title: {
        text: label || "Speed Gauge",
        left: "center",
      },
      tooltip: {
        formatter: `{a} <br/>{b}: {c} km/h`,
      },
      series: [
        {
          name: "Speed",
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
            formatter: "{value} km/h",
            fontSize: 16,
          },
          data: [
            {
              value: numericValue,
              name: "Speed",
            },
          ],
        },
      ],
    };

    setError(""); // Clear error
    onSubmit(chartOption, label);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Speed Gauge Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. Vehicle Speed"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Speed (in km/h)</label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. 45"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Speed</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. 0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Speed</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. 200"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

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

export default SpeedGaugeForm;