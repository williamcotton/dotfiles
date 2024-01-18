module DatabaseUtils

#r "nuget: Npgsql"
#r "nuget: Newtonsoft.Json"
#r "nuget: MySql.Data"

open Npgsql
open System.Collections.Generic
open Newtonsoft.Json
open MySql.Data.MySqlClient

let connectToDatabaseBase connectionString =
    let connection = new NpgsqlConnection(connectionString)
    connection.Open()
    connection

let connectToDatabase connectionString =
    match connectionString with
    | Ok c -> Ok (connectToDatabaseBase c)
    | Error e -> Error e

let executeQueryBase query connection =
    let command = new NpgsqlCommand(query, connection)
    (command.ExecuteReader() :?> NpgsqlDataReader)

let executeQuery query connection =
    match connection with
    | Ok c -> Ok (executeQueryBase query c)
    | Error e -> Error e

let readResultsBase (reader: NpgsqlDataReader) =
    let results = new List<Dictionary<string, obj>>()
    while reader.Read() do
        let row = new Dictionary<string, obj>()
        for i in 0 .. reader.FieldCount - 1 do
            row.[reader.GetName(i)] <- reader.GetValue(i)
        results.Add(row)
    results

let readResults reader =
    match reader with
    | Ok r -> Ok (readResultsBase r)
    | Error e -> Error e

let convertToJsonBase results =
    (JsonConvert.SerializeObject(results, Formatting.Indented))

let convertToJson results =
    match results with
    | Ok r -> Ok (convertToJsonBase r)
    | Error e -> Error e

// A utility function to execute a database query and return results
let mysqlQuery (connection: MySqlConnection) (query: string) (parameters: (string * obj) list) : Option<(string * obj) list> =
    try
        // Ensure the connection is open
        if connection.State <> System.Data.ConnectionState.Open then
            connection.Open()

        // Create and prepare a command
        using (new MySqlCommand(query, connection)) <| fun command ->
            // Add parameters to the command
            parameters |> List.iter (fun (key, value) ->
                command.Parameters.AddWithValue(key, value) |> ignore)

            // Execute the command and process the results
            using (command.ExecuteReader()) <| fun reader ->
                if reader.Read() then
                    // Return results as an option of list of tuples with column name and value
                    Some [ for i in 0 .. reader.FieldCount - 1 -> (reader.GetName(i), reader.GetValue(i)) ]
                else
                    // Return None if no result
                    None
    with
    | :? MySqlException as ex ->
        // Log MySql exceptions
        printfn "MySql error: %s" ex.Message
        None
    | ex ->
        // Log other exceptions
        printfn "Unexpected error: %s" ex.Message
        None