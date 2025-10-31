'use client';

import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <FileQuestion className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página No Encontrada</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
