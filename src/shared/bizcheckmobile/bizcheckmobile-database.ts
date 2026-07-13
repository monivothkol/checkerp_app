/* eslint-disable no-unused-vars */
import BizCheckMobileDevice from "./bizcheckmobile-device";
import BizCheckMobileLogger from "./bizcheckmobile-logger";
import BizCheckMobileProperties from "./bizcheckmobile-properties";

const bizCheckMobile = window.bizCheckMobile;
class Database {

    private static instance: Database;
    static isOpened: boolean = false;

    static getInstance(): Database {
        if (!this.instance) {
            this.instance = new Database();
        }
        return this.instance;
    }

    isOpen(): boolean {
        return Database.isOpened;
    }

    open(callback?: (response: any) => void, errorCallback?: (error: any) => void) {

        if ( !BizCheckMobileDevice.isApp() ) {
            if (  callback ) callback({ result: false, errorMessage: "Database is only available in app environment." });
            BizCheckMobileLogger.error("Database is only available in app environment.");
            return;
        }

        if ( BizCheckMobileProperties.get("openedDatabase") ) {
            if ( callback ) callback({ result: true});
            BizCheckMobileLogger.info("Database is already opened.");
            return;
        }
        
        bizCheckMobile.gateway("Database", "openDatabase", {
            _sDbName: "database",
            _fCallback: (result: any) => {
                BizCheckMobileLogger.log("Database opened: ", result);
                Database.isOpened = true;
                if (result.result) {
                    if (callback) callback(result);
                    BizCheckMobileProperties.set("openedDatabase", true);
                }
                else {
                    BizCheckMobileProperties.set("openedDatabase", false);
                    BizCheckMobileLogger.error("Error opening database: ", result);
                    Database.isOpened = false;
                    if (errorCallback) errorCallback(result);
                }
            }
        });
    }

    close(callback?: (response: any) => void, errorCallback?: (error: any) => void) {
        if ( !BizCheckMobileDevice.isApp() ) {
            if (  callback ) callback({ result: false, errorMessage: "Database is only available in app environment." });
            BizCheckMobileLogger.error("Database is only available in app environment.");
            return;
        }

        if (callback) callback({ result: true});
        if (errorCallback) errorCallback({ result: false, errorMessage: "Database is not opened." });

        // bizCheckMobile.gateway("Database", "closeDatabase", {
        //     _fCallback: (result: any) => {
        //         BizCheckMobileLogger.log("Database closed: ", result);
        //         if (result.result ){
        //             if (callback) callback(result);
        //         } else {
        //             BizCheckMobileLogger.error("Error closing database: ", result);
        //             if (errorCallback) errorCallback(result);
        //         }
        //     }
        // });
    }

    /**
     * Executes SQL statements to create a table and insert values into it.
     * @author Chanthou
     * @param param An object containing:
     *   - createTableStatement: The SQL statement to create a table.
     *   - insertStatement: The SQL statement to insert data into the table.
     *   - values: An array of strings representing the values to be inserted.
     * @param callback A function to be called when the operation is complete.
     * @return An object containing the result of the operation.
     * @example
     * const db = Database.getInstance();
     * db.insert({
     *   createTableStatement: "CREATE TABLE IF NOT EXISTS table_name (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(225) NOT NULL)",
     *   insertStatement: "INSERT INTO table_name (name) VALUES (?)",
     *   values: ["John Doe"]
     * });
     */
    insert(param: { insertStatement: string, values: Array<string>, callback?: (response?: any) => void }) {
        bizCheckMobile.gateway("Database", "executeSql", {
            _sQuery: param.insertStatement,
            _aBindingValues: param.values,
            _fCallback: () => {
                BizCheckMobileLogger.log("Data is inserted");
                param.callback?.();
            }
        });
    }

    create(param: { createTableStatement: string, callback?: () => void }) {
        bizCheckMobile.gateway("Database", "executeSql", {
            _sQuery: param.createTableStatement,
            _aBindingValues: [],
            _fCallback: (response: any) => {
                BizCheckMobileLogger.log("Table is created: ", response);
                param.callback?.();
            }
        });
    }

    insertBatchSQL(param: { insertStatement: string, values: Array<string>, callback?: (response: any) => void }) {
        bizCheckMobile.gateway("Database", "executeBatchSql", {
            _sQuery: param.insertStatement,
            _aBindingValues: param.values,
            _fCallback: (response: any) => {
                BizCheckMobileLogger.log("Data is inserted Bath: ", response);
                param.callback?.(response);
            }
        });
    }

    select(param: { selectStatement: string, values?: Array<string>, callback: (response: ResponseSelect) => void }) {
        bizCheckMobile.gateway("Database", "executeSelect", {
            _sQuery: param.selectStatement,
            _aBindingValues: param.values,
            _fCallback: (result: ResponseSelect) => {
                param.callback(result);
            }
        });
    }

    /**
     * Deletes records from the database.
     * @param param An object containing:
     *   - deleteStatement: The SQL statement to delete the records.
     *   - values: An array of values for the primary keys to be deleted.
     *   - callback: A function to be called when the operation is complete.
     * @example
     * const db = Database.getInstance();
     * db.delete({
     *   deleteStatement: "DELETE FROM table_name WHERE id = ?",
     *   values: ["3"],
     *   callback: (result: any) => {
     *     // console.log(result);
     *   }
     * });
     */
    delete(param: { deleteStatement: string, values: Array<string>, callback: (response: { affected_number: number, result: boolean }) => void }) {
        bizCheckMobile.gateway("Database", "executeSql", {
            _sQuery: param.deleteStatement,
            _aBindingValues: param.values,
            _fCallback: (result: { affected_number: number, result: boolean }) => {
                param.callback(result);
            }
        });
    }

    drop(param: { dropStatement: string, values: Array<string>, callback: (response: { affected_number: number, result: boolean }) => void }) {
        bizCheckMobile.gateway("Database", "executeSql", {
            _sQuery: param.dropStatement,
            _aBindingValues: param.values,
            _fCallback: (result: { affected_number: number, result: boolean }) => {
                param.callback(result);
            }
        });
    }

    executeSql(param: { sqlStatement: string, values: Array<string>, callback: (response: { affected_number: number, result: boolean }) => void }) {
        bizCheckMobile.gateway("Database", "executeSql", {
            _sQuery: param.sqlStatement,
            _aBindingValues: param.values,
            _fCallback: (result: { affected_number: number, result: boolean }) => {
                param.callback(result);
            }
        });
    }



    /**
     * Updates a record in the database.
     * @param param An object containing:
     *   - updateStatement: The SQL statement to update the record.
     *   - key: The value of the primary key to be updated.
     *   - sValue: The new value to be set.
     * @return An object containing the result of the operation.
     * @example
     * const db = Database.getInstance();
     * db.update({
     *   updateStatement: "UPDATE table_name SET name = ? WHERE id = ?",
     *   sValue: ["John Doe", "1"],
     *   callback: (result: any) => {
     *     // console.log(result);
     *   }
     * });
     */

    update(param: { updateStatement: string, sValue: Array<string>, callback: (response: any) => void }) {
        bizCheckMobile.gateway("Database", "executeSql", {
            _sQuery: param.updateStatement,
            _aBindingValues: param.sValue,
            _fCallback: (result: any) => {
                param.callback(result);
            }
        });
    }
}

interface ResponseSelect {
    data: {
        result_set: {
            rows: Array<any>
        }
    },
    result: boolean
}

const BizCheckMobileDatabase = Database.getInstance();

export default BizCheckMobileDatabase;