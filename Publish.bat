call npm run build
call git add .
call git commit -m %1
call git push
call status
pause
npm publish
