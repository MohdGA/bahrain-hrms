export default function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className="text-sm text-gray-400 mt-1">This module is coming soon</p>
    </div>
  );
}
