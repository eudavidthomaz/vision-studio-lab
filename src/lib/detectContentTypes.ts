/**
 * MÓDULO DE DETECÇÃO DE TIPOS DE CONTEÚDO
 * 
 * Este arquivo re-exporta a lógica do novo módulo unificado para manter
 * compatibilidade com imports existentes.
 * 
 * @deprecated Usar diretamente contentTypeDetection.ts para novos códigos
 */

export {
  detectContentTypes,
  detectExplicitType,
  interpretSemanticType,
  getDetectedTypesInfo,
  isContentType,
  type ContentType
} from './contentTypeDetection';

export {
  CONTENT_TYPE_DEFINITIONS,
  SYNONYM_MAP,
  normalizeText,
  getTypeDefinition,
  getTypesByCategory,
  requiresBiblicalFoundation,
  getDefaultPillar,
  ALL_CONTENT_TYPES,
  isValidContentType,
  type ContentCategory,
  type ContentPillar,
  type ContentTypeDefinition
} from './contentTypesConfig';
