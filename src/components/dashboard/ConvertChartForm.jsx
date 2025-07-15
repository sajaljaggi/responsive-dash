import React, { useState, useEffect } from "react";

const ConvertChartForm = ({
  originalType,
  defaultConfig,
  defaultTitle,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(defaultTitle || "");
  const [labels, setLabels] = useState("");
  const [values, setValues] = useState("");
  const [newType, setNewType] = useState("");

  useEffect(() => {
  if (!defaultConfig) return;

  const seriesData = defaultConfig.series?.[0]?.data || [];
  const xLabels = defaultConfig.xAxis?.data || [];

  // If the data is in pie format (objects with name/value)
  if (seriesData.length && typeof seriesData[0] === "object") {
    setLabels(seriesData.map((d) => d.name).join(", "));
    setValues(seriesData.map((d) => d.value).join(", "));
  } 
  // If the data is line/bar format (array of numbers)
  else if (Array.isArray(seriesData) && xLabels.length) {
    setLabels(xLabels.join(", "));
    setValues(seriesData.join(", "));
  }
}, [defaultConfig]);

useEffect(() => {
  console.log("originalType is:", originalType);
}, [originalType]);

  const getConvertibleTypes = () => {
    const baseType = originalType?.replace("Chart", "").toLowerCase();
    if (baseType === "pie") return ["line", "bar"];
    if (baseType === "line") return ["bar", "pie"];
    if (baseType === "bar") return ["line", "pie"];
    return [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const labelArr = labels.split(",").map((l) => l.trim());
    const valueArr = values.split(",").map((v) => Number(v.trim()));

    const seriesData = labelArr.map((name, index) => ({
      name,
      value: valueArr[index] || 0,
    }));

    let chartOption = {};

    if (newType === "pie") {
      chartOption = {
        title: { text: title, left: "center" },
        tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c} ({d}%)" },
        legend: { orient: "vertical", left: "left" },
        series: [{ name: "Converted", type: "pie", radius: "50%", data: seriesData }],
      };
    } else {
      chartOption = {
        title: { text: title, left: "center" },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: labelArr },
        yAxis: { type: "value" },
        series: [{ data: valueArr, type: newType }],
      };
    }

    onSubmit(newType, chartOption, title);
  };
  console.log("defaultConfig is", defaultConfig);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Convert Chart</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labels (comma separated)</label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Values (comma separated)</label>
            <input
              type="text"
              value={values}
              onChange={(e) => setValues(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Convert To</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select type</option>
              {getConvertibleTypes().map((type) => (
                <option key={type} value={type}>
                  {type[0].toUpperCase() + type.slice(1)}
                </option>
              ))}
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
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
            >
              Convert Chart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertChartForm;