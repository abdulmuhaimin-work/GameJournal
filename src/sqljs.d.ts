declare module 'sql.js' {
  interface Database {
    run(sql: string): void
    exec(sql: string): { columns: string[]; values: unknown[][] }[]
    prepare(sql: string): unknown
    export(): Uint8Array
  }
  interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database
  }
  function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>
  export default initSqlJs
}
