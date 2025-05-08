import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useConnectionLogs } from '@/hooks/useConnectionLogs';

// Utilidad para detectar móvil
function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

const ConnectionLogsTab = () => {
  const { logs, clearLogs } = useConnectionLogs();
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  const handleClearLogs = () => {
    clearLogs();
    toast.success('Connection logs cleared');
  };

  return (
    <div className="h-full flex flex-col">
      <div className={`flex items-center justify-between p-4 border-b bg-gray-50${isMobile() ? ' sticky top-0 z-10' : ''}`}>
        <div className={`flex items-center gap-2${isMobile() ? ' flex-wrap gap-3' : ''}`}>
          <button
            style={{ padding: isMobile() ? '12px 16px' : '4px 8px', border: '1px solid #ccc', background: '#f8f9fa', color: '#222', fontSize: isMobile() ? 16 : 13, borderRadius: 0, boxShadow: 'none', transition: 'none', cursor: 'pointer', fontWeight: 500 }}
            onClick={handleClearLogs}
          >
            Clear Logs
          </button>
          <button
            style={{ padding: isMobile() ? '12px 16px' : '4px 8px', border: '1px solid #ccc', background: '#f8f9fa', color: '#222', fontSize: isMobile() ? 16 : 13, borderRadius: 0, boxShadow: 'none', transition: 'none', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
        <span style={{ fontSize: isMobile() ? 16 : 13, background: '#fff', padding: isMobile() ? '8px 12px' : '4px 8px', border: '1px solid #ccc', color: '#333', borderRadius: 0, fontWeight: 500 }}>{logs.length} events</span>
      </div>

      <div className={`flex items-center justify-between mb-2${isMobile() ? ' px-2' : ''}`}>
        <div className="flex gap-2">
          <button
            style={{ padding: isMobile() ? '12px 16px' : '4px 8px', border: '1px solid #ccc', background: '#f8f9fa', color: '#222', fontSize: isMobile() ? 16 : 13, borderRadius: 0, boxShadow: 'none', transition: 'none', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => {
              const logText = logs.map(log => {
                return `[${log.type}] ${log.message}${log.details ? ' | ' + (typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)) : ''}`;
              }).join('\n');
              navigator.clipboard.writeText(logText);
              toast.success('Logs copiados al portapapeles');
            }}
          >
            Copiar logs
          </button>
          <button
            style={{ padding: isMobile() ? '12px 16px' : '4px 8px', border: '1px solid #ccc', background: '#f8f9fa', color: '#222', fontSize: isMobile() ? 16 : 13, borderRadius: 0, boxShadow: 'none', transition: 'none', cursor: 'pointer', fontWeight: 500 }}
            onClick={async () => {
              try {
                const now = new Date();
                const userAgent = navigator.userAgent;
                
                // Detectar wallet específica
                const isSolflare = userAgent.includes('Solflare-Mobile');
                const isPhantom = userAgent.includes('Phantom');
                
                // Detectar navegador
                let browser = 'Desconocido';
                if (isSolflare) browser = 'Solflare Mobile';
                else if (isPhantom) browser = 'Phantom Mobile';
                else {
                  const browserMatch = userAgent.match(/(?:Chrome|Firefox|Safari|Opera|Edge)\/(\d+\.\d+)/);
                  if (browserMatch) browser = browserMatch[0];
                }
                
                // Detectar sistema
                let system = 'Desconocido';
                const systemMatch = userAgent.match(/(?:Windows|Mac|Linux|Android|iOS)/);
                if (systemMatch) system = systemMatch[0];
                else if (isSolflare || isPhantom) system = 'Mobile Wallet';

                const meta = [
                  `METADATOS`,
                  `Fecha/Hora: ${now.toISOString()}`,
                  `User Agent: ${userAgent}`,
                  `URL: ${window.location.href}`,
                  `Total Logs: ${logs.length}`,
                  `Plataforma: ${isMobile() ? 'Móvil' : 'Desktop'}`,
                  `Navegador: ${browser}`,
                  `Sistema: ${system}`,
                  `LOGS`
                ].join('\n');

                const logText = logs.map(log => {
                  const details = log.details 
                    ? `\nDetalles:\n${typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : String(log.details)}`
                    : '';
                  
                  const logEntry = [
                    `[${log.type}] ${formatTimestamp(log.timestamp)}`,
                    `Mensaje: ${log.message}`,
                    details
                  ].filter(Boolean).join('\n');

                  return logEntry;
                }).join('\n\n');

                const fullText = meta + '\n\n' + logText;

                // Método de copiado mejorado
                const copyToClipboard = async (text: string) => {
                  // Crear un elemento textarea temporal
                  const textArea = document.createElement('textarea');
                  textArea.value = text;
                  
                  // Asegurar que el textarea sea visible pero fuera de la pantalla
                  textArea.style.position = 'fixed';
                  textArea.style.left = '-999999px';
                  textArea.style.top = '-999999px';
                  textArea.style.opacity = '0';
                  textArea.style.pointerEvents = 'none';
                  document.body.appendChild(textArea);
                  
                  try {
                    // Intentar usar la API del portapapeles primero
                    if (navigator.clipboard && window.isSecureContext) {
                      await navigator.clipboard.writeText(text);
                      return true;
                    }
                    
                    // Fallback al método execCommand
                    textArea.focus();
                    textArea.select();
                    
                    // Intentar copiar usando execCommand
                    const successful = document.execCommand('copy');
                    if (!successful) {
                      throw new Error('execCommand falló');
                    }
                    return true;
                  } catch (err) {
                    console.error('Error al copiar:', err);
                    
                    // Último intento: usar el portapapeles de la API antigua
                    try {
                      const clipboardItem = new ClipboardItem({
                        'text/plain': new Blob([text], { type: 'text/plain' })
                      });
                      await navigator.clipboard.write([clipboardItem]);
                      return true;
                    } catch (clipboardErr) {
                      console.error('Error al usar ClipboardItem:', clipboardErr);
                      return false;
                    }
                  } finally {
                    // Limpiar
                    if (document.body.contains(textArea)) {
                      document.body.removeChild(textArea);
                    }
                  }
                };

                const success = await copyToClipboard(fullText);
                if (success) {
                  toast.success('Logs completos copiados al portapapeles');
                } else {
                  throw new Error('No se pudo copiar el texto');
                }
              } catch (error) {
                console.error('Error al copiar logs:', error);
                toast.error('Error al copiar los logs. Intenta usar el botón "Copiar logs" en su lugar.');
              }
            }}
          >
            Copiar logs completos
          </button>
        </div>
        <div className="flex gap-2">
          <button
            style={{ padding: isMobile() ? '12px 16px' : '4px 8px', border: '1px solid #ccc', background: '#f8f9fa', color: '#222', fontSize: isMobile() ? 16 : 13, borderRadius: 0, boxShadow: 'none', transition: 'none', cursor: 'pointer', fontWeight: 500 }}
            onClick={handleClearLogs}
          >
            Limpiar Logs
          </button>
          <button
            style={{ padding: isMobile() ? '12px 16px' : '4px 8px', border: '1px solid #ccc', background: '#f8f9fa', color: '#222', fontSize: isMobile() ? 16 : 13, borderRadius: 0, boxShadow: 'none', transition: 'none', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => window.location.reload()}
          >
            Refrescar
          </button>
        </div>
      </div>

      <ScrollArea className="flex-grow" style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
        <div>
          {logs.map((log, index) => {
            let color = '#222';
            if (log.type.toLowerCase().includes('error')) color = '#b00020';
            else if (log.type.toLowerCase().includes('warning')) color = '#b88600';
            else if (log.type.toLowerCase().includes('success')) color = '#006400';
            return (
              <div key={index} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #eee' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color }}>{log.type}</span>
                  {' '}
                  <span style={{ color }}>{log.message}</span>
                  {' '}
                  <span style={{ fontFamily: 'monospace', color: '#888' }}>{formatTimestamp(log.timestamp)}</span>
                  {log.details && (
                    <button
                      style={{ marginLeft: 8, background: 'none', border: 'none', color: '#0074d9', fontSize: 13, padding: 0, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
                      onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseOut={e => e.currentTarget.style.textDecoration = 'underline'}
                      onClick={() => toggleLogExpansion(index)}
                    >
                      {expandedLogs.has(index) ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>
                  )}
                </div>
                {expandedLogs.has(index) && log.details && (
                  <div>
                    <pre style={{ fontFamily: 'monospace', fontSize: 13, background: '#f6f6f6', margin: '6px 0 0 0', padding: '8px 12px', whiteSpace: 'pre', wordBreak: 'break-all', color: '#222' }}>
                      {typeof log.details === 'object'
                        ? JSON.stringify(log.details, null, 2)
                        : String(log.details)}
                    </pre>
                    {(log.type === 'balance_error' || log.type === 'balance_warning') && (
                      <button
                        style={{ background: 'none', border: 'none', color: '#0074d9', fontSize: 13, padding: 0, marginTop: 4, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
                        onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={e => e.currentTarget.style.textDecoration = 'underline'}
                        onClick={e => {
                          e.stopPropagation();
                          const now = new Date();
                          const meta = [
                            `Fecha/Hora: ${now.toISOString()}`,
                            `User Agent: ${navigator.userAgent}`,
                            `URL: ${window.location.href}`
                          ].join('\n');
                          const errorText = [
                            meta,
                            `Type: ${log.type}`,
                            `Message: ${log.message}`,
                            `Details: ${typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : String(log.details)}`
                          ].join('\n');
                          navigator.clipboard.writeText(errorText);
                          toast.success('Error copiado al portapapeles');
                        }}
                      >
                        Copiar error
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {logs.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', fontSize: 15, padding: '48px 0', userSelect: 'none', fontWeight: 400 }}>
              No connection logs yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConnectionLogsTab;
