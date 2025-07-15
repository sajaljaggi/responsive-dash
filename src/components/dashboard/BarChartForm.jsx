

import React, { useState, useEffect } from "react";

const BarChartForm = ({ defaultConfig, defaultTitle, onSubmit, onCancel, isEditing }) => {
  const [mode, setMode] = useState("manual");
  const [label, setLabel] = useState(defaultTitle || "");
  const [xAxis, setXAxis] = useState(defaultConfig?.xAxis?.data?.join(",") || "");
  const [yAxis, setYAxis] = useState(defaultConfig?.series?.[0]?.data?.join(",") || "");

  // Device mode states
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [deviceData, setDeviceData] = useState(null);
  const [apiUrl, setApiUrl] = useState("");
  const [showKeyInputs, setShowKeyInputs] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);
  const [fetchdataStatus, setFetchdataStatus] = useState(null);
  const [fetchedData, setFetchedData] = useState(null);

  useEffect(() => {
    setFetchStatus(null);
  }, [xKey, yKey, deviceData]);

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => {
      if (Array.isArray(acc)) {
        const index = parseInt(part, 10);
        return acc[index];
      }
      return acc?.[part];
    }, obj);
  };

  const handleFetchData = async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Fetch failed");

      const data = await response.json();
      setFetchedData(data);
      setDeviceData(data);
      setFetchdataStatus("success");
      setShowKeyInputs(true);
    } catch (error) {
      console.error("Fetch error:", error);
      setFetchedData(null);
      setFetchdataStatus("error");
    }
  };

  const handleFetchKeys = () => {
    if (!deviceData) return;

    if (!xKey || !yKey) {
      alert("Please choose both X‑Axis and Y‑Axis keys first.");
      return;
    }

    const xValues = getNestedValue(deviceData, xKey);
    const yValues = getNestedValue(deviceData, yKey);

    if (!Array.isArray(xValues) || !Array.isArray(yValues)) {
      setFetchStatus("error");
      return;
    }

    setXAxis(xValues.join(", "));
    setYAxis(yValues.join(", "));
    const chartLabel = deviceData.datasets?.[0]?.label || "Device Chart";
    setLabel(chartLabel);
    setFetchStatus("success");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const xData = xAxis.split(",").map((item) => item.trim());
    const yData = yAxis.split(",").map((item) => Number(item.trim()));

    const chartOption = {
      title: { text: label, left: "center" },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: { type: "category", data: xData },
      yAxis: { type: "value" },
      series: [{ name: label, data: yData, type: "bar" }],
    };

    onSubmit(chartOption);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Bar Chart Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setFetchStatus(null);
                setFetchdataStatus(null);
                setShowKeyInputs(false);
                setDeviceData(null);
              }}
            >
              <option value="manual">Manual Input</option>
              <option value="device">Fetch from Device</option>
            </select>
          </div>

          {/* Manual Input */}
          {mode === "manual" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chart Title</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. Monthly Sales"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">X Axis (comma separated)</label>
                <input
                  type="text"
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. Jan, Feb, Mar"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Y Axis (comma separated)</label>
                <input
                  type="text"
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. 120, 200, 150"
                  required
                />
              </div>
            </>
          )}

          {/* Device Mode */}
          {mode === "device" && (
            <>
              {/* API URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => {
                    setApiUrl(e.target.value);
                    setFetchdataStatus(null);
                    setShowKeyInputs(false);
                    setDeviceData(null);
                  }}
                  className="w-full border px-3 py-2"
                  placeholder="http://192.168.1.73:3000/api/bar"
                  required
                />
                {!showKeyInputs && (
                  <button
                    type="button"
                    onClick={handleFetchData}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Fetch API Data
                  </button>
                )}
              </div>

              {fetchdataStatus === "success" && (
                <p className="text-green-600 text-sm mt-2">Status: Data fetched successfully</p>
              )}
              {fetchdataStatus === "error" && (
                <p className="text-red-600 text-sm mt-2">Status: Failed to fetch data.</p>
              )}

              {/* Key inputs */}
              {showKeyInputs && (
                <>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis Key</label>
                    <input
                      type="text"
                      value={xKey}
                      onChange={(e) => {
                        setXKey(e.target.value);
                        setFetchStatus(null);
                      }}
                      className="w-full border px-3 py-2"
                      placeholder="e.g. labels"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis Key</label>
                    <input
                      type="text"
                      value={yKey}
                      onChange={(e) => {
                        setYKey(e.target.value);
                        setFetchStatus(null);
                      }}
                      className="w-full border px-3 py-2"
                      placeholder="e.g. datasets.0.data"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchKeys}
                    disabled={!xKey || !yKey}
                    className={`mt-2 px-3 py-1 text-white rounded ${
                      xKey && yKey ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Fetch Keys
                  </button>
                </>
              )}

              {/* Status preview */}
              {fetchStatus && (
                <p className={`text-sm mt-2 ${fetchStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                  {fetchStatus === "success"
                    ? "Status: Keys fetched successfully."
                    : "Status: Failed to fetch keys. Chosen keys must point to array values."}
                </p>
              )}
              {xAxis && yAxis && (
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>X:</strong> {xAxis}</p>
                  <p><strong>Y:</strong> {yAxis}</p>
                </div>
              )}
            </>
          )}

          {/* Buttons */}
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

export default BarChartForm;

