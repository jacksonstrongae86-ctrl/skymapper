// API Documentation Page
import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  tags: string[];
  parameters?: Array<{ name?: string; required?: boolean; in?: string; schema?: { type?: string }; description?: string }>;
  requestBody?: { content?: Record<string, { schema?: unknown }> };
}

interface OpenAPISpec {
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, Record<string, {
    summary?: string;
    tags?: string[];
    parameters?: unknown[];
    requestBody?: unknown;
  }>>;
}

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    fetch('/openapi.json')
      .then(res => res.json())
      .then(data => setSpec(data as OpenAPISpec))
      .catch(err => console.error('Failed to load API spec:', err));
  }, []);

  if (!spec) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Cargando documentación API...</div>
      </div>
    );
  }

  // Extract endpoints
  const endpoints: Endpoint[] = [];
  Object.keys(spec.paths).forEach(path => {
    Object.keys(spec.paths[path]).forEach(method => {
      const endpoint = spec.paths[path][method];
      endpoints.push({
        method: method.toUpperCase(),
        path,
        summary: endpoint.summary || '',
        tags: endpoint.tags || [],
        parameters: endpoint.parameters as Endpoint['parameters'],
        requestBody: endpoint.requestBody as Endpoint['requestBody'],
      });
    });
  });

  // Get unique categories
  const categories = ['all', ...new Set(endpoints.flatMap(e => e.tags))];

  // Filter endpoints
  const filteredEndpoints = selectedCategory === 'all'
    ? endpoints
    : endpoints.filter(e => e.tags.includes(selectedCategory));

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-600';
      case 'POST': return 'bg-blue-600';
      case 'PUT': return 'bg-yellow-600';
      case 'DELETE': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const generateCurl = (endpoint: Endpoint) => {
    const baseUrl = 'http://localhost:3338/api';
    let curl = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}"`;
    
    if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
      curl += ' \\\n  -H "Content-Type: application/json" \\\n  -d \'{"example": "data"}\'';
    }
    
    return curl;
  };

  return (
    <>
      <Head>
        <title>SkyMapper API Documentation</title>
      </Head>
      
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 py-6">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {spec.info.title}
            </h1>
            <p className="text-gray-400">
              {spec.info.description}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Version: {spec.info.version}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoints List */}
          <div className="space-y-4">
            {filteredEndpoints.map((endpoint, idx) => {
              const endpointKey = `${endpoint.method}-${endpoint.path}`;
              const isExpanded = expandedEndpoint === endpointKey;

              return (
                <div key={idx} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  {/* Endpoint Header */}
                  <button
                    onClick={() => setExpandedEndpoint(isExpanded ? null : endpointKey)}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-750 transition"
                  >
                    <span className={`${getMethodColor(endpoint.method)} px-3 py-1 rounded text-white font-bold text-sm`}>
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-gray-300 flex-1 text-left">
                      /api{endpoint.path}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {endpoint.summary}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-700">
                      {/* Parameters */}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2 mt-4">Parámetros:</h4>
                          <div className="space-y-2">
                            {endpoint.parameters.map((param: { name?: string; required?: boolean; in?: string; schema?: { type?: string }; description?: string }, i: number) => (
                              <div key={i} className="bg-gray-900 p-3 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-blue-400">{param.name}</span>
                                  {param.required && (
                                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                                      requerido
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {param.in} | {param.schema?.type}
                                  </span>
                                </div>
                                {param.description && (
                                  <p className="text-sm text-gray-400 mt-1">{param.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {endpoint.requestBody && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2 mt-4">Cuerpo de la petición:</h4>
                          <pre className="bg-gray-900 p-4 rounded overflow-x-auto">
                            <code className="text-sm text-green-400">
                              {JSON.stringify(
                                endpoint.requestBody.content?.['application/json']?.schema,
                                null,
                                2
                              )}
                            </code>
                          </pre>
                        </div>
                      )}

                      {/* cURL Example */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2 mt-4">Ejemplo cURL:</h4>
                        <pre className="bg-gray-900 p-4 rounded overflow-x-auto">
                          <code className="text-sm text-gray-300">
                            {generateCurl(endpoint)}
                          </code>
                        </pre>
                      </div>

                      {/* Response Format */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2 mt-4">Formato de respuesta:</h4>
                        <pre className="bg-gray-900 p-4 rounded overflow-x-auto">
                          <code className="text-sm text-purple-400">
{`{
  "success": true,
  "data": { ... },
  "error": "mensaje de error"
}`}
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Información General</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <strong className="text-white">Base URL:</strong> {spec.servers[0].url}
              </p>
              <p>
                <strong className="text-white">Rate Limit:</strong> 100 peticiones por minuto por IP
              </p>
              <p>
                <strong className="text-white">CORS:</strong> Habilitado para todos los orígenes
              </p>
              <p>
                <strong className="text-white">Autenticación:</strong> No requerida (API pública)
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
