import React, { useState, useEffect } from "react";

const PieChartForm = ({ defaultConfig, defaultTitle, onSubmit, onCancel, isEditing }) => {
  const [mode, setMode] = useState("manual");
  const [label, setLabel] = useState(defaultTitle || "");
  const [labels, setLabels] = useState(
    defaultConfig?.series?.[0]?.data?.map((d) => d.name).join(",") || ""
  );
  const [values, setValues] = useState(
    defaultConfig?.series?.[0]?.data?.map((d) => d.value).join(",") || ""
  );

  const [apiUrl, setApiUrl] = useState("");
  const [deviceData, setDeviceData] = useState(null);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [showKeyInputs, setShowKeyInputs] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null); // "success" | "error" | null
  const [fetchdataStatus, setFetchdataStatus] = useState(null);
  const [fetchedData, setFetchedData] = useState(null);

  useEffect(() => {
    setFetchStatus(null);
  }, [xKey, yKey, deviceData]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => {
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
      alert("Please choose both Labels and Values keys.");
      return;
    }

    const labelArr = getNestedValue(deviceData, xKey);
    const valueArr = getNestedValue(deviceData, yKey);

    if (!Array.isArray(labelArr) || !Array.isArray(valueArr)) {
      setFetchStatus("error");
      return;
    }

    setLabels(labelArr.join(", "));
    setValues(valueArr.join(", "));
    const chartLabel = deviceData.datasets?.[0]?.label || "Device Chart";
    setLabel(chartLabel);
    setFetchStatus("success");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const labelArr = labels.split(",").map((item) => item.trim());
    const valueArr = values.split(",").map((item) => Number(item.trim()));

    const chartOption = {
      title: {
        text: label || "Pie Chart",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: "Categories",
          type: "pie",
          radius: "50%",
          data: labelArr.map((l, i) => ({ name: l, value: valueArr[i] || 0 })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    onSubmit(chartOption, label);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Pie Chart Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Mode Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="manual">Manual Input</option>
              <option value="device">Fetch from Device</option>
            </select>
          </div>

          {/* Manual Inputs */}
          {mode === "manual" && (
            <>
              <div>
                <label className="block mb-1">Chart Title</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Monthly Sales"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Labels (comma separated)</label>
                <input
                  type="text"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. A, B, C"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Values (comma separated)</label>
                <input
                  type="text"
                  value={values}
                  onChange={(e) => setValues(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. 20, 30, 50"
                  required
                />
              </div>
            </>
          )}

          {/* Device Mode */}
          {mode === "device" && (
            <>
              <div>
                <label className="block mb-1">API URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => {
                    setApiUrl(e.target.value);
                    setFetchdataStatus(null);
                  }}
                  className="w-full border px-3 py-2"
                  placeholder="http://192.168.1.73:3000/api/pie"
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

              {showKeyInputs && (
                <>
                  <div className="mt-2">
                    <label className="block mb-1">Labels Key</label>
                    <input
                      type="text"
                      value={xKey}
                      onChange={(e) => setXKey(e.target.value)}
                      className="w-full border px-3 py-2"
                      placeholder="e.g. labels"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block mb-1">Values Key</label>
                    <input
                      type="text"
                      value={yKey}
                      onChange={(e) => setYKey(e.target.value)}
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
                      xKey && yKey
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Fetch Keys
                  </button>
                </>
              )}

              {fetchStatus && (
                <p
                  className={`mt-1 text-sm ${
                    fetchStatus === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {fetchStatus === "success"
                    ? "Keys fetched successfully."
                    : "Failed to fetch keys. Ensure keys point to arrays."}
                </p>
              )}

              {labels && values && (
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Labels:</strong> {labels}</p>
                  <p><strong>Values:</strong> {values}</p>
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

export default PieChartForm;
