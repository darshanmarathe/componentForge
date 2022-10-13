call git add .
call git commit -m %1
call npm run publish
call status
pause
call git push
pause
npm publish
