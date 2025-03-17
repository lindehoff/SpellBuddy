import { NextResponse } from 'next/server';
import * as service from '@/lib/service';
import { requireAuth } from '@/lib/auth';

// GET /api/exercises/direct - Create a new exercise and return HTML
export async function GET() {
  try {
    // Get the current user (will throw if not authenticated)
    const user = await requireAuth();
    
    // Create a new exercise
    const exercise = await service.createNewExercise(user.id);
    
    // Generate HTML response
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exercise Created</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .card {
              background-color: white;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              margin-bottom: 20px;
            }
            h1 {
              color: #0891b2;
              margin-top: 0;
            }
            .success {
              color: #16a34a;
              font-weight: bold;
            }
            .button {
              display: inline-block;
              background-color: #0891b2;
              color: white;
              padding: 10px 20px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: bold;
              margin-right: 10px;
            }
            .button:hover {
              background-color: #0e7490;
            }
            pre {
              background-color: #f1f5f9;
              padding: 15px;
              border-radius: 4px;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Exercise Created Successfully</h1>
            <p class="success">✅ New exercise has been created with ID: ${exercise.id}</p>
            
            <h2>Exercise Details:</h2>
            <pre>${JSON.stringify(exercise, null, 2)}</pre>
            
            <div style="margin-top: 30px;">
              <a href="/practice" class="button">Go to Practice Page</a>
              <a href="/" class="button" style="background-color: #64748b;">Back to Home</a>
            </div>
          </div>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error creating exercise directly:', error);
    
    // Generate error HTML
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error Creating Exercise</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .card {
              background-color: white;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              margin-bottom: 20px;
            }
            h1 {
              color: #dc2626;
              margin-top: 0;
            }
            .error {
              color: #dc2626;
              font-weight: bold;
            }
            .button {
              display: inline-block;
              background-color: #0891b2;
              color: white;
              padding: 10px 20px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: bold;
              margin-right: 10px;
            }
            .button:hover {
              background-color: #0e7490;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Error Creating Exercise</h1>
            <p class="error">❌ ${error instanceof Error ? error.message : 'An unknown error occurred'}</p>
            
            <div style="margin-top: 30px;">
              <a href="/practice" class="button">Try Again</a>
              <a href="/" class="button" style="background-color: #64748b;">Back to Home</a>
            </div>
          </div>
        </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
      status: 500,
    });
  }
} 