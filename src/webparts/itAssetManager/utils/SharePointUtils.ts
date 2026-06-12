/**
 * Fields that must never appear in a SharePoint list item PATCH (update) payload.
 *
 * SharePoint REST API throws InvalidClientQueryException if the payload contains:
 *  - OData envelope annotations  (@odata.editLink, @odata.id, @odata.type, @odata.etag …)
 *  - Double-underscore internals (__metadata, __deferred …)
 *  - System-managed columns      (Id, Created, Modified, Author, Editor …)
 *  - Identity columns that must not change (Title for IT_Assets = AssetId)
 */
const STRIP_ON_UPDATE = new Set([
  'Id', 'ID', 'Title', 'Created', 'Modified',
  'Author', 'Editor', 'GUID', 'SequenceNumber',
  'FileSystemObjectType', 'ServerRedirectedEmbedUri', 'ServerRedirectedEmbedUrl',
  'OData__UIVersionString', 'ContentType', 'ContentTypeId',
]);

/**
 * Returns a shallow copy of `obj` with every key that would cause SharePoint's
 * REST PATCH endpoint to throw `InvalidClientQueryException` removed.
 *
 * Strips:
 *  - Keys starting with `@`      (OData v4 annotations)
 *  - Keys starting with `odata.` (OData v3 annotations)
 *  - Keys starting with `__`     (legacy __metadata / __deferred)
 *  - Any key listed in STRIP_ON_UPDATE
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripMetadata(obj: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (
      k.startsWith('@')      ||
      k.startsWith('odata.') ||
      k.startsWith('__')     ||
      STRIP_ON_UPDATE.has(k)
    ) continue;
    clean[k] = v;
  }
  return clean;
}
