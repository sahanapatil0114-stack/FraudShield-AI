@echo off
REM ============================================================
REM  FraudShield AI — Quick Deploy to XAMPP
REM  Run this as Administrator from d:\credit\
REM ============================================================

echo [1/3] Copying PHP backend to XAMPP htdocs...
xcopy /E /I /Y "backend" "C:\xampp\htdocs\fraudshield\backend\"
xcopy /Y "backend\.htaccess" "C:\xampp\htdocs\fraudshield\backend\"
echo       Done.

echo [2/3] Importing database...
echo       Open http://localhost/phpmyadmin
echo       Import: database\schema.sql  THEN  database\seed.sql
echo.

echo [3/3] Starting Flask API...
echo       In a new terminal: cd d:\credit\api ^&^& pip install -r requirements.txt ^&^& python app.py
echo.

echo ============================================================
echo  DONE!  Now start the React frontend:
echo    cd d:\credit\frontend
echo    npm run dev
echo.
echo  Open: http://localhost:5173
echo  Login: admin@fraudshield.ai / password
echo ============================================================
pause
