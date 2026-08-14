import { useState } from "react";

export function StudentIdentityModal({ alias, onConfirm }: { alias: string; onConfirm: (alias: string) => void }) {
  const [value, setValue] = useState(alias);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"><form onSubmit={(event) => { event.preventDefault(); onConfirm(value); }} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"><h1 className="text-xl font-bold text-gray-900">¿Cómo te llamamos?</h1><p className="mt-2 text-sm text-gray-600">Tu docente verá este apodo y tu avance en tiempo real.</p><label className="mt-5 block text-sm font-medium text-gray-800">Apodo<input autoFocus value={value} onChange={(event) => setValue(event.target.value)} maxLength={40} className="input-field mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><button className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Empezar</button></form></div>;
}
