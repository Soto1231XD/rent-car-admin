export default function header() {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <h2 className="text-lg font-semibold text-slate-800">
        Sistema interno
      </h2>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">
          Admin
        </span>

        <div className="h-8 w-8 rounded-full bg-slate-300" />
      </div>
    </header>
  );
}