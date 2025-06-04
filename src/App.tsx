import "./App.css";
import CrossLitVis from "./components/CrossLitVis";

function App() {
  return (
    <div className="flex flex-row items-center justify-center h-full">
      <CrossLitVis path="/sample.json" />
    </div>
  );
}

export default App;
