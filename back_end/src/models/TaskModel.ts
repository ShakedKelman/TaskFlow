import { ValidationError } from "./exceptions";
import Joi from "joi";

interface TaskInterface {
    id?: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate?: string;
    createdByUserId: number;
    assignedToUserId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export default class TaskModel {
    id?: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate?: string;
    createdByUserId: number;
    assignedToUserId?: number;
    createdAt?: string;
    updatedAt?: string;

    constructor(task: TaskInterface) {
        this.id = task.id;
        this.title = task.title;
        this.description = task.description;
        this.status = task.status;
        this.priority = task.priority;
        this.dueDate = task.dueDate;
        this.createdByUserId = task.createdByUserId;
        this.assignedToUserId = task.assignedToUserId;
        this.createdAt = task.createdAt;
        this.updatedAt = task.updatedAt;
    }

    private static validateSchema = Joi.object({
        id: Joi.number().optional().positive(),
        title: Joi.string().required().min(2).max(255),
        description: Joi.string().required(),
        status: Joi.string().valid('todo', 'in-progress', 'done').required(),
        priority: Joi.string().valid('low', 'medium', 'high').required(),
        dueDate: Joi.date().optional(),
        createdByUserId: Joi.number().required().positive(),
        assignedToUserId: Joi.number().optional().positive(),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional(),
    });

    validate(): void {
        const res = TaskModel.validateSchema.validate(this, { abortEarly: false });
        
        if (res.error) {
            throw new ValidationError(res.error.details.map(d => d.message).join(", "));
        }
    }
}
