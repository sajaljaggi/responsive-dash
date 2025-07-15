import React, { useEffect, useState } from "react";
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import {
  Plus, X, Move, TrendingUp, Zap, LineChart, PieChart, BarChart3,
  Activity, Thermometer, GaugeCircle, Settings
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import LineChartForm from "./LineChartForm";
import BarChartForm from "./BarChartForm";
import PieChartForm from "./PieChartForm";
import TemperatureGaugeForm from "./TempGaugeForm";
import SpeedGaugeForm from "./SpeedGaugeForm";
import ConvertChartForm from "./ConvertChartForm";
const ResponsiveGridLayout = WidthProvider(Responsive);

const componentLibrary = {
  lineChart: { name: "Line Chart", icon: LineChart },
  barChart: { name: "Bar Chart", icon: BarChart3 },
  pieChart: { name: "Pie Chart", icon: PieChart },
  areaChart: { name: "Area Chart", icon: Activity },
  kpiCard: { name: "KPI Card", icon: TrendingUp },
  metricCard: { name: "Metric Card", icon: Zap },
  temperatureGauge: { name: "Temperature Gauge", icon: Thermometer },
  speedGauge: { name: "Speed Gauge", icon: GaugeCircle },
};

const chartForms = {
  lineChart: LineChartForm,
  barChart: BarChartForm,
  pieChart: PieChartForm,
  temperatureGauge: TemperatureGaugeForm,
  speedGauge: SpeedGaugeForm
};

const Dashboard = () => {
  const [widgets, setWidgets] = useState(() => JSON.parse(localStorage.getItem("widgets")) || {});
  const [layouts, setLayouts] = useState(() => JSON.parse(localStorage.getItem("layouts")) || {});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [isConfigureMode, setIsConfigureMode] = useState(false);
  const [convertMode, setConvertMode] = useState(false);
  const [selectedConvertWidgetId, setSelectedConvertWidgetId] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);

useEffect(() => {
  const fetchWeather = async () => {
    try {
      const city = "delhi";
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=a65a9a1a40187c31c0bf3a15ff310fa5`
      );
      const data = await res.json();

      setWeatherData({
        city: data.name,
        temp: data.main.temp,
        condition: data.weather[0].main,
      });
    } catch (err) {
      console.error("Weather fetch error:", err);
    } finally { 
      setIsWeatherLoading(false);
    }
  };

  fetchWeather();
  const interval = setInterval(fetchWeather, 20 * 60 * 1000); // refresh every 20 minutes
  return () => clearInterval(interval);
}, []);


  useEffect(() => {
    localStorage.setItem("widgets", JSON.stringify(widgets));
    localStorage.setItem("layouts", JSON.stringify(layouts));
  }, [widgets, layouts]);

  const generateId = () => `comp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

  const handleAddChartClick = (type) => {
    if (!chartForms[type]) {
      addWidget(type);
      setShowAddModal(false);
    } else {
      setSelectedChartType(type);
      setFormVisible(true);
      setShowAddModal(false);

    }
  };

  const addWidget = (type, chartConfig = null) => {
    const id = generateId();
    const newWidget = {
      [id]: {
        id,
        type,
        title: componentLibrary[type].name,
        chartOptions: chartConfig,
      },
    };
    setWidgets((prev) => ({ ...prev, ...newWidget }));
    setLayouts((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((bp) => {
        updated[bp] = [
          ...(updated [bp] || []),
          { i: id, x: 0, y: Infinity, w: 4, h: 6 },
        ];
      });
      return updated;
    });
    setFormVisible(false);
    setSelectedChartType(null);
  };

  const removeWidget = (id) => {
    setWidgets((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setLayouts((prev) => {
      const updated = {};
      for (const key in prev) {
        updated[key] = prev[key].filter((item) => item.i !== id);
      }
      return updated;
    });
  };

  
  const resetDashboard = () => {
    setWidgets({});
    setLayouts({});
    localStorage.removeItem("widgets");
    localStorage.removeItem("layouts");
  };

  const handleConfigure = (id) => {
    const widget = widgets[id];
    setSelectedWidgetId(id);
    setSelectedChartType(widget.type);
    setFormVisible(true);
  };

  
  const updateWidget = (config) => {
  if (!selectedWidgetId) return;

  setWidgets((prev) => ({
    ...prev,
    [selectedWidgetId]: {
      ...prev[selectedWidgetId],
      chartOptions: config,
      title: config.title?.text || prev[selectedWidgetId].title,
    },
  }));

  setFormVisible(false);
  setSelectedWidgetId(null);
};


const renderChart = (type, options = null, onClick = null, convertMode = false) => {
  if (type === "kpiCard") {
    return (
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-2">$24,567</div>
        <div className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</div>
        <div className="text-sm text-green-600 flex justify-center items-center">
          <TrendingUp className="w-4 h-4 mr-1" /> +12.5% from last month
        </div>
      </div>
    );
  }

  if (options && options.series && Array.isArray(options.series) && options.series.length > 0) {
 
    return (
      <div
        onClick={convertMode && onClick ? onClick : undefined}
        className={`w-full h-full ${convertMode ? "cursor-pointer hover:ring-2 ring-green-500" : ""}`}
      >
        <ReactECharts
          option={options}
          notMerge={true}
          lazyUpdate={true}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    );
  }

  return <div className="text-center text-gray-400">No Chart Data</div>;
};

const ChartFormComponent = selectedChartType ? chartForms[selectedChartType] : null;

const ALLOWED_CONVERSION_TYPES = ["lineChart", "barChart", "pieChart"];

const handleStartChartConversion = (id) => {
  const chartType = widgets[id]?.type;
  
  console.log("Chart Type:", chartType);

  if (!ALLOWED_CONVERSION_TYPES.includes(chartType)) {
    alert("Conversion is only allowed for Line, Bar, and Pie charts.");
    return;
  }

  setSelectedConvertWidgetId(id);
  setConvertMode(true);
};



  return (
    
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        {/* <div className="w-30 p-1 bg-white shadow-inner border-l border-gray-200 hidden md:block"> */}
        <div className="hidden md:block text-sm text-gray-700 leading-tight">

      <h2 className="text-lg font-semibold mb-2">🌤️ Weather</h2>
      {isWeatherLoading ? (
      <p className="text-gray-500">Loading...</p>
      ) : (
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {weatherData?.temp}°C
        </div>  
        <div className="text-gray-600 text-sm mt-1">
          {weatherData?.condition} in {weatherData?.city}
        </div>
      </div>
  )}
</div>

        {/* <h1 className="text-2xl md:text-3xl font-bold">Dynamic Dashboard</h1> */}
        
        <div className="mt-4">
        <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={isConfigureMode}
      onChange={() => setIsConfigureMode(!isConfigureMode)}
    />
    <span>Configure Charts Mode</span>
  </label>
  <p className="text-xs text-gray-500 mt-1">
    When enabled, click any chart to configure its settings.
  </p>
  </div>
    
    <div className="p-4">
  <div className="flex flex-col items-start gap-1 mb-4">
    <label className="inline-flex items-center">
      <input
        type="checkbox"
        checked={convertMode}
        onChange={(e) => setConvertMode(e.target.checked)}
        className="form-checkbox"
      />
      <span className="ml-2">Convert Charts Mode</span>
    </label>
    <p className="text-xs text-gray-500 ml-6">
      When enabled, click any chart to convert. 
    </p>
  </div>
</div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4 inline-block mr-1" /> Settings
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
            onClick={resetDashboard}
          >
            Reset
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${isLocked ? "bg-yellow-500" : "bg-green-600"} text-white`}
            onClick={() => setIsLocked(!isLocked)}
          >
            {isLocked ? "Unlock Layout" : "Lock Layout"}
          </button>
          
          
        </div>
      </div>
      
    
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 480, xs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 2 }}
        rowHeight={50}
        onLayoutChange={(layout, allLayouts) => setLayouts(allLayouts)}
        draggableHandle=".drag-handle"
        isDraggable={!isLocked}
        isResizable={!isLocked}
      >
        {Object.entries(widgets).map(([id, { type, title, chartOptions }]) => (
    <div key={id} className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      
      <div className="flex justify-between items-center p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 drag-handle cursor-move">
          <Move className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-700 text-sm md:text-base">
            {chartOptions?.title?.text || "Untitled Chart"}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const confirmDelete = window.confirm("Are you sure you want to delete this chart?");
              if (confirmDelete) {
                removeWidget(id);
              }
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      
      <div className="p-4 h-full w-full flex items-center justify-center">
        <div
          className={`w-full h-full ${isConfigureMode ? "cursor-pointer hover:ring-2 ring-blue-500" : ""}`}
          onClick={() => {
            if (isConfigureMode) handleConfigure(id);
            else if (convertMode) handleStartChartConversion(id);
          }}
        >
          {renderChart(type, chartOptions)}
        </div>
      </div>
    </div>
  ))}


      </ResponsiveGridLayout>

      


      {selectedConvertWidgetId && (
        <ConvertChartForm
          defaultTitle={widgets[selectedConvertWidgetId].title}
          defaultConfig={widgets[selectedConvertWidgetId].chartOptions}
          originalType={widgets[selectedConvertWidgetId].type}
          onSubmit={(newType, chartOption, title) => {
  setWidgets((prev) => ({
    ...prev,
    [selectedConvertWidgetId]: {
      ...prev[selectedConvertWidgetId],
      chartOptions: chartOption,
      title,
      type: newType,
    },
  }));
  setSelectedConvertWidgetId(null);
}}

          onCancel={() => setSelectedConvertWidgetId(null)}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => { setShowAddModal(true); setShowSettings(false); }}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg mb-2"
            >
            <Plus className="w-4 h-4 inline-block mr-1" /> Add Component
            </button>
            
            
            
            
        </div>  
      </div>

      )}
      
      
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add Component</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(componentLibrary).map(([key, { name, icon: Icon }]) => (
                <button
                  key={key}
                  onClick={() => handleAddChartClick(key)}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50"
                >
                  <Icon className="w-6 h-6 text-blue-600" />
                  <span className="font-medium text-gray-800">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
     
      
      {formVisible && ChartFormComponent && (
        <ChartFormComponent
          onSubmit={selectedWidgetId ? updateWidget : (config) => addWidget(selectedChartType, config)}
          onCancel={() => {
            setFormVisible(false);
            setSelectedChartType(null);
            setSelectedWidgetId(null);
          }}
          defaultConfig={selectedWidgetId ? widgets[selectedWidgetId]?.chartOptions : null}
          defaultTitle={
          selectedWidgetId ? widgets[selectedWidgetId]?.title : ""
    }
          isEditing={!!selectedWidgetId} 
        />
      )}
    </div>
  );
};


export default Dashboard;

