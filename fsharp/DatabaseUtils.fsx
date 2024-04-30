module DatabaseUtils

#r "nuget: Npgsql"
#r "nuget: Newtonsoft.Json"
#r "nuget: MySql.Data"

open Npgsql
open System.Collections.Generic
open Newtonsoft.Json
open MySql.Data.MySqlClient
open System

let convertToJsonBase results =
    (JsonConvert.SerializeObject(results, Formatting.Indented))

let convertToJson results =
    Result.map convertToJsonBase results

let convertToCsvBase (results: List<Dictionary<string, obj>>) =
    let csv = new System.Text.StringBuilder()
    let headers = results.[0].Keys
    csv.AppendLine(String.concat "," headers) |> ignore
    for row in results do
        let values = headers |> Seq.map (fun h -> row.[h].ToString())
        csv.AppendLine(String.concat "," values) |> ignore
    csv.ToString()

let convertToCsv results =
    Result.map convertToCsvBase results

let convertToHtmlBase (results: List<Dictionary<string, obj>>) =
    let html = new System.Text.StringBuilder()
    html.AppendLine("<table>") |> ignore
    html.AppendLine("<thead><tr>") |> ignore
    // Assuming all dictionaries have the same keys
    let headers = results.[0].Keys
    for header in headers do
        html.AppendFormat("<th>{0}</th>", header) |> ignore
    html.AppendLine("</tr></thead>") |> ignore
    html.AppendLine("<tbody>") |> ignore
    for row in results do
        html.AppendLine("<tr>") |> ignore
        for header in headers do
            let value = match row.TryGetValue(header) with
                        | (true, v) when v <> null -> v.ToString()
                        | _ -> ""
            html.AppendFormat("<td>{0}</td>", value) |> ignore
        html.AppendLine("</tr>") |> ignore
    html.AppendLine("</tbody>") |> ignore
    html.AppendLine("</table>") |> ignore
    html.ToString()

let convertToHtml results =
    Result.map convertToHtmlBase results

let connectToPostgresDatabaseBase connectionString =
    let connection = new NpgsqlConnection(connectionString)
    connection.Open()
    connection

let connectToPostgresDatabase connectionString =
    Result.map connectToPostgresDatabaseBase connectionString

let executePostgresQueryBase query connection =
    let command = new NpgsqlCommand(query, connection)
    (command.ExecuteReader() :?> NpgsqlDataReader)

let executePostgresQuery query connection =
    Result.map (fun c -> executePostgresQueryBase query c) connection

let readPostgresResultsBase (reader: NpgsqlDataReader) =
    let results = new List<Dictionary<string, obj>>()
    while reader.Read() do
        let row = new Dictionary<string, obj>()
        for i in 0 .. reader.FieldCount - 1 do
            row.[reader.GetName(i)] <- reader.GetValue(i)
        results.Add(row)
    reader.Close()
    results

let readPostgresResults reader =
    Result.map readPostgresResultsBase reader

let connectToMysqlDatabaseBase connectionString =
    let connection = new MySqlConnection(connectionString)
    connection.Open()
    connection

let connectToMysqlDatabase connectionString =
    Result.map connectToMysqlDatabaseBase connectionString

let executeMysqlQueryBase query connection =
    let command = new MySqlCommand(query, connection)
    command.CommandTimeout <- 360
    command.ExecuteReader()

let executeMysqlQuery query connection =
    Result.map (fun c -> executeMysqlQueryBase query c) connection

let readMysqlResultsBase (reader: MySqlDataReader) =
    let results = new List<Dictionary<string, obj>>()
    while reader.Read() do
        let row = new Dictionary<string, obj>()
        for i in 0 .. reader.FieldCount - 1 do
            row.[reader.GetName(i)] <- reader.GetValue(i)
        results.Add(row)
    reader.Close()
    results
    

let readMysqlResults reader =
    Result.map readMysqlResultsBase reader

let readMysqlResultsSeqBase (reader: MySqlDataReader) =
    seq {
        try
            while reader.Read() do
                let row = new Dictionary<string, obj>()
                for i in 0 .. reader.FieldCount - 1 do
                    row.[reader.GetName(i)] <- reader.GetValue(i)
                yield row
        finally
            reader.Close()
    }

let readMysqlResultsSeq reader =
    Result.map readMysqlResultsSeqBase reader

let executeMysqlQueryAndReadResultsBase connectionString query =
    use connection = new MySqlConnection(connectionString)
    connection.Open()

    use command = new MySqlCommand(query, connection)
    command.CommandTimeout <- 360

    use reader = command.ExecuteReader()

    let results = new List<Dictionary<string, obj>>()
    while reader.Read() do
        let row = new Dictionary<string, obj>()
        for i in 0 .. reader.FieldCount - 1 do
            row.[reader.GetName(i)] <- reader.GetValue(i)
        results.Add(row)

    results // Return the results

let executeMysqlQueryAndReadResults connectionString query =
    Result.map (executeMysqlQueryAndReadResultsBase connectionString) query

type QueryState = {
    Columns: string list
    Table: string option
    Joins: (string * string) list
    OnConditions: string list
    Conditions: string list
    GroupByColumns: string list
    HavingConditions: string list
    OrderByConditions: string list
    Limit: int option
    Offset: int option
}


type SqlQueryBuilder() =
    member __.Yield(_) = { Columns = []; Table = None; Joins = []; OnConditions = []; Conditions = []; GroupByColumns = []; HavingConditions = []; OrderByConditions = []; Limit = None; Offset = None }

    member __.Zero() = { Columns = []; Table = None; Joins = []; OnConditions = []; Conditions = []; GroupByColumns = []; HavingConditions = []; OrderByConditions = []; Limit = None; Offset = None }

    member __.Bind(state: QueryState, f) =
        f(state)

    member __.Return(state: QueryState) =
        state

    member __.For(state: QueryState, f) =
        __.Bind(state, f)

    member __.Combine(state1: QueryState, state2: QueryState) =
        {   
            Columns = state1.Columns @ state2.Columns
            Table = state1.Table
            Joins = state1.Joins @ state2.Joins
            OnConditions = state1.OnConditions @ state2.OnConditions
            Conditions = state1.Conditions @ state2.Conditions
            GroupByColumns = state1.GroupByColumns @ state2.GroupByColumns
            OrderByConditions = state1.OrderByConditions @ state2.OrderByConditions
            HavingConditions = state1.HavingConditions @ state2.HavingConditions
            Limit = state2.Limit
            Offset = state2.Offset 
        }

    member __.Delay(f) = f()

    [<CustomOperation("select")>]
    member __.Select(state: QueryState, columns) =
        { state with Columns = columns }

    [<CustomOperation("from")>]
    member __.From(state: QueryState, table) =
        { state with Table = Some(table) }

    [<CustomOperation("where")>]
    member __.Where(state: QueryState, newConditions, ?condition) =
        if defaultArg condition true then { state with Conditions = state.Conditions @ newConditions |> List.filter (fun x -> x <> "") } else state

    [<CustomOperation("conditional_where")>]
    member __.ConditionalWhere(state: QueryState, condition: bool, newConditions) =
        __.Where(state, newConditions, condition)

    [<CustomOperation("join")>]
    member __.Join(state: QueryState, joinType, table, onCondition) =
        { state with Joins = state.Joins @ [(joinType, table)]; OnConditions = state.OnConditions @ [onCondition] }

    [<CustomOperation("conditional_join")>]
    member __.ConditionalJoin(state: QueryState, condition: bool, joinType, table, onCondition) =
        if condition then __.Join(state, joinType, table, onCondition) else state

    [<CustomOperation("group_by")>]
    member __.GroupBy(state: QueryState, columns) =
        { state with GroupByColumns = columns }

    [<CustomOperation("conditional_group_by")>]
    member __.ConditionalGroupBy(state: QueryState, condition: bool, columns) =
        if condition then __.GroupBy(state, columns) else state

    [<CustomOperation("having")>]
    member __.Having(state: QueryState, conditions) =
        { state with HavingConditions = conditions }

    [<CustomOperation("conditional_having")>]
    member __.ConditionalHaving(state: QueryState, condition: bool, conditions) =
        if condition then __.Having(state, conditions) else state

    [<CustomOperation("order_by")>]
    member __.OrderBy(state: QueryState, conditions) =
        { state with OrderByConditions = conditions }

    [<CustomOperation("conditional_order_by")>]
    member __.ConditionalOrderBy(state: QueryState, condition: bool, conditions) =
        if condition then __.OrderBy(state, conditions) else state

    [<CustomOperation("limit")>]
    member __.Limit(state: QueryState, limit) =
        { state with Limit = Some(limit) }

    [<CustomOperation("conditional_limit")>]
    member __.ConditionalLimit(state: QueryState, condition: bool, limit) =
        if condition then __.Limit(state, limit) else state

    [<CustomOperation("offset")>]
    member __.Offset(state: QueryState, offset) =
        { state with Offset = Some(offset) }

    [<CustomOperation("conditional_offset")>]
    member __.ConditionalOffset(state: QueryState, condition: bool, offset) =
        if condition then __.Offset(state, offset) else state

    member __.Run(state: QueryState) =
        // failwith if required fields are missing
        if state.Columns = [] then failwith "Columns are required"
        if state.Table = None then failwith "Table is required"

        let selectClause =
            let columns = String.Join(",\n  ", state.Columns)
            let table = Option.defaultValue "" state.Table
            sprintf "SELECT \n  %s \nFROM %s" columns table

        let joinClause query =
            match state.Joins with
            | [] -> query
            | joins ->
                let joinStrings = joins |> List.map (fun (joinType, table) -> sprintf "\n%s JOIN %s" joinType table)
                let onStrings = state.OnConditions |> List.map (fun condition -> sprintf "\nON %s" condition)
                sprintf "\n%s %s %s" query (String.Join(" ", joinStrings)) (String.Join(" ", onStrings))

        let whereClause query =
            match state.Conditions with
            | [] -> query
            | conditions -> sprintf "%s\nWHERE %s" query (String.Join("\nAND ", conditions))

        let groupByClause query =
            match state.GroupByColumns with
            | [] -> query
            | columns -> sprintf "%s\nGROUP BY %s" query (String.Join(", ", columns))

        let havingClause query =
            match state.HavingConditions with
            | [] -> query
            | conditions -> sprintf "%s\nHAVING %s" query (String.Join("\nAND ", conditions))

        let orderByClause query =
            match state.OrderByConditions with
            | [] -> query
            | conditions -> sprintf "%s\nORDER BY %s" query (String.Join(", ", conditions))

        let limitClause query =
            match state.Limit with
            | None -> query
            | Some limit -> sprintf "%s\nLIMIT %d" query limit
        
        let offsetClause query =
            match state.Offset with
            | None -> query
            | Some offset -> sprintf "%s\nOFFSET %d" query offset

        // Pipeline the query generation process
        selectClause
        |> joinClause
        |> whereClause
        |> groupByClause
        |> havingClause
        |> orderByClause
        |> limitClause
        |> offsetClause
        |> fun query -> sprintf "%s;" query

let sqlBuilder = SqlQueryBuilder()

let sql (s: string) = s