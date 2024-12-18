import runQuery, { closeDB } from "../db/dal";
import { ValidationError } from "../models/exceptions";
import TaskModel from "../models/TaskModel";
import { ResultSetHeader } from "mysql2";

// Get all tasks or a specific task by ID
export async function getTasks(id?: number): Promise<TaskModel[]> {
    const query = id ? `SELECT * FROM tasks WHERE id = ?` : `SELECT * FROM tasks`;
    const tasks = await runQuery(query, id ? [id] : []);

    if (id && tasks.length === 0) {
        throw new Error("Task not found");
    }

    return tasks.map((task: any) => new TaskModel(task));
}

// Add a new task
export async function addTask(task: TaskModel): Promise<number> {
    task.validate(); // Validate task input

    const formattedDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null;
    const query = `
        INSERT INTO tasks (title, description, status, priority, dueDate, createdByUserId, assignedToUserId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        task.title,
        task.description,
        task.status,
        task.priority,
        formattedDueDate,
        task.createdByUserId,
        task.assignedToUserId || null
    ];

    const result = await runQuery(query, values) as ResultSetHeader;

    if (!result || !result.insertId) {
        throw new Error("Failed to insert task");
    }

    return result.insertId;
}

// Edit an existing task
export async function editTask(id: number, updates: Partial<TaskModel>): Promise<void> {
    if (Object.keys(updates).length === 0) {
        throw new ValidationError("No updates provided!");
    }

    const taskToUpdate = new TaskModel({ id, ...updates } as TaskModel);
    taskToUpdate.validate(); // Validate the updated task

    const updateFields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updates);

    const query = `UPDATE tasks SET ${updateFields} WHERE id = ?`;
    values.push(id);

    const result = await runQuery(query, values);

    if (result.affectedRows === 0) {
        throw new Error("No task found to update");
    }
}

// Delete a task by ID
export async function deleteTask(id: number): Promise<void> {
    const query = `DELETE FROM tasks WHERE id = ?`;
    const result = await runQuery(query, [id]);

    if (result.affectedRows === 0) {
        throw new Error("Task not found for deletion");
    }
}

// Get tasks with pagination (and total count for pagination purposes)
export async function getTasksPaginated(page: number, limit: number): Promise<{ tasks: TaskModel[], totalCount: number }> {
    const offset = (page - 1) * limit;

    // Get the tasks
    const query = `SELECT * FROM tasks LIMIT ? OFFSET ?`;
    const tasks = await runQuery(query, [limit, offset]);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) AS total FROM tasks`;
    const countResult = await runQuery(countQuery);
    const totalCount = countResult[0]?.total || 0;

    return {
        tasks: tasks.map((task: any) => new TaskModel(task)),
        totalCount
    };
}
