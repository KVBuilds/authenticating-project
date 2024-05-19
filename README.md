The authentication project allows users to register, log in their credentials, and update their settings within their user profile.

## Technology Stack

Overall summary of stack

- Runs on Nextjs and hosted on Vercel
- Two-factor authentication, error handling, email verification
- Next/server and middleware
- Database includes Neon Serverless Postgres
- Database client and workflow runs with Prisma
- This example approach runs through pages as routes as compared to API as routes.


## Learnings

Some learnings while following along and building the project:

- Type definitions and imports: Found several instances where examples of NextAPIRequest and NextAPIResponse were missing. 
- Handling of different providers: defined differences between OAuth and credentials provider to check specific logic applies only when needed. 
- Configuration logic: Separating the configuration ('authConfig') from core logic helps with maintaining and readability. 
- Error handling and data validation: Able to check that the application can handle missing or invalid data or if a user exists before accessing or moving forward.

