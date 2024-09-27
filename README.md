# Clinical-Clarity

## Management Engineering Class of 2025 Capstone Project

### Team 13

### Github Information:

#### Branches:

prod: Contains the stable code that is currently in production.

test: Used for testing and quality assurance before code goes to production.

dev: The main development branch where integration happens.

Feature branches: Individual branches for new features or bug fixes, named feature/feature-name or bugfix/issue-name.

#### Branch/Feature Creation Workflow (subject to change):

Create a feature branch from dev:

git checkout -b feature/awesome-feature dev

After development and local testing, push to GitHub and create a Pull Request (PR) to merge into dev.

Integration:

Once PRs are approved, merge feature branches into dev.

Ensure all unit tests and code reviews are completed.

Testing:

When dev is stable, merge into test for further testing:

git checkout test
git merge dev
git push origin test

After successful testing, merge test into prod:

git checkout prod
git merge test
git push origin prod


### Frontend:

to access the frontend:

client/src/pages/index.js

for styling:

client/src/styles/global.css

### Backend:

to access the backend:

server/server.py

the "clinical-clarity" directory is the virtual environment created for the flask python app.

To add packages, go to terminal, open server (cd server) and activate the venv with source clinical-clarity/bin/activate 
(for PC it may be different this is mac)

