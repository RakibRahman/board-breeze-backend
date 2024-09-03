import { log } from "console";
import { pg_query } from "../../db/db";

export const getBoardColumns = async (boardId: string) => {
  const sql = `
  SELECT 
    c.id,
    c.name AS column_name,
    COUNT(t.id) AS total_tasks
FROM 
    columns c
JOIN 
    tasks t ON c.id = t.column_id
WHERE 
    c.board_id = $1
GROUP BY 
    c.id, c.name;
    `;

  const tasksSql = `
    SELECT 
    '137fafef-65ea-49e7-913d-cbd409917dfb' AS column_id,
    json_agg(t ORDER BY t.id) AS tasks
FROM 
    tasks t
WHERE 
    t.column_id IS NULL
UNION ALL
SELECT 
    c.id AS column_id,
    json_agg(t ORDER BY t.id) AS tasks
FROM 
    columns c
LEFT JOIN 
    tasks t ON c.id = t.column_id
GROUP BY 
    c.id;
`;

  try {
    const columns = await pg_query(sql, [boardId]);
    const tasks = await pg_query(tasksSql);
    const formattedData: Record<string, []> = {};
    tasks.rows &&
      tasks.rows.forEach((row) => {
    log({tasks:row["tasks"]})

        if(row["tasks"]){
          formattedData[row.column_id] = row["tasks"].filter(Boolean);
        }
      });
    return {
      columns: columns.rows,
      tasks: formattedData,
    };
  } catch (error) {
    throw error;
  }
};
