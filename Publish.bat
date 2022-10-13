call git add .
call git commit -m %1
call git push
call npm run publish
call status
pause
pause
npm publish
