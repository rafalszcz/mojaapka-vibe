using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Add SQLite DbContext
builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=tasks.db"));

// Configure CORS for localhost
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaskDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("AllowFrontend");

app.MapGet("/", () => Results.Ok(new { message = "Task Manager API is running" }));

// GET /api/tasks
app.MapGet("/api/tasks", async (TaskDbContext db) =>
    await db.Tasks.ToListAsync());

// GET /api/tasks/{id}
app.MapGet("/api/tasks/{id}", async (int id, TaskDbContext db) =>
    await db.Tasks.FindAsync(id) is TaskItem task ? Results.Ok(task) : Results.NotFound());

// POST /api/tasks
app.MapPost("/api/tasks", async (TaskItem inputTask, TaskDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(inputTask.Title))
    {
        return Results.BadRequest(new { message = "Task title is required." });
    }

    db.Tasks.Add(inputTask);
    await db.SaveChangesAsync();

    return Results.Created($"/api/tasks/{inputTask.Id}", inputTask);
});

// PUT /api/tasks/{id}
app.MapPut("/api/tasks/{id}", async (int id, TaskItem inputTask, TaskDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task == null) return Results.NotFound();

    task.Title = inputTask.Title;
    task.IsCompleted = inputTask.IsCompleted;

    await db.SaveChangesAsync();

    return Results.Ok(task);
});

// DELETE /api/tasks/{id}
app.MapDelete("/api/tasks/{id}", async (int id, TaskDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task == null) return Results.NotFound();

    db.Tasks.Remove(task);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();
