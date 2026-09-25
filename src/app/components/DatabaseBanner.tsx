import { useState } from 'react';
import { Database, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { initializeDatabase } from '../services/atosApi';

interface DatabaseBannerProps {
  isOnline: boolean | null;
  onDismiss: () => void;
  onInitialized: () => void;
}

export function DatabaseBanner({ isOnline, onDismiss, onInitialized }: DatabaseBannerProps) {
  const [initializing, setInitializing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // Não mostrar se está online
  if (isOnline === true) {
    return null;
  }

  const handleInitialize = async () => {
    setInitializing(true);
    setError(false);
    
    try {
      const result = await initializeDatabase();
      
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onInitialized();
        }, 2000);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      setError(true);
    } finally {
      setInitializing(false);
    }
  };

  if (success) {
    return (
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-5">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">Banco de dados inicializado!</h3>
            <p className="text-sm text-green-700">Seus atos agora serão sincronizados entre dispositivos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-5">
      <div className="flex items-start gap-3">
        {error ? (
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        ) : (
          <Database className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-amber-900">
                {error ? 'Erro ao inicializar banco de dados' : 'Modo local ativo'}
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                {error 
                  ? 'Não foi possível criar a tabela automaticamente. Seus dados estão salvos localmente neste navegador.'
                  : 'Seus atos estão salvos apenas neste navegador. Para sincronizar entre dispositivos, inicialize o banco de dados.'}
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="text-amber-600 hover:text-amber-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {!error && (
            <button
              onClick={handleInitialize}
              disabled={initializing}
              className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              {initializing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inicializando...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Inicializar Banco de Dados
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
