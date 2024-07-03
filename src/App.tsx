import HostApp from './components/HostApp';

function App() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f6f5ef]">
      <div className=" font-bold text-4xl mb-8">OnRamp Demo</div>
      <div>To start, select a vendor from the list below.</div>
      <div>
        <HostApp />
      </div>
    </div>
  );
}

export default App;
