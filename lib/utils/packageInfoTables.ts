export interface PackageInfoTable {
  title: string;
  columns: string[];
  rows: string[][];
  notes?: string;
  order?: number;
}

export const PACKAGE_INFO_TABLE_LIMITS = {
  maxTables: 5,
  maxColumns: 12,
  maxRows: 50,
  maxCellLength: 500,
  maxTitleLength: 120,
  maxNotesLength: 500,
};

const cleanText = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
};

export function normalizePackageInfoTables(value: unknown): PackageInfoTable[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, PACKAGE_INFO_TABLE_LIMITS.maxTables)
    .map((table, tableIndex) => {
      const rawColumns = Array.isArray(table?.columns) ? table.columns : [];
      const columns = rawColumns
        .slice(0, PACKAGE_INFO_TABLE_LIMITS.maxColumns)
        .map((column: unknown) => cleanText(column, PACKAGE_INFO_TABLE_LIMITS.maxCellLength));

      const safeColumnCount = Math.max(columns.length, 1);
      const rows = (Array.isArray(table?.rows) ? table.rows : [])
        .slice(0, PACKAGE_INFO_TABLE_LIMITS.maxRows)
        .map((row: unknown) => {
          const rawRow = Array.isArray(row) ? row : [];
          return Array.from({ length: safeColumnCount }, (_, cellIndex) =>
            cleanText(rawRow[cellIndex], PACKAGE_INFO_TABLE_LIMITS.maxCellLength)
          );
        });

      return {
        title: cleanText(table?.title, PACKAGE_INFO_TABLE_LIMITS.maxTitleLength),
        columns: columns.length > 0 ? columns : ['Details'],
        rows,
        notes: cleanText(table?.notes, PACKAGE_INFO_TABLE_LIMITS.maxNotesLength),
        order: Number.isFinite(table?.order) ? Number(table.order) : tableIndex,
      };
    })
    .filter((table) => {
      const hasTitle = Boolean(table.title);
      const hasColumns = table.columns.some(Boolean);
      const hasRows = table.rows.some((row: string[]) => row.some(Boolean));
      const hasNotes = Boolean(table.notes);
      return hasTitle || hasColumns || hasRows || hasNotes;
    });
}

export function packageInfoTableHasContent(table: PackageInfoTable) {
  const columns = Array.isArray(table.columns) ? table.columns : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];

  return Boolean(
    table.title ||
    table.notes ||
    columns.some(Boolean) ||
    rows.some((row: string[]) => Array.isArray(row) && row.some(Boolean))
  );
}
