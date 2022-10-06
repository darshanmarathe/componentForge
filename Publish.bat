call npm run build
call status
pause
call git add .
call git commit -m %1
call git push
pause
npm publish
