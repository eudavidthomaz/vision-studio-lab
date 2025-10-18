import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApiError {
  error: string;
  type?: 'validation_error' | 'rate_limit_error';
  retry_after?: number;
}

export const useSecureApi = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleApiError = (error: ApiError, functionName: string) => {
    console.error(`${functionName} error:`, error);

    if (error.type === 'rate_limit_error') {
      const retryMinutes = error.retry_after ? Math.ceil(error.retry_after / 60) : 1;
      toast.error(
        `Limite de requisições excedido`,
        {
          description: `Por favor, aguarde ${retryMinutes} minuto(s) antes de tentar novamente.`,
          duration: 5000,
        }
      );
      return;
    }

    if (error.type === 'validation_error') {
      toast.error(
        'Dados inválidos',
        {
          description: error.error,
          duration: 4000,
        }
      );
      return;
    }

    // Generic error
    toast.error(
      'Erro ao processar requisição',
      {
        description: error.error || 'Tente novamente em alguns instantes.',
        duration: 4000,
      }
    );
  };

  const invokeFunction = async <T,>(
    functionName: string,
    body: Record<string, any>
  ): Promise<T | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
      });

      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        handleApiError(
          { 
            error: error.message || 'Erro ao chamar função',
            type: undefined 
          } as ApiError,
          functionName
        );
        return null;
      }

      // Check if response has success: false
      if (data && typeof data === 'object') {
        if ('success' in data && data.success === false) {
          const errorData = {
            error: (data as any).error || 'Erro desconhecido',
            type: (data as any).type
          };
          handleApiError(errorData as ApiError, functionName);
          return null;
        }
        
        // Check if the response itself contains an error
        if ('error' in data) {
          handleApiError(data as ApiError, functionName);
          return null;
        }
      }

      return data as T;
    } catch (err) {
      console.error(`Unexpected error calling ${functionName}:`, err);
      toast.error('Erro inesperado', {
        description: 'Por favor, tente novamente.',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    invokeFunction,
  };
};
