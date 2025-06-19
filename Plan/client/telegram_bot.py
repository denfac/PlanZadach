import json
import os
from datetime import datetime
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)


BOT_TOKEN = "8090544891:AAG8Umdt0cYHsY04amzEBwFsrrZKuMC0oAI"

CHAT_ID = "1963327915"

DATA_FILE = "tasks_data.json"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the /start command."""
    await update.message.reply_text(
        "Привет! Я бот для отправки задач из системы планирования. Используй команды:\n"
        "/list_tasks - Показать все задачи\n"
        "/new_tasks - Показать новые задачи\n"
        "/overdue_tasks - Показать просроченные задачи\n"
    )

def read_tasks_data():
    """Read tasks from tasks_data.json."""
    try:
        if not os.path.exists(DATA_FILE):
            return {"projects": [], "regulations": []}
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {DATA_FILE}: {e}")
        return {"projects": [], "regulations": []}

def get_all_tasks():
    """Extract all tasks from projects in tasks_data.json."""
    data = read_tasks_data()
    tasks = []
    for project in data.get("projects", []):
        for task in project.get("tasks", []):
            task["project_name"] = project["name"]
            task["department_name"] = next(
                (dept["name"] for dept in project.get("departments", []) if dept["id"] == task["departmentId"]),
                "Неизвестный отдел",
            )
            task["employee_name"] = next(
                (emp["name"] for emp in project.get("employees", []) if emp["id"] == task["employeeId"]),
                "Неизвестный сотрудник",
            )
            tasks.append(task)
    return tasks

def format_task(task):
    """Format a task for display in Telegram."""
    due_date = datetime.fromisoformat(task["dueDate"].replace("Z", "+00:00")).strftime("%d.%m.%Y")
    return (
        f"📋 *Задача*: {task['description']}\n"
        f"📁 *Проект*: {task['project_name']}\n"
        f"🏢 *Отдел*: {task['department_name']}\n"
        f"👤 *Сотрудник*: {task['employee_name']}\n"
        f"📅 *Срок*: {due_date}\n"
        f"🔥 *Приоритет*: {task['priority']}\n"
        f"✅ *Статус*: {task['status']}\n"
        f"🕒 *Создано*: {datetime.fromisoformat(task['createdAt'].replace('Z', '+00:00')).strftime('%d.%m.%Y %H:%M')}"
    )

async def list_tasks(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the /list_tasks command to send all tasks."""
    tasks = get_all_tasks()
    if not tasks:
        await update.message.reply_text("Задачи не найдены.")
        return

    for task in tasks:
        await context.bot.send_message(
            chat_id=CHAT_ID,
            text=format_task(task),
            parse_mode="Markdown",
        )
    await update.message.reply_text(f"Отправлено {len(tasks)} задач в чат.")

async def new_tasks(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the /new_tasks command to send tasks with status 'Новая'."""
    tasks = get_all_tasks()
    new_tasks = [task for task in tasks if task["status"] == "Новая"]
    if not new_tasks:
        await update.message.reply_text("Новые задачи не найдены.")
        return

    for task in new_tasks:
        await context.bot.send_message(
            chat_id=CHAT_ID,
            text=format_task(task),
            parse_mode="Markdown",
        )
    await update.message.reply_text(f"Отправлено {len(new_tasks)} новых задач в чат.")

async def overdue_tasks(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the /overdue_tasks command to send overdue tasks."""
    tasks = get_all_tasks()
    current_date = datetime.now()
    overdue_tasks = [
        task for task in tasks
        if task["status"] != "Завершена"
        and datetime.fromisoformat(task["dueDate"].replace("Z", "+00:00")) < current_date
    ]
    if not overdue_tasks:
        await update.message.reply_text("Просроченные задачи не найдены.")
        return

    for task in overdue_tasks:
        await context.bot.send_message(
            chat_id=CHAT_ID,
            text=format_task(task),
            parse_mode="Markdown",
        )
    await update.message.reply_text(f"Отправлено {len(overdue_tasks)} просроченных задач в чат.")

def main() -> None:
    """Run the bot."""
    application = Application.builder().token(BOT_TOKEN).build()

  
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("list_tasks", list_tasks))
    application.add_handler(CommandHandler("new_tasks", new_tasks))
    application.add_handler(CommandHandler("overdue_tasks", overdue_tasks))

    
    print("Бот запущен...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()